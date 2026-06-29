# DevTodo IDE

Codex와 함께 작업할 때 프로젝트 구조, 코드, 실행 미리보기, 작업 기록, 프로젝트별 Todo, 팀 코멘트를 한 화면에서 확인할 수 있는 협업형 Web IDE 프로토타입입니다.

## 주요 기능

- 좌측 Project에 실제 로컬 프로젝트 폴더 드래그 또는 폴더 선택
- 로그인 역할에 따라 좌측에 권한 있는 샘플 프로젝트 고정 표시
- 실제 폴더 구조를 트리 형태로 탐색하고 접기·펼치기
- 여러 종류의 텍스트 파일을 선택해 코드 내용 확인
- 코드 에디터에서 파일 내용 수정, Tab 입력, 현재 줄·열 확인
- Save 버튼으로 수정 코드 저장
  - 브라우저 파일 권한으로 연 폴더: 원본 파일 저장 가능
  - 일반 폴더 선택 또는 제한 브라우저: 앱 내부 세션 저장
- Run 버튼으로 선택한 Preview 대상 분석
  - 이미지 파일: 단일 이미지 Preview
  - 이미지/GIF/영상 폴더: 파일명 순서대로 세로 연결 Preview
  - 샘플 디자인 프로젝트: 광고주별 작업물을 Preview로 확인
  - 이미지 순서가 맞지 않을 경우 Preview 안에서 위/아래 버튼으로 순서 조정
  - 정적 HTML 폴더: `index.html`과 로컬 CSS/JS/이미지 경로를 연결해 Preview
  - React/Vite 폴더: 서버 실행 또는 배포 URL 연결 필요 안내
- PC/Mobile 버전 Preview Shell 전환
- View 메뉴로 Project, Activity Log, Preview, Code Editor, Review 패널 열기/닫기
- 프로젝트별 To-do 추가, 조회, 완료, 수정, 삭제
- 프로젝트별 팀 코멘트 기록
- 과제용 로그인 화면과 역할별 UI/API 권한 분리
- Express API를 통한 프로젝트, Todo, 코멘트 저장 구조
- MongoDB Atlas 연결 시 서버 DB 저장, 미연결 시 LocalStorage/메모리 데모 모드
- 데스크톱 IDE 레이아웃과 반응형 세로 레이아웃

> 원본 파일 저장은 브라우저의 파일 시스템 권한을 지원하는 환경에서만 동작합니다. 권한이 없거나 일반 파일 선택 방식으로 연 경우에는 편집 내용이 브라우저 세션 저장으로 처리됩니다.

## 기술 스택

- React 19
- Vite 8
- Tailwind CSS 4
- Express 5
- MongoDB Atlas / Mongoose
- LocalStorage

## 실행 방법

macOS에서는 프로젝트 폴더의 `DevTodo IDE.app`을 더블클릭하면 개발 서버와 브라우저가 자동으로 실행됩니다. 처음 실행할 때 macOS가 차단하면 앱을 우클릭한 뒤 `열기`를 선택하세요.

터미널에서 직접 실행하려면:

```bash
corepack enable
pnpm install
pnpm run dev
```

서버를 함께 실행하려면 별도 터미널에서:

```bash
pnpm run server:dev
```

로컬 개발 중 프론트의 `/api` 요청은 `vite.config.js`의 proxy 설정을 통해 `http://localhost:4000` 서버로 전달됩니다.

프로덕션 빌드 확인:

```bash
pnpm run build
pnpm start
```

환경변수 예시는 `.env.example`을 참고합니다.

```text
PORT=4000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

## 폴더 구조

```text
src/
├── app/
│   └── App.jsx
├── features/
│   ├── activity/
│   │   └── components/ActivityPanel.jsx
│   ├── chat/
│   │   └── components/ProjectChat.jsx
│   ├── editor/
│   │   └── components/CodeEditor.jsx
│   ├── preview/
│   │   └── components/ProjectPreview.jsx
│   ├── projects/
│   │   ├── components/ProjectSidebar.jsx
│   │   ├── data/
│   │   │   ├── clients.js
│   │   │   ├── permissions.js
│   │   │   ├── projects.js
│   │   │   ├── sampleAssets.js
│   │   │   └── users.js
│   │   └── lib/
│   │       ├── projectService.js
│   │       └── workspace.js
│   ├── review/
│   │   └── components/ProjectReviewPanel.jsx
│   └── tasks/
│       └── components/
│           ├── TodoApp.jsx
│           ├── TodoForm.jsx
│           ├── TodoList.jsx
│           └── TodoItem.jsx
├── shared/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── commentApi.js
│   │   ├── httpClient.js
│   │   ├── projectApi.js
│   │   └── todoApi.js
│   ├── components/Header.jsx
│   └── storage/localStorage.js
├── main.jsx
└── index.css

server/
├── config/
│   └── db.js
├── data/
│   └── seedData.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Client.js
│   ├── Comment.js
│   ├── Project.js
│   ├── Todo.js
│   └── User.js
├── routes/
│   ├── auth.routes.js
│   ├── comment.routes.js
│   ├── project.routes.js
│   └── todo.routes.js
├── services/
│   ├── memoryStore.js
│   ├── permissions.js
│   ├── security.js
│   └── seedDatabase.js
└── index.js
```

## 데이터 흐름

`app/App.jsx`는 전체 화면 조립과 선택 파일, 편집 중인 코드, 저장 상태, 실행 상태를 관리합니다. 각 기능은 `features` 아래에 독립적으로 배치했습니다.

- `projects`: 프로젝트 폴더 열기, 파일 트리, 파일 읽기/저장 권한 처리
- `projects/data`: 광고주, 사용자, 프로젝트, 권한, 샘플 에셋 데이터
- `editor`: 코드 편집기 UI와 편집 상태 표시
- `preview`: PC/Mobile 실행 미리보기 영역
- `activity`: 실행/저장/Preview 기록 로그
- `tasks`: 프로젝트별 Todo
- `chat`: 프로젝트별 팀 코멘트
- `review`: 우측 리뷰 패널 조립
- `auth`: 과제용 로그인 화면과 역할별 권한 정의
- `shared/api`: 프론트와 서버를 연결하는 API 호출 모듈
- `shared`: 공통 Header, LocalStorage 저장소
- `server`: Express API, MongoDB 스키마, 인증/권한 미들웨어

현재 Run 기능은 브라우저에서 임의 코드를 컴파일하지 않고, 선택된 파일/폴더를 분석해 안전한 Preview만 표시합니다. 이미지/GIF/영상 파일은 바로 Preview하고, 미디어가 여러 개 있는 폴더는 파일명 순서대로 이어 붙여 상세페이지 형태로 표시합니다. 정적 HTML 폴더는 `index.html`을 읽고 로컬 CSS/JS/이미지 경로를 임시 Preview 주소로 연결해 표시합니다. `package.json`과 `src` 폴더가 함께 있는 React/Vite 유형은 서버 실행 또는 배포 URL 연결이 필요하다는 안내를 표시합니다.

이후 백엔드 Preview 서버가 연결되면 `features/preview` 영역에 실제 실행 URL을 연결할 수 있습니다.

## 샘플 프로젝트와 권한 데이터

`sample-projects` 폴더의 디자인 자료는 과제 시연용 샘플 프로젝트로 연결됩니다. 프론트엔드 데이터 모듈은 서버 API 실패 시 fallback 데이터로 사용되며, 서버가 연결되면 `/api/projects` 응답을 우선 사용합니다.

- `Master`: 모든 샘플 프로젝트 표시
- `Team`: 배정된 디자인 프로젝트 표시
- `Client`: 아이디에 `에코너`, `다모애`, `서리풀`, `쿨보틀`을 입력하면 해당 광고주 프로젝트만 표시

샘플 에셋은 빌드 시 정적 파일로 포함됩니다. 실제 서비스에서는 프로젝트 파일을 서버 스토리지에 저장하고, 프론트엔드는 권한이 있는 프로젝트 목록과 Preview URL만 받아오는 방식으로 확장합니다.

## 로그인 및 권한 설계

현재 로그인은 과제용 서버 연동 프로토타입입니다. Express API에서 사용자 역할과 비밀번호를 확인하고, 토큰 기반으로 프로젝트/Todo/코멘트 API 접근 권한을 검사합니다. 서버가 실행되지 않으면 프론트엔드 로컬 시연 모드로 fallback됩니다.

| 역할 | 가능 기능 |
| --- | --- |
| Master | 프로젝트 확인, 코드 편집/저장, Todo 관리/삭제, 리뷰 채팅 |
| Team | Todo 관리/삭제, 리뷰 채팅 |
| Client | Preview 확인, 리뷰 채팅 |

시연용 비밀번호는 `demo123`입니다. Client 권한 테스트는 아이디에 `에코너`, `다모애`, `서리풀`, `쿨보틀` 중 하나를 입력하면 해당 광고주 프로젝트만 표시됩니다.

보안 강화를 위해 실제 서비스에서는 이메일 인증, 초대 링크, 비밀번호 재설정, 토큰 만료 정책 강화, 요청 제한, 파일 업로드 권한 검증, 서버 스토리지 분리를 추가합니다.

## Render 배포

이 프로젝트는 Render 단일 Web Service 배포를 기준으로 구성했습니다. `render.yaml`에는 다음 흐름이 정의되어 있습니다.

```text
Build Command: pnpm install --frozen-lockfile && pnpm run build
Start Command: pnpm start
```

Render 환경변수에는 다음 값을 직접 입력합니다.

```text
NODE_ENV=production
MONGODB_URI=MongoDB Atlas 연결 문자열
JWT_SECRET=긴 랜덤 문자열
```

MongoDB Atlas 연결 문자열에는 비밀번호가 포함되므로 코드나 문서에 직접 기록하지 않습니다.

## 향후 개선 방향

- Monaco Editor 적용
- 파일 업로드 및 서버 스토리지 연동
- 실제 운영용 로그인/세션 인증과 프로젝트별 권한 관리
- 프로젝트별 Preview URL 관리
- Vercel 배포 및 시연 영상 제작
