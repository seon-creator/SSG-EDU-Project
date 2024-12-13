## 설명

- **config**
  - `cors.js` : HTTP 통신이 가능하도록 CORS 설정을 관리합니다.
  - `database.js` : MongoDB와 연결하는 기능을 제공합니다.

- **controllers**
  - 각 파일은 특정 기능(관리자 기능, 인증, 신고 정보 처리 등)을 담당하는 컨트롤러 파일들로 구성됩니다.
  - `data/failedCitiesWithNeighbor.js` : 데이터를 관리하는 스크립트.
  - `admin.controller.js` : 관리자 계정의 기능(유저 수, 채팅 수 확인)을 제공합니다.
  - `api.controller.js` : 응급실 정보 조회(기관명, 병상, 수술실 수 등) 관련 기능을 제공합니다.
  - `auth.controller.js` : 로그인, 회원가입 등의 인증 관련 기능을 제공합니다.
  - `report.controller.js` : 신고 정보를 저장, 조회, 수정하는 기능을 제공합니다.
  - `user.controller.js` : 유저 정보 불러오기, 비밀번호 변경 관련 기능을 제공합니다.

- **middlewares**
  - `auth.middleware.js` : 계정별 권한(구급대원, 일반인, 관리자)을 확인합니다.
  - `error.middleware.js` : 에러를 처리하는 미들웨어입니다.
  - `validate.middleware.js` : 프론트엔드 요청 데이터의 유효성을 검증합니다.

- **models**
  - Mongoose 스키마 정의 파일.
  - `report.model.js` : 신고 정보와 관련된 스키마를 정의합니다.
  - `user.model.js` : 유저 정보를 저장하기 위한 스키마를 정의합니다.

- **routes**
  - 각 기능별로 라우팅을 관리하는 파일입니다.
  - 예: `admin.routes.js`는 관리자 관련 라우팅을 처리합니다.

- **utils**
  - `email.util.js` : 이메일 인증 관련 기능을 제공합니다.
  - `verifyToken.js` : JWT 토큰의 유효성을 검증하는 유틸리티입니다.

- **validations**
  - `auth.validation.js` : 인증과 관련된 데이터를 검증하는 스크립트입니다.

- **server.js**
  - 백엔드 서버를 실행하는 메인 코드입니다.
