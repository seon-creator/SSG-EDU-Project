1.	User 스키마:
	•	id: 유저의 고유 ID입니다.
	•	password: 비밀번호입니다.
	•	location: 유저의 위치 정보를 저장하는 필드입니다.
	•	reports: 유저가 신고한 내용들을 저장하며, Report 스키마의 ObjectId를 참조하는 리스트로 구성되어 있습니다.
    
2.	Report 스키마:
	•	user: 해당 리포트를 생성한 유저의 ObjectId를 참조합니다.
	•	patientLocation: 환자의 위치 정보를 저장합니다.
	•	symptom: 환자의 증상을 문자열로 저장합니다.
	•	isSevere: 중증 여부를 Boolean 값으로 저장합니다.
	•	isCreated: 리포트 생성일을 저장하며, 기본값으로 현재 시간이 설정됩니다.
