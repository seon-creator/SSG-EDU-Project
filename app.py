from flask import Flask, render_template, request, jsonify
import requests
import pickle
from urllib.parse import quote

app = Flask(__name__)

# 학습된 모델 로드
with open("trained_model.pkl", "rb") as f:
    model = pickle.load(f)

# API 키 설정
NAVER_CLIENT_ID = '동영님꺼'
NAVER_CLIENT_SECRET = '동영님꺼'
OPENWEATHER_API_KEY = 'ef2f4586cb31dba1c1a1f9ee0f27b078'

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_distance")
def get_distance():
    try:
        address = request.args.get('address')
        encoded_address = quote(address)

        # 네이버 지도 API 호출 (주소 -> 좌표 변환)
        geo_url = f"https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query={encoded_address}"
        headers = {
            "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
            "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
        }
        response = requests.get(geo_url, headers=headers)
        response.raise_for_status()

        geo_data = response.json()
        if 'addresses' not in geo_data or not geo_data['addresses']:
            return jsonify({"error": "유효한 주소를 찾을 수 없습니다."}), 400

        lat, lon = geo_data['addresses'][0]['y'], geo_data['addresses'][0]['x']

        # Directions API로 자동차 경로 탐색
        center_lat, center_lon = '35.1796', '129.0756'
        direction_url = (
            f"https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"
            f"?start={lon},{lat}&goal={center_lon},{center_lat}&option=traoptimal"
        )
        direction_response = requests.get(direction_url, headers=headers).json()

        if 'route' not in direction_response:
            return jsonify({"error": "경로 정보를 가져올 수 없습니다."}), 500

        path = direction_response['route']['traoptimal'][0]['path']
        distance = direction_response['route']['traoptimal'][0]['summary']['distance'] / 1000

        return jsonify({"distance": distance, "path": path, "lat": lat, "lon": lon})

    except requests.exceptions.RequestException as e:
        print(f"네이버 지도 API 호출 오류: {e}")
        return jsonify({"error": "네이버 지도 API 호출에 실패했습니다."}), 500

@app.route("/get_weather")
def get_weather():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')

        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(weather_url)
        response.raise_for_status()

        weather_data = response.json()
        temperature = weather_data['main']['temp']
        wind_speed = weather_data['wind']['speed']
        humidity = weather_data['main']['humidity']

        return jsonify({"temperature": temperature, "wind_speed": wind_speed, "humidity": humidity})

    except requests.exceptions.RequestException as e:
        print(f"OpenWeather API 오류: {e}")
        return jsonify({"error": "날씨 정보를 가져오는 데 실패했습니다."}), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print(f"받은 데이터: {data}")

        required_keys = ["distance", "temperature", "wind_speed", "humidity"]
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            return jsonify({"error": f"필수 데이터가 누락되었습니다: {', '.join(missing_keys)}"}), 400

        distance = data["distance"]
        temperature = data["temperature"]
        wind_speed = data["wind_speed"]
        humidity = data["humidity"]

        prediction = model.predict([[distance, temperature, wind_speed, humidity]])
        estimated_time = float(prediction[0])

        return jsonify({"estimated_time": estimated_time})

    except Exception as e:
        print(f"예측 오류: {e}")
        return jsonify({"error": "예측 과정에서 오류가 발생했습니다."}), 500

if __name__ == "__main__":
    app.run(debug=True)
