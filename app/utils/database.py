# # app/utils/database.py
# from pymongo import MongoClient
# from flask import current_app, g
# from werkzeug.local import LocalProxy

# # Add database name constant
# DATABASE_NAME = 'test'  # Replace with your actual database name

# def get_db():
#     """
#     Configuration method to return db instance
#     """
#     db = getattr(g, "_database", None)

#     if db is None:
#         client = MongoClient('mongodb+srv://guidetuanhp:Tuanhpvnu%40123@cluster0.2fuwoh0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
#         g._database = client
#         db = client[DATABASE_NAME]  # Explicitly select the database
        
#     return db

# # Use LocalProxy to read the global db instance with just `db`
# db = LocalProxy(get_db)

# def init_db():
#     """
#     Initialize database with required collections and indexes
#     """
#     db = get_db()
    
#     # Create collections if they don't exist
#     if 'users' not in db.list_collection_names():
#         db.create_collection('users')
    
#     if 'chat_sessions' not in db.list_collection_names():
#         db.create_collection('chat_sessions')


# def close_db(e=None):
#     """
#     Close database connection
#     """
#     db = g.pop('_database', None)
    
#     if db is not None:
#         db.close()


from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb+srv://guidetuanhp:Tuanhpvnu%40123@cluster0.2fuwoh0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['test']

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

# Initialize on import
init_db()