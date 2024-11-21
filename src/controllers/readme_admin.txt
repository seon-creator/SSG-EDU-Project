# Admin Controller Documentation:

1. AdminController 클래스 (Admin Controller Class):
   관리자용 사용자 관리 기능을 제공하는 컨트롤러입니다.

2. 주요 메소드 (Main Methods):

   ## getAllUsers 메소드:
   - 모든 사용자 목록을 조회합니다.
   - 페이지네이션을 지원합니다.
   - 파라미터:
     - page: 페이지 번호 (기본값: 1)
     - limit: 페이지당 항목 수 (기본값: 10)
   - 응답: 사용자 목록과 페이지네이션 정보

   ## getUser 메소드:
   - 특정 사용자의 상세 정보를 조회합니다.
   - 파라미터:
     - id: 사용자 ID
   - 404 에러: 사용자를 찾을 수 없는 경우

   ## createUser 메소드:
   - 새로운 사용자를 생성합니다.
   - 필요한 데이터:
     - email: 이메일 (중복 확인)
     - password: 비밀번호
     - firstName: 이름
     - lastName: 성
     - role: 역할
   - 400 에러: 이메일이 이미 존재하는 경우

   ## updateUser 메소드:
   - 사용자 정보를 수정합니다.
   - 수정 가능한 필드:
     - firstName: 이름
     - lastName: 성
     - role: 역할
     - status: 상태
   - 404 에러: 사용자를 찾을 수 없는 경우

   ## deleteUser 메소드:
   - 사용자를 삭제합니다.
   - 파라미터:
     - id: 사용자 ID
   - 404 에러: 사용자를 찾을 수 없는 경우

3. 응답 형식 (Response Format):
   - success: 처리 결과 (true/false)
   - message: 처리 메시지
   - data: 결과 데이터 또는 null

4. 에러 처리:
   - 500: 서버 내부 오류
   - 404: 리소스를 찾을 수 없음
   - 400: 잘못된 요청

5. 페이지네이션 정보:
   - page: 현재 페이지
   - limit: 페이지당 항목 수
   - total: 전체 항목 수
   - pages: 전체 페이지 수

(Đây là documentation theo format tiếng Hàn cho Admin Controller. Nếu cần điều chỉnh thêm gì, xin hãy cho tôi biết.)