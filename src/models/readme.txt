1.	Report 스키마:
	•	user: 해당 리포트를 생성한 유저의 ObjectId를 참조합니다.
	•	patientLocation: 환자의 위치 정보를 저장합니다.
	•	symptom: 환자의 증상을 문자열로 저장합니다.
	•	isSevere: 중증 여부를 Boolean 값으로 저장합니다.
	•	isCreated: 리포트 생성일을 저장하며, 기본값으로 현재 시간이 설정됩니다.

2.  User 스키마 (User Schema):
    email: 사용자의 이메일 주소를 저장합니다. 필수이며 고유값입니다.
    password: 사용자의 비밀번호를 저장합니다. 해시화되어 저장되며 최소 8자 이상이어야 합니다.
    firstName: 사용자의 이름을 저장합니다.
    lastName: 사용자의 성을 저장합니다.
    dateOfBirth: 사용자의 생년월일을 저장합니다.
    description: 사용자에 대한 설명을 저장합니다.
    role: 사용자의 역할을 저장합니다. ("user", "doctor", "admin" 중 하나)
    verified: 이메일 인증 여부를 저장합니다.
    status: 계정 상태를 저장합니다. ("active", "inactive", "suspended" 중 하나)
    주요 기능:
    fullName: 가상 필드로 성과 이름을 결합하여 전체 이름을 제공합니다.
    비밀번호 해시화: 저장 전 자동으로 비밀번호를 해시화합니다.
    비밀번호 비교: 입력된 비밀번호와 저장된 해시화된 비밀번호를 비교합니다.
    스키마 옵션:
    timestamps: 생성 및 수정 시간을 자동으로 기록합니다.
    virtuals: JSON 변환 시 가상 필드를 포함합니다.