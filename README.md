# 프로젝트 구조 정리
- src
    - config
        cors.js                 : http 통신 기능 가능하도록 CORS 설정하는 부분
        database.js             : MongoDB 연결 기능
    - controllers
        - data
            failedCitiesWithNeighbor.js
        admin.controller.js     : 관리자 계정 기능(유저 수, 채팅 수 확인 기능)
        api.controller.js       : 응급실 정보 조회 기능(기관명, 병상, 수술실 수 등)
        auth.controller.js      : 로그인, 회원가입 등 인증정보 기능
        report.controller.js    : 신고정보 저장, 조회, 수정기능
        user.controller.js      : 유저 정보 불러오기, 비밀번호 변경 기능
    - middlewares
        auth.middleware.js      : 계정 별 인증 미들웨어(구급대원, 일반인, 관리자 권한 확인)
        error.middleware.js     : 에러를 처리하는 미들웨어
        validate.middleware.js  : 프론트엔드에서 요청한 데이터 유효성 검증 기능
    - models
        report.model.js         : 신고 정보 스키마
        user.model.js           : 유저 정보 스키마
    - routes
        admin.routes.js
        api.routes.js
        auth.routes.js
        report.routes.js
        user.routes.js
    - utils
        email.util.js           : 이메일 인증 기능
        verifyToken.js          : JWT토큰(로그인 상태 인증 검증용 토큰) 검증
    - validations
        auth.validation.js      : 인증 관련 검증 기능
    server.js: 백엔드 서버 실행 코드