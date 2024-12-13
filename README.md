# 응급 환자 이송을 돕기 위한 웹서비스 프로젝트
- 프로젝트 기간: 10/1 ~ 11/29
- 방향성: 구급대원, 병원 간 신속한 환자 상태 확인 웹서비스

## 사용 AI
- Chat GPT(환자상태요약 및 분류)
- 시간예측모델
- 음성->text 변환모델

## 데이터
- 응급실 실시간 가용병상 정보 데이터
- 구급차 출동시간 마감시간 데이터(울산)

## 사용 API
- Chat GPT
- 지도

## 사용방식
- 구급대원
1. 환자발생 주소 입력
2. 환자 상태 텍스트 입력 (음성 파일로 넣을 수도 있음)
3. GPT가 환자 상태를 판단해 중증 단계, 상태를 요약해서 정리해줌
4. 추천 병원 목록 확인
5. 병원 클릭 시 해당 병원으로 응급환자 요청이 완료되었다는 메시지

- 병원
1. 응급환자 요청 건 확인
2. 목록: 중증도 상태 | 예상도착시간
3. 응급환자 요청 건 클릭
4. 환자 상태 요약정보, 예상환자 도착시간 보여주기

## 설치 모듈
npm install axios

## 프로젝트 구조
- src
    - assets
        - fonts     : 웹사이트 전체 폰트 파일 저장 폴더
        - images    : 페이지 구성 이미지 저장 폴더
        - styles    : 사이트 전체 스타일 적용 css폴더
    - components    : 
        - Admin
            DashboardStats.jsx  : 관리자 페이지 사용자 수, 보고서 수, 활성 채팅 수 시각화 컴포넌트
            DashboardStats.css  : 스타일 코드
        - Chatbot
            ChatArea.jsx        : 채팅 공간 컴포넌트
            ChatSessions.jsx    : 채팅 세션 컴포넌트
        - Navbar                : 메뉴바 설정
            AdminNavbar.jsx     : 관리자 전용 메뉴바
            DoctorNavbar.jsx    : 구급대원 전용 메뉴바
            UserNavbar.jsx      : 일반유저 전용 메뉴바
            index.jsx           : 페이지 별로 어떤 메뉴바가 적용되어야 하는지
            ProfileDropdown.jsx : 드롭다운 기능
            PublicNavbar.jsx    : 로그인 전 메뉴바 상태
        DateSelector.jsx        : 날짜 선택
    - data
        cities.js               : 도시, 구 별로 매핑해둔 데이터

    - pages
        - Admin                 : 관리자 전용 페이지
            DashboardPage.jsx   : 대시보드 페이지

        - Chatbot               : 챗봇 페이지
            - Chat              : 채팅 페이지
            - Profiles          : 유저 프로필 페이지
            - Reports           : 챗봇 보고서 페이지

        - reportService         : 구급대원 서비스 페이지
            - mild              : 경증 환자 전용 페이지(자동으로 진료과 추천되도록 BERT 호출)
            - severe            : 중증 환자 전용 페이지
            EnterInfoPage.jsx           : 환자 정보 등록 페이지
            ReportDetailPage.jsx        : 환자 세부정보 페이지
            ReportListPage.jsx          : 환자 정보 목록 페이지
            RouteguidancePage.jsx       : 경로 안내 페이지
            ShowStatusPage.jsx          : 환자 정보 확인 페이지(이 페이지에서 경증/중증 분류 요청, BERT 호출)
        ChooseServicePage.jsx   : 랜딩페이지의 '무료로 시작하기' 버튼을 누르면 나오는 서비스 선택 페이지
        FindIdPage.jsx          : 아이디 찾기 페이지
        LandingPage.jsx         : 랜딩페이지 (웹 사이트 첫 페이지)
        LoginPage.jsx           : 로그인 페이지
        ResetPasswordPage.jsx   : 패스워트 찾기 페이지
        SignUpPage.jsx          : 회원가입 페이지
        SuccessPopup.js         : 성공팝업

    - theme
        ThemeProvider.jsx       : 페이지 테마 설정(다크모드, 일반 등)
    - utils
        api.js                  : Node.js, Flask 별 요청 라우터 정리
        auth.js                 : 유저 로그인 후 유지 세션 정보 관리 기능
        ProtectedRoute.jsx      : 로그인 상태에서만 페이지 접속 가능하도록 하는 기능

