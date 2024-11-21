# User Controller Documentation:

1. UserController 클래스 (User Controller Class):
   사용자 정보 관리 기능을 제공하는 컨트롤러입니다.

2. 주요 메소드 (Main Methods):

   ## getCurrentUser 메소드:
   - 현재 로그인된 사용자의 정보를 조회합니다.
   - 반환되는 정보:
     - role: 사용자 역할
     - email: 이메일
     - firstName: 이름
     - lastName: 성
     - verified: 인증 상태
   - 404 에러: 사용자를 찾을 수 없는 경우

   ## updateCurrentUser 메소드:
   - 현재 사용자의 정보를 수정합니다.
   - 수정 가능한 필드:
     - firstName: 이름
     - lastName: 성
     - dateOfBirth: 생년월일
     - description: 사용자 설명
   - 응답: 업데이트된 사용자 정보

   ## changePassword 메소드:
   - 사용자 비밀번호를 변경합니다.
   - 필요한 데이터:
     - currentPassword: 현재 비밀번호
     - newPassword: 새 비밀번호
   - 401 에러: 현재 비밀번호가 일치하지 않는 경우

3. 보안 기능:
   - 비밀번호 필드 제외 처리
   - 비밀번호 변경 시 현재 비밀번호 확인
   - 인증된 사용자만 접근 가능

4. 에러 처리:
   - 401: 인증 실패
   - 404: 사용자를 찾을 수 없음
   - 500: 서버 내부 오류

5. 응답 형식:
{
  success: Boolean,
  message: String,
  data: Object | null
}
6. 사용 예시:
// 현재 사용자 정보 조회
GET /api/users/me

// 사용자 정보 수정
PUT /api/users/me
{
  "firstName": "홍",
  "lastName": "길동",
  "dateOfBirth": "1990-01-01",
  "description": "사용자 설명"
}

// 비밀번호 변경
PUT /api/users/change-password
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호"
}