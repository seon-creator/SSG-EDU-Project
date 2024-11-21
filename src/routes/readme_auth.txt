POST /api/v1/auth/register
권한: 공개
기능: 새로운 사용자 등록
요청 본문:
email: 이메일
password: 비밀번호
firstName: 이름
lastName: 성
role: 역할 (선택사항)
응답: 사용자 정보 및 이메일 인증 안내

POST /api/v1/auth/login
권한: 공개
기능: 사용자 로그인
요청 본문:
email: 이메일
password: 비밀번호
응답: 액세스 토큰 및 리프레시 토큰

POST /api/v1/auth/logout
권한: 인증된 사용자
기능: 사용자 로그아웃
처리: 리프레시 토큰 쿠키 제거

GET /api/v1/auth/verify-email/:token
권한: 공개
기능: 사용자 이메일 인증
파라미터:
token: 이메일 인증 토큰

POST /api/v1/auth/forgot-password
권한: 공개
기능: 새 비밀번호 설정
파라미터:
token: 재설정 토큰
요청 본문:
password: 새 비밀번호

보안 사항 (Security Notes):
리프레시 토큰은 HTTP-only 쿠키로 관리
토큰 만료 시간 설정
이메일 인증 시스템
비밀번호 재설정 보안

사용 예시 (Usage Example):
// 회원가입
POST /api/v1/auth/register
{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "홍",
    "lastName": "길동"
}

// 로그인
POST /api/v1/auth/login
{
    "email": "user@example.com",
    "password": "password123"
}

// 비밀번호 찾기
POST /api/v1/auth/forgot-password
{
    "email": "user@example.com"
}
