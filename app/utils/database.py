


from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
mongodb = os.getenv('MONGO_URI')
print("Connected to MongoDB", mongodb)
# Connect to MongoDB
client = MongoClient(mongodb)
db = client['Emergency']

# Get collections
chat_sessions = db.chat_sessions
users = db.users
messages = db.messages

def init_db():
  """Initialize collections"""
  collections = db.list_collection_names()

  if 'users' not in collections:
      db.create_collection('users')
  if 'chat_sessions' not in collections:
      db.create_collection('chat_sessions')
  if 'messages' not in collections:
      db.create_collection('messages')
  if 'reports_chatbot' not in collections:
      db.create_collection('reports_chatbot')

# Initialize on import
init_db()