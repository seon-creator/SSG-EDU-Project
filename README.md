# 종합 응급 의료 도우미

## 1. 구급대원이 즉시 확인 가능한 병상 여유 응급실 및 도착시간 추적 시스템  
## 2. 증상 진단 및 건강 관리 챗봇 시스템  

---

## Members
- **김종민 (팀장)**: 데이터 전처리 / 회귀 & BERT & ChatBot 모델 학습 및 구현  
- **서선덕**: 웹서비스 구현 / DB 연결 및 스키마 정의 / 응급의료서비스 백엔드 구현  
- **권윤우**: 데이터 전처리 / 자료조사 / 웹 구현 / 배포  
- **김동영**: 지도 API 연결 / 웹 구현 / 배포  
- **안**: 데이터 전처리 / BERT & ChatBot 모델 학습 및 구현 / ChatBot 백엔드 구현  

---

## Dataset
- **부산광역시 구급출동데이터**: 공공데이터  
- **KTAS 기반 제작 데이터**: 자체 제작 데이터  
- **웹 크롤링 데이터**: 하이닥 상담 데이터  

---

## API
- 응급실 실시간 가용병상 정보 API  
- 지도 API  
- OpenAI API  
- Weather API  

---

## 사용 방식

### 1. 응급 의료 서비스
1. **환자 주소 및 증상 입력**  
2. 입력된 증상 기반으로 BERT 모델을 통해 환자 상태를 분석하고 중증/경증 분류 및 진료과 분류(경증) 수행  
3. 각 증상별 병원 안내 제공  
   - **중증 환자**: 추천 응급실 목록 확인  
   - **경증 환자**: 추천 병원 목록 확인  
4. 병원까지의 거리, 예상 시간, 길 안내 제공  
   - 지도 API를 통해 실시간 교통 혼잡도, 예측 시간, 거리 정보 제공  

### 2. 증상 진단 챗봇
1. **챗봇에 증상 및 상태 입력**  
2. 예상 병명, 진료과, 치료 방법 등 안내  
3. 채팅 기록 저장 및 요약 기능 제공  
4. 채팅 기록 기반 건강 보고서 제공  

---

## Frontend & Backend
- **Frontend**: React  
- **Backend**: Node.js, Flask  

---

## Model
### 1. 응급 의료 서비스
- BERT  
- XGBoost  

### 2. 증상 진단 챗봇
- LangChain  
- LLM (GPT-4)  

---

## DB
- **MongoDB**  
- **ChromaDB**  

---

## 개발 규칙
1. **Push 규칙**  
   - 기능이 완벽히 구현된 경우에만 push  
   - Push 전에 팀원에게 알리고 확인 후 진행  
   - Push 완료 후 팀원들은 pull 진행 후 작업 지속  

2. **Commit 규칙**  
   - 업로드 날짜와 부가 설명(한글) 포함  
   - 예시:  
     ```
     10/04 데이터 시각화 기능 추가
     ```

---
