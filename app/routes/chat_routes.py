# app/routes/chat_routes.py
from flask import Blueprint
from app.controllers.chat_controller import ChatController
from app.middlewares.auth_middleware import AuthMiddleware

chat_bp = Blueprint('chat', __name__)
controller = ChatController()

# Session Routes
@chat_bp.route('/sessions', methods=['POST'])
@AuthMiddleware.is_auth
def create_session():
  """Create a new chat session"""
  return controller.create_session()

@chat_bp.route('/sessions', methods=['GET'])
@AuthMiddleware.is_auth
def list_sessions():
  """List all chat sessions for current user"""
  return controller.list_sessions()

@chat_bp.route('/sessions/<session_id>', methods=['GET'])
@AuthMiddleware.is_auth
def get_session(session_id):
  """Get details of a specific chat session"""
  return controller.get_session(session_id)

@chat_bp.route('/sessions/<session_id>/name', methods=['PUT'])
@AuthMiddleware.is_auth
def update_session_name(session_id):
  """Update the name of a chat session"""
  return controller.update_session_name(session_id)

@chat_bp.route('/sessions/<session_id>', methods=['DELETE'])
@AuthMiddleware.is_auth
def delete_session(session_id):
  """Delete a chat session"""
  return controller.delete_session(session_id)

# Message Routes
@chat_bp.route('/sessions/<session_id>/messages/user', methods=['POST'])
@AuthMiddleware.is_auth
def send_user_message(session_id):
  """Send a user message in the chat session"""
  return controller.send_user_message(session_id)

@chat_bp.route('/sessions/<session_id>/messages/bot', methods=['POST'])
@AuthMiddleware.is_auth
def get_bot_response(session_id):
  """Get bot response for the last user message"""
  return controller.get_bot_response(session_id)

@chat_bp.route('/sessions/<session_id>/messages/stream', methods=['POST'])
@AuthMiddleware.is_auth
def process_message_stream(session_id):
  """Process message with streaming response"""
  return controller.process_message_stream(session_id)

@chat_bp.route('/sessions/<session_id>/history', methods=['GET'])
@AuthMiddleware.is_auth
def get_chat_history(session_id):
  """Get chat history for a session"""
  return controller.get_chat_history(session_id)

@chat_bp.route('/sessions/<session_id>/title', methods=['POST'])
@AuthMiddleware.is_auth
def generate_chat_title(session_id):
  """Generate title for chat session based on first messages"""
  return controller.generate_chat_title(session_id)
@chat_bp.route('/daily-report/<date_str>', methods=['GET'])
@AuthMiddleware.is_auth
def daily_report(date_str):
  """Get all messages for the user in a specific day and create a medical report"""
  return controller.get_daily_messages_and_report(date_str)
@chat_bp.route('/reports', methods=['POST'])
@AuthMiddleware.is_auth
def post_user_reports():
    """Get all medical reports for the current user with date filtering via POST body"""
    return controller.post_user_reports()
# Optional: Health check route
@chat_bp.route('/health', methods=['GET'])
def health_check():
  """Health check endpoint"""
  return controller.create_response({
      'status': 'healthy',
      'version': '1.0.0'
  })