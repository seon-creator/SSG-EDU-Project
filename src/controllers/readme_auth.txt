# Auth Controller Documentation:

1. AuthController 클래스 (Authentication Controller Class):
   사용자 인증 관련 기능을 제공하는 컨트롤러입니다.

2. 주요 메소드 (Main Methods):

   ## register 메소드:
   - 새로운 사용자 등록을 처리합니다.
   - 필요한 데이터:
     - email: 이메일 (중복 확인)
     - password: 비밀번호
     - firstName: 이름
     - lastName: 성
     - role: 역할 (기본값: "user")
   - 이메일 인증 링크를 발송합니다.

   ## login 메소드:
   - 사용자 로그인을 처리합니다.
   - 필요한 데이터:
     - email: 이메일
     - password: 비밀번호
   - 응답: 액세스 토큰과 리프레시 토큰 발급

   ## refreshToken 메소드:
   - 액세스 토큰을 갱신합니다.
   - 쿠키에서 리프레시 토큰을 확인합니다.
   - 새로운 액세스 토큰을 발급합니다.

   ## logout 메소드:
   - 사용자 로그아웃을 처리합니다.
   - 리프레시 토큰 쿠키를 제거합니다.

   ## verifyEmail 메소드:
   - 이메일 인증을 처리합니다.
   - 인증 토큰을 확인하고 사용자 상태를 업데이트합니다.

   ## forgotPassword 메소드:
   - 비밀번호 재설정 요청을 처리합니다.
   - 재설정 링크를 이메일로 발송합니다.

   ## resetPassword 메소드:
   - 비밀번호 재설정을 처리합니다.
   - 재설정 토큰을 확인하고 새 비밀번호를 설정합니다.

3. 토큰 관리:
   - accessToken: 15분 유효
   - refreshToken: 7일 유효
   - verificationToken: 24시간 유효
   - resetToken: 1시간 유효

4. 보안 기능:
   - 비밀번호 해시화
   - HTTP-only 쿠키 사용
   - 보안 토큰 관리
   - 이메일 인증 시스템

5. 에러 처리:
   - 400: 잘못된 요청
   - 401: 인증 실패
   - 404: 사용자를 찾을 수 없음
   - 500: 서버 내부 오류

6. 응답 형식:
{
  success: Boolean,
  message: String,
  data: Object | null
}