# Auth Middleware Documentation:

1. AuthMiddleware 클래스 (Authentication Middleware Class):

2. 주요 메소드 (Main Methods):

   ## isAuth 메소드:
   - 토큰 기반 사용자 인증을 처리합니다.
   - 헤더에서 Bearer 토큰을 확인합니다.
   - 토큰이 유효하면 decoded 정보를 req.user에 저장합니다.
   - 실패 시 401 에러를 반환합니다.

   ## hasRole 메소드:
   - 사용자의 역할 권한을 확인합니다.
   - 파라미터로 허용된 역할 배열을 받습니다.
   - 권한이 없으면 403 에러를 반환합니다.

   ## isAdmin 메소드:
   - 관리자 권한을 확인합니다.
   - admin 역할이 아닌 경우 403 에러를 반환합니다.

   ## isDoctor 메소드:
   - 의사 권한을 확인합니다.
   - doctor 역할이 아닌 경우 403 에러를 반환합니다.

3. 에러 응답 형식 (Error Response Format):
   - success: false
   - message: 에러 메시지
   - data: null

4. 사용 예시 (Usage Example):
// 라우터에서 미들웨어 사용
router.get('/admin', authMiddleware.isAuth, authMiddleware.isAdmin, adminController);
router.get('/doctor', authMiddleware.isAuth, authMiddleware.isDoctor, doctorController);
router.get('/protected', authMiddleware.isAuth, authMiddleware.hasRole(['admin', 'doctor']), protectedController);