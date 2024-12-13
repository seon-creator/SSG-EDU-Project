from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId
from langchain_openai import ChatOpenAI
import openai
import re, json
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from app.models.chat import ChatSession, Message, Report
from app.services.knowledge_base import KnowledgeBaseService
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import os
import openai
from dotenv import load_dotenv
load_dotenv()
openapi = os.getenv('OPENAPI_KEY')
class ChatService:
  def __init__(self):
      self.knowledge_base = KnowledgeBaseService()
      self.llm = ChatOpenAI(
          model="gpt-4o",
    openai_api_key=openapi,
          temperature=0.5
      )
      self.client = openai.OpenAI(api_key = openapi)

      # LLM for summary/title generation
      self.llm_summary = ChatOpenAI(
          model="gpt-4o-mini",
          openai_api_key="your-api-key",
          temperature=0.7
      )

      # Define prompt templates
      self.system_template = """당신은 신뢰할 수 있는 의료 상담사 역할을 수행합니다. 사용자가 제공한 정보에 따라 적절한 진단 방향과 조언을 제시하세요. 만약 사용자가 제공한 정보가 부족하다면 추가 질문을 통해 필요한 정보를 수집하세요.

    답변 원칙:
    사용자의 질문과 상황에 따라 유연하고 적절히 대응
    필요한 경우 목록 형식을 사용해 정보를 체계적으로 전달
    복잡한 질문에는 단락으로 구체적이고 자세히 설명
    간단한 질문에는 명확하고 간결하게 답변
    정보를 바탕으로 진단이 어려운 경우, 필요한 추가 질문을 제시
    상담 지침:
    전문적이면서도 친근한 태도를 유지
    의학 용어는 사용자에게 이해하기 쉽게 풀어서 설명
    심각하거나 위험한 증상이 의심되면 즉시 병원 방문을 권고
    부정확하거나 검증되지 않은 정보는 제공하지 않음
    사용자의 불안과 걱정을 공감하며 안심시키는 답변 제공
    답변 구조:
    사용자의 질문과 상황에 따라 유연하고 적절히 대응
    [예상 병명]: 사용자의 증상에 기반하여 가능한 병명을 제안하세요.
    [추천 진료과]: 사용자가 방문하기 적합한 진료과를 추천하세요.
    [치료 및 예방 방법]: 사용자의 증상에 따른 적절한 치료 및 예방 방법을 제시하세요.
    필요 시 추가적인 조언이나 병원 방문 권고를 포함하세요.
      """

      self.human_template = """참고 자료: {context}
대화 기록: {chat_history}
환자의 질문: "{question}"

상황에 맞는 적절한 형식으로 전문적이고 친절하게 답변해 주세요.
      
      """

      # Title prompt template
      self.title_prompt = PromptTemplate(
          input_variables=["question", "answer"],
          template=(
              "Based on the question and answer below, generate a concise title that accurately describes the chat topic:\n\n"
              "Question: {question}\n"
              "Answer: {answer}\n"
              "Title:"
          )
      )
      self.title_chain = self.title_prompt | self.llm_summary

      # Create prompt messages
      self.system_message_prompt = SystemMessagePromptTemplate.from_template(self.system_template)
      self.human_message_prompt = HumanMessagePromptTemplate.from_template(self.human_template)

      # Combine into chat prompt template
      self.chat_prompt = ChatPromptTemplate.from_messages([
          self.system_message_prompt,
          self.human_message_prompt
      ])

      # Initialize memory
      self.memory = ConversationBufferMemory(
          memory_key="chat_history",
          return_messages=True,
          output_key="answer"
      )

      # Create conversational chain
      self.qa_chain = ConversationalRetrievalChain.from_llm(
          llm=self.llm,
          retriever=self.knowledge_base.vector_store.as_retriever(),
          memory=self.memory,
          combine_docs_chain_kwargs={"prompt": self.chat_prompt},
          return_source_documents=True,
          verbose=False
      )

  def generate_chat_title(self, question: str, answer: str) -> str:
      """Generate a chat title based on the question and answer"""
      try:
          response = self.title_chain.invoke({
              "question": question,
              "answer": answer
          })
          return response.content.strip()
      except Exception as e:
          raise Exception(f"Error generating title: {str(e)}")

  def create_session(self, user_id: str, name: Optional[str] = None) -> Dict:
      """Create a new chat session"""
      try:
          session = ChatSession.create(user_id=user_id, name=name)
          return session
      except Exception as e:
          raise Exception(f"Error creating session: {str(e)}")

  def list_user_sessions(self, user_id: str, page: int = 1, limit: int = 20) -> Dict:
      """List all sessions for a user"""
      try:
          skip = (page - 1) * limit
          sessions = ChatSession.list_user_sessions(user_id, skip, limit)
          return {
              'sessions': sessions,
              'page': page,
              'limit': limit
          }
      except Exception as e:
          raise Exception(f"Error listing sessions: {str(e)}")

  def update_session_name(self, session_id: str, user_id: str, name: str) -> Dict:
      """Update chat session name"""
      try:
          if not name or len(name.strip()) == 0:
              raise Exception("Session name cannot be empty")

          session = ChatSession.find_by_id(session_id)
          if not session:
              raise Exception("Session not found")
              
          if str(session['user_id']) != str(user_id):
              raise Exception("Unauthorized access")

          session_obj = ChatSession(**session)
          updated_session = session_obj.update(name=name)
          
          if not updated_session:
              raise Exception("Failed to update session name")

          return ChatSession.to_dict(updated_session)

      except Exception as e:
          raise Exception(f"Error updating session name: {str(e)}")

  def send_user_message(self, session_id: str, user_id: str, content: str) -> Dict:
      """Process and save user message"""
      try:
          session = self.get_session(session_id, user_id)
          if not session:
              raise Exception("Session not found")

          if not content or len(content.strip()) == 0:
              raise Exception("Message content cannot be empty")

          user_message = Message.create(
              session_id=session_id,
              content=content,
              type='user'
          )

          return {
              "status": "success",
              "message": user_message
          }

      except Exception as e:
          raise Exception(f"Error sending user message: {str(e)}")

  def get_bot_response(self, session_id: str, user_id: str, content: str) -> Dict:
      """Generate and save bot response"""
      try:
          session = self.get_session(session_id, user_id)
          if not session:
              raise Exception("Session not found")

          # Get chat history
          history = self.get_formatted_history(session_id)
          
          # Process with QA chain
          result = self.qa_chain({
              "question": content,
              "chat_history": history
          })
          
          # Save bot response
          bot_message = Message.create(
              session_id=session_id,
              content=result['answer'],
              type='bot',
            #   metadata={
            #       'timestamp': datetime.utcnow(),
            #       'status': 'sent'
            #   }
          )

          return {
              "status": "success",
              "message": bot_message,
              "answer": result['answer']
          }

      except Exception as e:
          raise Exception(f"Error generating bot response: {str(e)}")

  def get_formatted_history(self, session_id: str) -> List:
      """Get chat history formatted for LangChain"""
      messages = Message.list_session_messages(session_id)
      formatted_history = []
      
      for msg in messages:
          if msg['type'] == 'bot':
              formatted_history.append(AIMessage(content=msg['content']))
          else:
              formatted_history.append(HumanMessage(content=msg['content']))
              
      return formatted_history

  def get_chat_history(self, session_id: str, user_id: str, page: int = 1, limit: int = 50) -> Dict:
      """Get paginated chat history"""
      try:
          session = self.get_session(session_id, user_id)
          if not session:
              raise Exception("Session not found")

          skip = (page - 1) * limit
          messages = Message.list_session_messages(session_id, skip, limit)
          total = Message.count_session_messages(session_id)

          formatted_messages = []
          for msg in messages:
              formatted_msg = {
                  'id': str(msg['id']),
                  'content': msg['content'],
                  'type': msg['type'],
                  'timestamp': msg.get('metadata', {}).get('timestamp', None),
                  'status': msg.get('metadata', {}).get('status', 'sent')
              }
              
              if msg['type'] == 'bot' and 'metadata' in msg:
                  formatted_msg['sources'] = msg['metadata'].get('sources', [])

              formatted_messages.append(formatted_msg)

          return {
              'messages': formatted_messages,
              'total': total,
              'page': page,
              'limit': limit,
              'has_more': total > skip + limit
          }

      except Exception as e:
          raise Exception(f"Error getting chat history: {str(e)}")

  def get_session(self, session_id: str, user_id: str) -> Dict:
      """Get chat session details"""
      try:
          session = ChatSession.find_by_id(session_id)
          if not session:
              raise Exception("Session not found")
              
          if str(session['user_id']) != str(user_id):
              raise Exception("Unauthorized access")
              
          messages = Message.list_session_messages(session_id)
          session_dict = ChatSession.to_dict(session)
          session_dict['messages'] = messages
          return session_dict
      except Exception as e:
          raise Exception(f"Error getting session: {str(e)}")

  def delete_session(self, session_id: str, user_id: str) -> Dict:
      """Delete a chat session"""
      try:
          if not ObjectId.is_valid(session_id):
              raise ValueError("Invalid session ID format")
              
          session = ChatSession.find_by_id(session_id)
          if not session:
              raise Exception("Session not found")
              
          if str(session['user_id']) != str(user_id):
              raise Exception("Unauthorized access")
              
          Message.delete_by_session(session_id)
          
          session_obj = ChatSession(**session)
          session_obj.delete()
          
          return {
              "message": "Session deleted successfully"
          }
          
      except Exception as e:
          raise Exception(f"Error deleting session: {str(e)}")
  def get_messages_for_user_in_day(self, user_id: str, date: datetime) -> Dict[str, Any]:
    """특정 날짜의 사용자 메시지를 모두 가져와서 하나의 단락으로 결합합니다."""
    try:
        messages = Message.get_messages_for_user_in_day(user_id, date)

        # 메시지 반환 여부 확인
        if messages:
            # 메시지를 하나의 단락으로 결합
            aggregated_message = " ".join(message['content'] for message in messages)
        else:
            aggregated_message = "메시지를 찾을 수 없습니다."

        return {
            "status": "success",
            "messages": aggregated_message
        }
    except Exception as e:
        raise Exception(f"일일 사용자 메시지 조회 중 오류 발생: {str(e)}")

  def analyze_text_and_create_report(self, user_id: str, aggregated_message: str) -> Dict[str, Any]:
    """OpenAI API를 사용하여 메시지를 분석하고 의료 보고서를 생성합니다."""
    if not user_id or not aggregated_message:
        raise ValueError("사용자 ID와 메시지가 필요합니다")

    prompt = (
        f"""다음 메시지를 분석하여 의료 정보를 추출하세요:\n\n
            메시지: {aggregated_message}\n\n
            반드시 JSON 형식으로만 작성하고, 다음의 형식을 준수하세요:
            {{
            "증상": ["여기에 증상을 나열하세요"],
            "심각도": "낮음/중간/높음 중 하나를 입력하세요",
            "진단": "분석한 메시지에서 추출한 진단 결과를 작성하세요",
            "조언": [
                "증상 완화를 위한 조치를 나열하세요",
                "필요할 경우 병원 방문 권장 등의 추가 조언을 포함하세요"
            ]
            }}
            """
    )

    try:
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        
        # 응답에서 JSON 파싱
        analysis_result = response.choices[0].message.content
        print(f"분석 결과: {analysis_result}")
        match = re.search(r'\{.*\}', analysis_result, re.DOTALL)
        if not match:
            raise ValueError("잘못된 API 응답 형식")
           
        analysis_data = json.loads(match.group())
        print(f"분석 데이터: {analysis_data}")
        # 보고서 생성
        report = Report.create(
            user_id=user_id,
            symptoms=analysis_data.get("증상", []),
            severity=analysis_data.get("심각도", ""),
            diagnosis=analysis_data.get("진단", ""),
            advice=analysis_data.get("조언", "")
        )
        print(f"보고서 생성됨: {report}")

        return {"status": "success", "report": report}

    except Exception as e:
        raise Exception(f"분석 실패: {str(e)}")

  def get_user_reports(self, user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
    """
    선택적 날짜 필터링이 있는 사용자의 모든 보고서를 가져옵니다
    
    매개변수:
        user_id (str): 사용자 ID
        start_date (str, optional): 시작 날짜 ('YYYY-MM-DD' 형식)
        end_date (str, optional): 종료 날짜 ('YYYY-MM-DD' 형식)
        
    반환:
        Dict[str, Any]: 상태와 보고서를 포함하는 딕셔너리
    """
    try:
        # 문자열 날짜를 datetime으로 변환
        start_datetime = None
        end_datetime = None
        
        if start_date:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            
        if end_date:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            # 종료 시간을 하루의 끝으로 설정
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)

        # Report 모델을 사용하여 보고서 가져오기
        reports = Report.get_all_user_reports(
            user_id=user_id,
            start_date=start_datetime,
            end_date=end_datetime
        )
        
        if not reports:
            return {
                "status": "success",
                "reports": [],
                "message": "보고서를 찾을 수 없습니다"
            }

        return {
            "status": "success",
            "reports": reports
        }

    except ValueError as e:
        raise ValueError(f"잘못된 날짜 형식입니다. YYYY-MM-DD 형식을 사용하세요: {str(e)}")
    except Exception as e:
        raise Exception(f"사용자 보고서 조회 중 오류 발생: {str(e)}")

  def get_report_for_date(self, user_id: str, date: datetime) -> Optional[Dict[str, Any]]:
    """특정 사용자와 날짜에 대한 보고서를 가져옵니다
    
    매개변수:
        user_id (str): 사용자 ID
        date (datetime): 보고서를 가져올 날짜
        
    반환:
        Optional[Dict[str, Any]]: 보고서 딕셔너리 또는 찾을 수 없는 경우 None
    """
    try:
        # Report 모델에서 보고서 가져오기
        report = Report.get_report_for_date(user_id, date)
        
        if not report:
            return None

        return report

    except Exception as e:
        raise Exception(f"날짜별 보고서 조회 중 오류 발생: {str(e)}")