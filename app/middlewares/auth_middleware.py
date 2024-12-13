from functools import wraps
from flask import request, jsonify
import jwt
from datetime import datetime
import os

class AuthMiddleware:
  @staticmethod
  def is_auth(f):
      @wraps(f)
      def decorated(*args, **kwargs):
          token = None

          # Lấy token từ header Authorization
          auth_header = request.headers.get('Authorization')
          if auth_header:
              token = auth_header.replace('Bearer ', '')

          # Kiểm tra token
          if not token:
              return jsonify({
                  'success': False,
                  'message': 'Authentication required',
                  'data': None
              }), 401

          try:
              # Giải mã token
              decoded = jwt.decode(
                  token, 
                  os.getenv('ACCESS_TOKEN_SECRET'),
                  algorithms=["HS256"]
              )
              # Gán thông tin user vào request
              request.user = decoded

          except jwt.InvalidTokenError:
              return jsonify({
                  'success': False,
                  'message': 'Invalid token',
                  'data': None
              }), 401

          return f(*args, **kwargs)
      return decorated

  @staticmethod
  def has_role(roles=[]):
      def decorator(f):
          @wraps(f)
          def decorated(*args, **kwargs):
              if not request.user.get('role') in roles:
                  return jsonify({
                      'success': False,
                      'message': 'Insufficient permissions',
                      'data': None
                  }), 403
              return f(*args, **kwargs)
          return decorated
      return decorator

  @staticmethod
  def is_admin(f):
      @wraps(f)
      def decorated(*args, **kwargs):
          if request.user.get('role') != 'admin':
              return jsonify({
                  'success': False,
                  'message': 'Admin access required',
                  'data': None
              }), 403
          return f(*args, **kwargs)
      return decorated

  @staticmethod
  def is_doctor(f):
      @wraps(f)
      def decorated(*args, **kwargs):
          if request.user.get('role') != 'doctor':
              return jsonify({
                  'success': False, 
                  'message': 'Doctor access required',
                  'data': None
              }), 403
          return f(*args, **kwargs)
      return decorated

