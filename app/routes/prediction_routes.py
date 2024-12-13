# app/routes/prediction_routes.py
from flask import Blueprint
from app.controllers.prediction_controller import PredictionController
from app.middlewares.auth_middleware import AuthMiddleware
# Tạo blueprint cho prediction routes
prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/calculate_time', methods=['POST'])
@AuthMiddleware.is_auth
def calculate_time():
  return PredictionController.calculate_time()

@prediction_bp.route('/binary', methods=['POST'])
@AuthMiddleware.is_auth
def predict_binary():
  return PredictionController.predict_binary()

@prediction_bp.route('/multiclass', methods=['POST'])
@AuthMiddleware.is_auth
def predict_multiclass():
  return PredictionController.predict_multiclass()