# Admin Routes Documentation:

1. 관리자 라우트 개요 (Admin Routes Overview):
    관리자 전용 API 엔드포인트를 정의하는 라우터입니다.

2. 공통 미들웨어 (Common Middleware):
    - isAuth: 사용자 인증 확인
    - isAdmin: 관리자 권한 확인

3. 엔드포인트 상세 (Endpoint Details):

    ## 사용자 목록 조회
    - Method: GET
    - URL: /api/v1/admin/users
    - 권한: 관리자
    - 기능: 모든 사용자 목록 조회
    - 쿼리 파라미터:
      - page: 페이지 번호
      - limit: 페이지당 항목 수

    ## 특정 사용자 조회
    - Method: GET
    - URL: /api/v1/admin/users/:id

    ## 새 사용자 생성
    - Method: POST
    - URL: /api/v1/admin/users

    ## 사용자 정보 수정
    - Method: PUT
    - URL: /api/v1/admin/users/:id

    ## 사용자 삭제
    - Method: DELETE
    - URL: /api/v1/admin/users/:id