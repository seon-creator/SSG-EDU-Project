# from datetime import datetime
# from bson import ObjectId
# from app.utils.database import db

# class ChatSession:
#   def __init__(self, **kwargs):
#       self._id = kwargs.get('_id')
#       self.name = kwargs.get('name')
#       self.user_id = kwargs.get('user_id')
#       self.start_time = kwargs.get('start_time', datetime.utcnow())
#       self.end_time = kwargs.get('end_time')
#       self.consultation = kwargs.get('consultation', {
#           'symptoms': [],
#           'severity': None,
#           'diagnosis': None,
#           'advice': None
#       })
#       self.feedback = kwargs.get('feedback', {
#           'rating': None,
#           'comments': None
#       })

#   @staticmethod
#   def create(user_id, name=None):
#       session_data = {
#           'user_id': ObjectId(user_id),
#           'name': name or f"New chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
#           'start_time': datetime.utcnow(),
#           'consultation': {
#               'symptoms': [],
#               'severity': None,
#               'diagnosis': None,
#               'advice': None
#           },
#           'feedback': {
#               'rating': None,
#               'comments': None
#           }
#       }
      
#       try:
#           result = db.chat_sessions.insert_one(session_data)
#           session = ChatSession.find_by_id(result.inserted_id)
#           return ChatSession.to_dict(session)
#       except Exception as e:
#           raise Exception(f"Error creating chat session: {str(e)}")

#   @staticmethod
#   def find_by_id(session_id):
#       if isinstance(session_id, str):
#           session_id = ObjectId(session_id)
#       session = db.chat_sessions.find_one({'_id': session_id})
#       return session

#   @staticmethod
#   def list_user_sessions(user_id, skip=0, limit=20):
#       if isinstance(user_id, str):
#           user_id = ObjectId(user_id)
#       sessions = list(db.chat_sessions.find({'user_id': user_id})
#                    .sort('start_time', -1)
#                    .skip(skip)
#                    .limit(limit))
#       return [ChatSession.to_dict(session) for session in sessions]

#   def update(self, **kwargs):
#       """Update chat session fields"""
#       try:
#           updates = {}
#           allowed_fields = ['name', 'consultation', 'feedback', 'end_time']
          
#           for field in allowed_fields:
#               if field in kwargs:
#                   updates[field] = kwargs[field]

#           if updates:
#               result = db.chat_sessions.update_one(
#                   {'_id': ObjectId(self._id)},
#                   {'$set': updates}
#               )
#               return ChatSession.find_by_id(self._id)
#       except Exception as e:
#           raise Exception(f"Error updating chat session: {str(e)}")

#   def delete(self):
#       """Delete chat session and all related messages"""
#       try:
#           # Delete all messages in session
#           db.messages.delete_many({'session_id': ObjectId(self._id)})
          
#           # Delete session
#           result = db.chat_sessions.delete_one({'_id': ObjectId(self._id)})
#           return True
#       except Exception as e:
#           raise Exception(f"Error deleting chat session: {str(e)}")

#   @staticmethod
#   def to_dict(session):
#       if not session:
#           return None
#       return {
#           'id': str(session['_id']),
#           'user_id': str(session['user_id']),
#           'name': session['name'],
#           'start_time': session['start_time'].isoformat(),
#           'end_time': session['end_time'].isoformat() if session.get('end_time') else None,
#           'consultation': session['consultation'],
#           'feedback': session['feedback']
#       }

# class Message:
#   def __init__(self, **kwargs):
#       self._id = kwargs.get('_id')
#       self.session_id = kwargs.get('session_id')
#       self.type = kwargs.get('type')  # 'user' or 'bot'
#       self.content = kwargs.get('content')
#       self.timestamp = kwargs.get('timestamp', datetime.utcnow())
#       self.metadata = kwargs.get('metadata', {})
#   @staticmethod
#   def create(session_id, content, type='user'):
#       """Create a new message"""
#       try:
#           if isinstance(session_id, str):
#               session_id = ObjectId(session_id)
              
#           message_data = {
#               'session_id': session_id,
#               'type': type,
#               'content': content,
#               'timestamp': datetime.utcnow(),
#               'metadata': {}
#           }
          
#           result = db.messages.insert_one(message_data)
#           print(result)
#           # Lấy message vừa tạo
#           message = db.messages.find_one({'_id': result.inserted_id})
#           return Message.to_dict(message)
#       except Exception as e:
#           raise Exception(f"Error creating message: {str(e)}")

#   @staticmethod
#   def find_by_id(message_id):
#       if isinstance(message_id, str):
#           message_id = ObjectId(message_id)
#       message = db.messages.find_one({'_id': message_id})
#       return message

#   @staticmethod
#   def list_session_messages(session_id, skip=0, limit=50):
#       if isinstance(session_id, str):
#           session_id = ObjectId(session_id)
          
#       messages = list(db.messages.find({'session_id': session_id})
#                    .sort('timestamp', 1)
#                    .skip(skip)
#                    .limit(limit))
#       return [Message.to_dict(message) for message in messages]

#   def update(self, **kwargs):
#       """Update message fields"""
#       try:
#           updates = {}
#           allowed_fields = ['content', 'metadata']
          
#           for field in allowed_fields:
#               if field in kwargs:
#                   updates[field] = kwargs[field]

#           if updates:
#               result = db.messages.update_one(
#                   {'_id': ObjectId(self._id)},
#                   {'$set': updates}
#               )
#               return Message.find_by_id(self._id)
#       except Exception as e:
#           raise Exception(f"Error updating message: {str(e)}")

#   def delete(self):
#       """Delete message"""
#       try:
#           result = db.messages.delete_one({'_id': ObjectId(self._id)})
#           return True
#       except Exception as e:
#           raise Exception(f"Error deleting message: {str(e)}")
#   @staticmethod
#   def count_session_messages(session_id):
#       """Count total messages in a session"""
#       if isinstance(session_id, str):
#           session_id = ObjectId(session_id)
#       return db.messages.count_documents({'session_id': session_id})
#   @staticmethod
#   def get_last_n_messages(session_id, n=10):
#       """Get last n messages from a session"""
#       if isinstance(session_id, str):
#           session_id = ObjectId(session_id)
          
#       messages = list(db.messages.find({'session_id': session_id})
#                    .sort('timestamp', -1)
#                    .limit(n))
#       messages.reverse()  # Reverse to get chronological order
#       return [Message.to_dict(message) for message in messages]

#   @staticmethod
#   def search_messages(session_id, query, skip=0, limit=20):
#       """Search messages in a session"""
#       if isinstance(session_id, str):
#           session_id = ObjectId(session_id)
          
#       messages = list(db.messages.find({
#           'session_id': session_id,
#           'content': {'$regex': query, '$options': 'i'}
#       }).sort('timestamp', 1)
#         .skip(skip)
#         .limit(limit))
#       return [Message.to_dict(message) for message in messages]
#   @staticmethod
#   def to_dict(message):
#       """Convert message document to dictionary"""
#       if not message:
#           return None
          
#       return {
#           'id': str(message['_id']),
#           'session_id': str(message['session_id']),
#           'type': message['type'],
#           'content': message['content'],
#           'timestamp': message['timestamp'].isoformat(),
#           'metadata': message.get('metadata', {})
#       }

  



from datetime import datetime
from bson import ObjectId
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from app.utils.database import db

@dataclass
class Consultation:
  symptoms: List[str] = field(default_factory=list)
  severity: Optional[str] = None
  diagnosis: Optional[str] = None
  advice: Optional[str] = None

@dataclass
class Feedback:
  rating: Optional[int] = None
  comments: Optional[str] = None

class ChatSession:
  def __init__(self, **kwargs):
      self._id: ObjectId = kwargs.get('_id')
      self.name: str = kwargs.get('name')
      self.user_id: ObjectId = kwargs.get('user_id')
      self.start_time: datetime = kwargs.get('start_time', datetime.utcnow())
      self.end_time: Optional[datetime] = kwargs.get('end_time')
      self.consultation: Consultation = Consultation(**kwargs.get('consultation', {}))
      self.feedback: Feedback = Feedback(**kwargs.get('feedback', {}))

  @classmethod
  def create(cls, user_id: str, name: Optional[str] = None) -> Dict[str, Any]:
      session_data = {
          'user_id': ObjectId(user_id),
          'name': name or f"New chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
          'start_time': datetime.utcnow(),
          'consultation': Consultation().__dict__,
          'feedback': Feedback().__dict__
      }
      
      try:
          result = db.chat_sessions.insert_one(session_data)
          session = cls.find_by_id(result.inserted_id)
          return cls.to_dict(session)
      except Exception as e:
          raise Exception(f"Error creating chat session: {str(e)}")

  @classmethod
  def find_by_id(cls, session_id: str) -> Optional[Dict[str, Any]]:
      if isinstance(session_id, str):
          session_id = ObjectId(session_id)
      return db.chat_sessions.find_one({'_id': session_id})

  @classmethod
  def list_user_sessions(cls, user_id: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
      if isinstance(user_id, str):
          user_id = ObjectId(user_id)
      sessions = list(db.chat_sessions.find({'user_id': user_id})
                   .sort('start_time', -1)
                   .skip(skip)
                   .limit(limit))
      return [cls.to_dict(session) for session in sessions]

  def update(self, **kwargs) -> Optional[Dict[str, Any]]:
      try:
          updates = {}
          allowed_fields = ['name', 'consultation', 'feedback', 'end_time']
          
          for field in allowed_fields:
              if field in kwargs:
                  updates[field] = kwargs[field]

          if updates:
              result = db.chat_sessions.update_one(
                  {'_id': ObjectId(self._id)},
                  {'$set': updates}
              )
              return self.find_by_id(self._id)
      except Exception as e:
          raise Exception(f"Error updating chat session: {str(e)}")

  def delete(self) -> bool:
      try:
          db.messages.delete_many({'session_id': ObjectId(self._id)})
          db.chat_sessions.delete_one({'_id': ObjectId(self._id)})
          return True
      except Exception as e:
          raise Exception(f"Error deleting chat session: {str(e)}")

  @staticmethod
  def to_dict(session: Dict[str, Any]) -> Optional[Dict[str, Any]]:
      if not session:
          return None
      return {
          'id': str(session['_id']),
          'user_id': str(session['user_id']),
          'name': session['name'],
          'start_time': session['start_time'].isoformat(),
          'end_time': session['end_time'].isoformat() if session.get('end_time') else None,
          'consultation': session['consultation'],
          'feedback': session['feedback']
      }

@dataclass
class MessageMetadata:
  intent: Optional[str] = None
  confidence: Optional[float] = None
  entities: List[Dict[str, Any]] = field(default_factory=list)

class Message:
  def __init__(self, **kwargs):
      self._id: ObjectId = kwargs.get('_id')
      self.session_id: ObjectId = kwargs.get('session_id')
      self.type: str = kwargs.get('type')
      self.content: str = kwargs.get('content')
      self.timestamp: datetime = kwargs.get('timestamp', datetime.utcnow())
      self.metadata: Dict = kwargs.get('metadata', {})

  @classmethod
  def create(cls, session_id: str, content: str, type: str = 'user', metadata: Dict = None) -> Dict[str, Any]:
      try:
          if isinstance(session_id, str):
              session_id = ObjectId(session_id)
              
          message_data = {
              'session_id': session_id,
              'type': type,
              'content': content,
              'timestamp': datetime.utcnow(),
              'metadata': metadata or {}
          }
          
          result = db.messages.insert_one(message_data)
          message = db.messages.find_one({'_id': result.inserted_id})
          return cls.to_dict(message)
      except Exception as e:
          raise Exception(f"Error creating message: {str(e)}")

  @classmethod
  def find_by_id(cls, message_id: str) -> Optional[Dict[str, Any]]:
      if isinstance(message_id, str):
          message_id = ObjectId(message_id)
      return db.messages.find_one({'_id': message_id})

  @classmethod
  def list_session_messages(cls, session_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
      if isinstance(session_id, str):
          session_id = ObjectId(session_id)
          
      messages = list(db.messages.find({'session_id': session_id})
                   .sort('timestamp', 1)
                   .skip(skip)
                   .limit(limit))
      return [cls.to_dict(message) for message in messages]

  def update(self, **kwargs) -> Optional[Dict[str, Any]]:
      try:
          updates = {}
          allowed_fields = ['content', 'metadata']
          
          for field in allowed_fields:
              if field in kwargs:
                  updates[field] = kwargs[field]

          if updates:
              result = db.messages.update_one(
                  {'_id': ObjectId(self._id)},
                  {'$set': updates}
              )
              return self.find_by_id(self._id)
      except Exception as e:
          raise Exception(f"Error updating message: {str(e)}")

  def delete(self) -> bool:
      try:
          result = db.messages.delete_one({'_id': ObjectId(self._id)})
          return True
      except Exception as e:
          raise Exception(f"Error deleting message: {str(e)}")
  @classmethod
  def delete_by_session(cls, session_id: str) -> bool:
      """Delete all messages in a session"""
      try:
          if isinstance(session_id, str):
              session_id = ObjectId(session_id)
          
          result = db.messages.delete_many({'session_id': session_id})
          return True
      except Exception as e:
          raise Exception(f"Error deleting messages: {str(e)}")
  @classmethod
  def count_session_messages(cls, session_id: str) -> int:
      if isinstance(session_id, str):
          session_id = ObjectId(session_id)
      return db.messages.count_documents({'session_id': session_id})

  @classmethod
  def get_last_n_messages(cls, session_id: str, n: int = 10) -> List[Dict[str, Any]]:
      if isinstance(session_id, str):
          session_id = ObjectId(session_id)
          
      messages = list(db.messages.find({'session_id': session_id})
                   .sort('timestamp', -1)
                   .limit(n))
      messages.reverse()
      return [cls.to_dict(message) for message in messages]

  @classmethod
  def search_messages(cls, session_id: str, query: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
      if isinstance(session_id, str):
          session_id = ObjectId(session_id)
          
      messages = list(db.messages.find({
          'session_id': session_id,
          'content': {'$regex': query, '$options': 'i'}
      }).sort('timestamp', 1)
        .skip(skip)
        .limit(limit))
      return [cls.to_dict(message) for message in messages]

  @staticmethod
  def to_dict(message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
      if not message:
          return None
          
      return {
          'id': str(message['_id']),
          'session_id': str(message['session_id']),
          'type': message['type'],
          'content': message['content'],
          'timestamp': message['timestamp'].isoformat(),
          'metadata': message.get('metadata', {})
      }