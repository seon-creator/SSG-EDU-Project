from flask import jsonify, request, make_response
from app.services.chat_service import ChatService
import jwt
import os
from typing import Tuple, Dict, Any, Optional
from flask.wrappers import Response
import json

class ChatController:
  def __init__(self):
      self.chat_service = ChatService()

  @staticmethod
  def get_user_id_from_token() -> str:
      """Extract user_id from token"""
      try:
          auth_header = request.headers.get('Authorization')
          if not auth_header:
              raise Exception("No authorization header")

          token = auth_header.replace('Bearer ', '')

          # Giải mã token sử dụng PyJWT
          decoded_token = jwt.decode(
              token,
              os.getenv('ACCESS_TOKEN_SECRET'),
              algorithms=["HS256"]
          )
          print(decoded_token)

          # Lấy user_id từ payload của token
          # Tùy vào cấu trúc token của bạn, có thể thay 'user_id' bằng key khác
          user_id = decoded_token.get('userId')

          if not user_id:
              raise Exception("Invalid token: no user_id found")

          return user_id

      except jwt.ExpiredSignatureError:
          raise Exception("Token has expired")
      except jwt.InvalidTokenError:
          raise Exception("Invalid token")
      except Exception as e:
          raise Exception(f"Authentication error: {str(e)}")
  
  def generate_chat_title(self, session_id: str) -> Response:
    """Generate title for chat session based on first user message and bot response"""
    try:
        user_id = self.get_user_id_from_token()
        
        # Get chat history
        history = self.chat_service.get_chat_history(
            session_id=session_id,
            user_id=user_id,
            page=1,
            limit=50  # Có thể điều chỉnh limit nếu cần
        )
        
        # Get messages from history
        messages = history.get('messages', [])
        if not messages or len(messages) < 2:
            return self.create_response({
                'message': 'Not enough messages in chat history to generate title'
            }, 400)
            
        # Find first user message and first bot response
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
                'message': 'Could not find both user message and bot response'
            }, 400)

        # Generate title using chat service
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
      """Create a standardized JSON response"""
      response_data = {
          'status': 'success' if status_code < 400 else 'error'
      }
      
      # If data has message, move it to top level
      if isinstance(data, dict) and 'message' in data:
          response_data['message'] = data.pop('message')
      
      # Add remaining data
      if data:
          response_data['data'] = data
          
      response = make_response(jsonify(response_data))
      response.headers['Content-Type'] = 'application/json'
      response.status_code = status_code
      return response

  def validate_metadata(self, metadata: Optional[Dict]) -> None:
      """Validate metadata structure and size"""
      if metadata and not isinstance(metadata, dict):
          raise Exception("Metadata must be a dictionary")
      if metadata and len(json.dumps(metadata)) > 1024:
          raise Exception("Metadata too large")

  

  def create_session(self) -> Response:
      """Create new chat session"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          name = data.get('name')
          
          session = self.chat_service.create_session(user_id, name)
          return self.create_response({'session': session}, 201)
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def list_sessions(self) -> Response:
      """List user's chat sessions"""
      try:
          user_id = self.get_user_id_from_token()
          page = int(request.args.get('page', 1))
          limit = int(request.args.get('limit', 20))
          
          sessions = self.chat_service.list_user_sessions(user_id, page, limit)
          return self.create_response({'sessions': sessions})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def get_session(self, session_id: str) -> Response:
      """Get session details"""
      try:
          user_id = self.get_user_id_from_token()
          session = self.chat_service.get_session(session_id, user_id)
          return self.create_response({'session': session})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def update_session_name(self, session_id: str) -> Response:
      """Update session name"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          name = data.get('name')
          
          if not name:
              return self.create_response({'message': 'Name is required'}, 400)
              
          updated_session = self.chat_service.update_session_name(session_id, user_id, name)
          return self.create_response({'session': updated_session})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def delete_session(self, session_id: str) -> Response:
      """Delete chat session"""
      try:
          user_id = self.get_user_id_from_token()
          self.chat_service.delete_session(session_id, user_id)
          return self.create_response({'message': 'Session deleted successfully'})
      except Exception as e:
          return self.create_response({'message': str(e)}, 400)

  def validate_message_content(self, content: Optional[str]) -> None:
      """Validate message content"""
      if not content:
          raise Exception("Content is required")
      if len(content.strip()) == 0:
          raise Exception("Content cannot be empty")
      if len(content) > 50000:
          raise Exception("Content too long. Maximum 5000 characters allowed")

  def send_user_message(self, session_id: str) -> Response:
      """Send user message to chat session"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          
          content = data.get('content')
          self.validate_message_content(content)
          ## later add user info to metadata for chatbot knowledge
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
      """Get bot response for the last user message"""
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
      """Get chat history"""
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
      """Process message with streaming response"""
      try:
          user_id = self.get_user_id_from_token()
          data = request.get_json() or {}
          content = data.get('content')
          
          self.validate_message_content(content)

          def generate():
              # Send user message
              user_message = self.chat_service.send_user_message(
                  session_id=session_id,
                  user_id=user_id,
                  content=content
              )
              yield json.dumps({
                  'type': 'user_message',
                  'data': user_message
              }) + '\n'

              # Stream bot response
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