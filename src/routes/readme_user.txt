User Routes Documentation:
사용자 라우트 개요 (User Routes Overview):
일반 사용자를 위한 API 엔드포인트를 정의하는 라우터입니다.
공통 미들웨어 (Common Middleware):
isAuth: 사용자 인증 확인 필수
엔드포인트 상세 (Endpoint Details):
현재 사용자 정보 조회
javascript
Copy Code
    GET /api/v1/users/me
권한: 인증된 사용자
기능: 비밀번호 변경
요청 본문:
currentPassword: 현재 비밀번호
newPassword: 새 비밀번호
사용 예시 (Usage Example):
javascript
Copy Code
// 내 정보 조회
GET /api/v1/users/me

// 프로필 정보 수정
PUT /api/v1/users/me
{
  "firstName": "홍",
  "lastName": "길동",
  "dateOfBirth": "1990-01-01",
  "description": "안녕하세요"
}

// 비밀번호 변경
PATCH /api/v1/users/change-password
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호"
}
보안 사항 (Security Notes):
모든 엔드포인트는 인증 필요
JWT 토큰 기반 인증
자신의 정보만 접근 가능
응답 형식 (Response Format):
javascript
Copy Code
{
  success: Boolean,
  message: String,
  data: Object | null
}