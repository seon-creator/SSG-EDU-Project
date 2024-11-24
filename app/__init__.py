# app/__init__.py
from flask import Flask
from app.routes.chat_routes import chat_bp
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
  app = Flask(__name__)
  # CORS Configuration
  CORS(app, resources={
      r"/api/*": {
          "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
          "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          "allow_headers": ["Content-Type", "Authorization"],
          "supports_credentials": True
      }
  })
  # Register blueprints
  app.register_blueprint(chat_bp, url_prefix='/api/chat')

  return app