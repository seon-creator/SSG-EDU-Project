from flask import jsonify, request, make_response
from app.services.chat_service import ChatService
import jwt
import os
from typing import Tuple, Dict, Any, Optional
from flask.wrappers import Response
import json
from datetime import datetime
class ChatController:
  def __init__(self):
      self.chat_service = ChatService()

  @staticmethod
  def get_user_id_from_token() -> str:
      """토큰에서 user_id 추출"""
      try:
          auth_header = request.headers.get('Authorization')
          if not auth_header:
              raise Exception("인증 헤더가 없습니다")

          token = auth_header.replace('Bearer ', '')

          # PyJWT를 사용하여 토큰 디코딩
          decoded_token = jwt.decode(
              token,
              os.getenv('ACCESS_TOKEN_SECRET'),
              algorithms=["HS256"]
          )
          print(decoded_token)

          # 토큰의 페이로드에서 user_id 가져오기
          # 토큰 구조에 따라 'user_id'를 다른 키로 변경할 수 있습니다
          user_id = decoded_token.get('userId')

          if not user_id:
              raise Exception("유효하지 않은 토큰: user_id가 없습니다")

          return user_id

      except jwt.ExpiredSignatureError:
          raise Exception("토큰이 만료되었습니다")
      except jwt.InvalidTokenError:
          raise Exception("유효하지 않은 토큰")
      except Exception as e:
          raise Exception(f"인증 오류: {str(e)}")
  
  def generate_chat_title(self, session_id: str) -> Response:
    """첫 번째 사용자 메시지와 봇 응답을 기반으로 채팅 세션 제목 생성"""
    try:
        user_id = self.get_user_id_from_token()
        
        # 채팅 기록 가져오기
        history = self.chat_service.get_chat_history(
            session_id=session_id,
            user_id=user_id,
            page=1,
            limit=50  # 필요에 따라 limit 조정 가능
        )
        
        # 기록에서 메시지 가져오기
        messages = history.get('messages', [])
        if not messages or len(messages) < 2:
            return self.create_response({
                'message': '채팅 기록에 제목을 생성할 충분한 메시지가 없습니다'
            }, 400)
            
        # 첫 번째 사용자 메시지와 첫 번째 봇 응답 찾기
        first_user_msg = None
        first_bot_msg = None
        
        for msg in messages:
            if not first_user_msg and msg['type'] == 'user':
                first_user_msg = msg
            if not first_bot_msg and msg['type'] == 'bot':
                first_bot_msg = msg
            if first_user_msg and first_bot_msg:
                break
                
        if not first_user_msg or not first_bot_msg:
            return self.create_response({
                'message': '사용자 메시지와 봇 응답을 모두 찾을 수 없습니다'
            }, 400)

        # 채팅 서비스를 사용하여 제목 생성
        title = self.chat_service.generate_chat_title(
            question=first_user_msg['content'],
            answer=first_bot_msg['content']
        )
        
        return self.create_response({
            'title': title
        })
        
    except Exception as e:
        return self.create_response({
            'message': str(e),
            'error_details': {
                'session_id': session_id
            }
        }, 400)
  def create_response(self, data: Dict, status_code: int = 200) -> Response:
      """표준화된 JSON 응답 생성"""
      response_data = {
          'status': 'success' if status_code < 400 else 'error'
      }
      
      # 데이터에 메시지가 있으면 최상위 레벨로 이동
      if isinstance(data, dict) and 'message' in data:
          response_data['message'] = data.pop('message')
      
      # 남은 데이터 추가
      if data:
          response_data['data'] = data
          
      response = make_response(jsonify(response_data))
      response.headers['Content-Type'] = 'application/json'
      response.status_code = status_code
      return response

  def validate_metadata(self, metadata: Optional[Dict]) -> None:
      """메타데이터 구조 및 크기 검증"""
      if metadata and not isinstance(metadata, dict):
          raise Exception("메타데이터는 딕셔너리여야 합니다")
      if metadata and len(json.dumps(metadata)) > 1024:
          raise Exception("메타데이터가 너무 큽니다")

  

  def create_session(self) -> Response:
      """새 채팅 세션 생성"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          name = data.get('name')
          
          session = self.chat_service.create_session(user_id, name)
          return self.create_response({'session': session}, 201)
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def list_sessions(self) -> Response:
      """사용자의 채팅 세션 목록"""
      try:
          user_id = self.get_user_id_from_token()
          page = int(request.args.get('page', 1))
          limit = int(request.args.get('limit', 20))
          
          sessions = self.chat_service.list_user_sessions(user_id, page, limit)
          return self.create_response({'sessions': sessions})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def get_session(self, session_id: str) -> Response:
      """세션 세부 정보 가져오기"""
      try:
          user_id = self.get_user_id_from_token()
          session = self.chat_service.get_session(session_id, user_id)
          return self.create_response({'session': session})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def update_session_name(self, session_id: str) -> Response:
      """세션 이름 업데이트"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          name = data.get('name')
          
          if not name:
              return self.create_response({'message': '이름이 필요합니다'}, 400)
              
          updated_session = self.chat_service.update_session_name(session_id, user_id, name)
          return self.create_response({'session': updated_session})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def delete_session(self, session_id: str) -> Response:
      """채팅 세션 삭제"""
      try:
          user_id = self.get_user_id_from_token()
          self.chat_service.delete_session(session_id, user_id)
          return self.create_response({'message': '세션이 성공적으로 삭제되었습니다'})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def validate_message_content(self, content: Optional[str]) -> None:
      """메시지 내용 검증"""
      if not content:
          raise Exception("내용이 필요합니다")
      if len(content.strip()) == 0:
          raise Exception("내용은 비어 있을 수 없습니다")
      if len(content) > 50000:
          raise Exception("내용이 너무 깁니다. 최대 5000자까지 허용됩니다")

  def send_user_message(self, session_id: str) -> Response:
      """채팅 세션에 사용자 메시지 보내기"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          
          content = data.get('content')
          self.validate_message_content(content)
          ## 나중에 챗봇 지식을 위해 사용자 정보를 메타데이터에 추가
        #   metadata = data.get('metadata', {})
        #   self.validate_metadata(metadata)

          user_message = self.chat_service.send_user_message(
              session_id=session_id,
              user_id=user_id,
              content=content,
            #   metadata=metadata
          )
          print(user_message)
          return self.create_response({
              'message': user_message
          })
          
      except Exception as e:
          return self.create_response({
              'message': str(e),
              'error_details': {
                  'session_id': session_id,
                  'content_length': len(data.get('content', '')) if data else 0
              }
          }, 400)

  def get_bot_response(self, session_id: str) -> Response:
      """마지막 사용자 메시지에 대한 봇 응답 가져오기"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          
          content = data.get('content')
          self.validate_message_content(content)
          
        #   context = data.get('context', {})
        #   options = data.get('options', {})
        #   self.validate_metadata(context)
        #   self.validate_metadata(options)

          bot_response = self.chat_service.get_bot_response(
              session_id=session_id,
              user_id=user_id,
              content=content,
            #   context=context,
            #   options=options
          )

          return self.create_response({
              'response': bot_response
          })
          
      except Exception as e:
          return self.create_response({
              'message': str(e),
              'error_details': {
                  'session_id': session_id,
                  'content_length': len(data.get('content', '')) if data else 0
                #   'has_context': bool(data.get('context')),
                #   'has_options': bool(data.get('options'))
              }
          }, 400)

  def get_chat_history(self, session_id: str) -> Response:
      """채팅 기록 가져오기"""
      try:
          user_id = self.get_user_id_from_token()
          page = int(request.args.get('page', 1))
          limit = int(request.args.get('limit', 50))
          
          history = self.chat_service.get_chat_history(
              session_id=session_id,
              user_id=user_id,
              page=page,
              limit=limit
          )
          
          formatted_history = [msg for msg in history['messages']]
          return self.create_response({'history': formatted_history})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def process_message_stream(self, session_id: str) -> Response:
      """스트리밍 응답으로 메시지 처리"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          content = data.get('content')
          
          self.validate_message_content(content)

          def generate():
              # 사용자 메시지 보내기
              user_message = self.chat_service.send_user_message(
                  session_id=session_id,
                  user_id=user_id,
                  content=content
              )
              yield json.dumps({
                  'type': 'user_message',
                  'data': user_message
              }) + '\n'

              # 봇 응답 스트리밍
              for chunk in self.chat_service.get_bot_response_stream(
                  session_id=session_id,
                  user_id=user_id,
                  content=content
              ):
                  yield json.dumps({
                      'type': 'bot_response',
                      'data': chunk
                  }) + '\n'

          return Response(
              generate(),
              mimetype='text/event-stream',
              headers={
                  'Cache-Control': 'no-cache',
                  'Transfer-Encoding': 'chunked'
              }
          )
      except Exception as e:
          return self.create_response({
              'message': str(e),
              'error_details': {
                  'session_id': session_id,
                  'content_length': len(data.get('content', '')) if data else 0
              }
          }, 400)
  def get_daily_messages_and_report(self, date_str: str) -> Response:
    """사용자의 하루 메시지를 모두 가져오고 의료 보고서를 생성합니다."""
    try:
        # 날짜 문자열 유효성 검사
        if not date_str:
            return self.create_response({'message': '날짜를 비워둘 수 없습니다'}, 400)

        # 사용자 가져오기 및 날짜 변환
        user_id = self.get_user_id_from_token()
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return self.create_response({'message': '날짜 형식이 잘못되었습니다 (YYYY-MM-DD)'}, 400)

        # 기존 보고서 확인
        existing_report = self.chat_service.get_report_for_date(user_id, date)
        if existing_report:
            return self.create_response({
                'report': existing_report,
                'message': '기존 보고서를 불러왔습니다'
            })

        # 메시지 가져오기 및 보고서 생성
        messages_response = self.chat_service.get_messages_for_user_in_day(user_id, date)
        aggregated_message = messages_response.get("messages", "")

        if not aggregated_message or "메시지를 찾을 수 없습니다." in aggregated_message:
            return self.create_response({
                'messages': [],
                'report': None,
                'message': '이 날짜에 메시지가 없습니다'
            })
        
        report_response = self.chat_service.analyze_text_and_create_report(user_id, aggregated_message)
        
        if report_response['status'] != 'success':
            return self.create_error_response('보고서 생성에 실패했습니다')
            
        return self.create_response({
            'message': '보고서 생성이 완료되었습니다',
            'report': report_response['report']
        })

    except Exception as e:
        return self.create_response({'message': str(e)}, 500)

  def post_user_reports(self) -> Response:
    """사용자의 모든 보고서를 날짜 필터링과 함께 가져옵니다"""
    try:
        # 토큰에서 사용자 ID 가져오기
        user_id = self.get_user_id_from_token()
        
        # JSON 요청 본문에서 날짜 매개변수 가져오기
        request_data = request.get_json()
        start_date = request_data.get('start_date')
        end_date = request_data.get('end_date')

        # 제공된 날짜 유효성 검사
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                return self.create_response({
                    'message': '시작 날짜 형식이 잘못되었습니다. YYYY-MM-DD 형식을 사용하세요'
                }, 400)

        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                return self.create_response({
                    'message': '종료 날짜 형식이 잘못되었습니다. YYYY-MM-DD 형식을 사용하세요'
                }, 400)

        # 채팅 서비스를 사용하여 보고서 가져오기
        reports = self.chat_service.get_user_reports(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )

        return self.create_response({
            'reports': reports.get('reports', []),
            'message': reports.get('message')
        })

    except Exception as e:
        return self.create_response({
            'message': str(e),
            'error_details': {
                'start_date': request_data.get('start_date') if 'request_data' in locals() else None,
                'end_date': request_data.get('end_date') if 'request_data' in locals() else None
            }
        }, 400)
  