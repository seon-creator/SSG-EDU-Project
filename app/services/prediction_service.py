import tensorflow as tf
import numpy as np
import pandas as pd
import requests
import pickle
from transformers import BertTokenizer, TFBertForSequenceClassification

class PredictionService:
  def __init__(self):
      self.OPENWEATHER_API_KEY = '4d75116f14af944cb4a1944dcca47349'
      self.load_models()

  def load_models(self):
      # Load all models and tokenizers here
      with open("app/models/xgboost_model.pkl", "rb") as f:
          self.xgb_model = pickle.load(f)

      self.binary_tokenizer = BertTokenizer.from_pretrained('klue/bert-base')
      self.binary_model = TFBertForSequenceClassification.from_pretrained('klue/bert-base', num_labels=2)
      self.binary_model.load_weights('app/models/classify_severe_model.h5')

      self.multiclass_tokenizer = BertTokenizer.from_pretrained('klue/bert-base')
      self.multiclass_model = TFBertForSequenceClassification.from_pretrained('klue/bert-base', num_labels=12)
      self.multiclass_model.load_weights('app/models/classify_multiple_model.h5')

      self.id2label = {
          0: "내과", 1: "비뇨의학과", 2: "산부인과", 3: "신경과",
          4: "안과", 5: "외과", 6: "이비인후과",
          7: "정신의학과", 8: "정형외과", 9: "치과", 10: "피부과"
      }

  def get_weather_data(self, start_lat, start_lon):
      try:
          weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={start_lat}&lon={start_lon}&appid={self.OPENWEATHER_API_KEY}&units=metric"
          response = requests.get(weather_url)
          data = response.json()

          temperature = data['main']['temp']
          wind_speed = data['wind']['speed']
          humidity = data['main']['humidity']
          return temperature, wind_speed, humidity
      except Exception as e:
          print(f"Weather data error: {e}")
          return 20, 5, 50

  def predict_time(self, distance, temp, wind_speed, humidity):
      try:
          distance = float(distance)
          input_df = pd.DataFrame({
              'spt_frstt_dist': [distance],
              'time_unit_tmprt': [temp],
              'time_unit_ws': [wind_speed],
              'time_unit_humidity': [humidity]
          })
          predicted_log_time = self.xgb_model.predict(input_df)
          predicted_time_minutes = np.expm1(predicted_log_time)[0] / 60
          return predicted_time_minutes
      except Exception as e:
          print(f"Prediction error: {e}")
          return None

  def preprocess_text(self, text, tokenizer, max_length=128):
      encoding = tokenizer(
          text,
          truncation=True,
          padding='max_length',
          max_length=max_length,
          return_tensors="tf"
      )
      return {
          'input_ids': encoding['input_ids'],
          'attention_mask': encoding['attention_mask']
      }

  def predict_patient_status(self, input_text):
      try:
          inputs = self.preprocess_text(input_text, self.binary_tokenizer)
          outputs = self.binary_model(**inputs)
          predicted_class = tf.argmax(outputs['logits'], axis=1).numpy()[0]
          return '중증' if predicted_class == 1 else '경증'
      except Exception as e:
          print(f"Binary classification error: {e}")
          return "예측 실패"

  def predict_department(self, input_text):
      try:
          inputs = self.preprocess_text(input_text, self.multiclass_tokenizer)
          outputs = self.multiclass_model(**inputs)
          predicted_class_idx = tf.argmax(outputs['logits'], axis=1).numpy()[0]
          return self.id2label.get(predicted_class_idx, "예측 실패")
      except Exception as e:
          print(f"Department prediction error: {e}")
          return "예측 실패"