from typing import Dict, List, Optional
from datetime import datetime
from bson import ObjectId
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from app.models.chat import ChatSession, Message
from app.services.knowledge_base import KnowledgeBaseService
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

class ChatService:
  def __init__(self):
      self.knowledge_base = KnowledgeBaseService()
      self.llm = ChatOpenAI(
          model="gpt-4o",
    openai_api_key="",
          temperature=0.5
      )

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
              metadata={
                  'timestamp': datetime.utcnow(),
                  'status': 'sent'
              }
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