from flask import request, jsonify
from app.services.prediction_service import PredictionService

class PredictionController:
  prediction_service = PredictionService()

  @staticmethod
  def calculate_time():
      try:
          data = request.get_json()
          start_lat = data.get('startLat')
          start_lon = data.get('startLon')
          distance = data.get('distance')

          if None in [start_lat, start_lon, distance]:
              return jsonify({"error": "Invalid data"}), 400

          temperature, wind_speed, humidity = PredictionController.prediction_service.get_weather_data(start_lat, start_lon)
          estimated_time = PredictionController.prediction_service.predict_time(distance, temperature, wind_speed, humidity)

          if estimated_time is None:
              return jsonify({"error": "Prediction failed"}), 500

          return jsonify({"estimated_time": int(estimated_time)})
      except Exception as e:
          return jsonify({"error": str(e)}), 500

  @staticmethod
  def predict_binary():
      try:
          data = request.json
          symptoms = data.get('symptoms', '')
          result = PredictionController.prediction_service.predict_patient_status(symptoms)
          return jsonify({'result': result})
      except Exception as e:
          return jsonify({'error': str(e)}), 500

  @staticmethod
  def predict_multiclass():
      try:
          data = request.json
          # 증상 정보를 받음
          symptoms = data.get('symptoms', '')
          # 추론 코드 실행
          predicted_department = PredictionController.prediction_service.predict_department(symptoms)
          return jsonify({'predicted_department': predicted_department})
      except Exception as e:
          return jsonify({'error': str(e)}), 500