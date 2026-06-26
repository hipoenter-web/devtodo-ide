# DevTodo IDE

Web IDE 형태의 인터페이스 안에서 프로젝트 파일을 확인하고 수정하면서, 오른쪽 미리보기에서 실제 To-do App을 사용할 수 있는 React 프로젝트입니다.

## 주요 기능

- 좌측 Workspace에 실제 로컬 프로젝트 폴더 드래그 또는 폴더 선택
- 실제 폴더 구조를 트리 형태로 탐색하고 접기·펼치기
- 여러 종류의 텍스트 파일을 선택해 코드 내용 확인
- 코드 에디터에서 파일 내용 수정, Tab 입력, 현재 줄·열 확인
- Save 버튼으로 수정 코드 저장
  - 브라우저 파일 권한으로 연 폴더: 원본 파일 저장 가능
  - 일반 폴더 선택 또는 제한 브라우저: 앱 내부 세션 저장
- Run 버튼으로 실행 로그 출력 및 미리보기 새로고침
- To-do 추가, 조회, 완료, 수정, 삭제
- To-do와 저장한 코드의 LocalStorage 영속화
- 데스크톱 IDE 레이아웃과 반응형 세로 레이아웃

> 원본 파일 저장은 브라우저의 파일 시스템 권한을 지원하는 환경에서만 동작합니다. 권한이 없거나 일반 파일 선택 방식으로 연 경우에는 편집 내용이 브라우저 세션 저장으로 처리됩니다.

## 기술 스택

- React 19
- Vite 8
- Tailwind CSS 4
- LocalStorage

## 실행 방법

macOS에서는 프로젝트 폴더의 `DevTodo IDE.app`을 더블클릭하면 개발 서버와 브라우저가 자동으로 실행됩니다. 처음 실행할 때 macOS가 차단하면 앱을 우클릭한 뒤 `열기`를 선택하세요.

터미널에서 직접 실행하려면:

```bash
npm install
npm run dev
```

프로덕션 빌드 확인:

```bash
npm run build
npm run preview
```

## 폴더 구조

```text
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── CodeEditor.jsx
│   ├── PreviewPanel.jsx
│   ├── ConsolePanel.jsx
│   ├── TodoApp.jsx
│   ├── TodoForm.jsx
│   ├── TodoList.jsx
│   └── TodoItem.jsx
├── data/
│   └── fileData.js
├── utils/
│   ├── storage.js
│   └── workspace.js
├── App.jsx
├── main.jsx
└── index.css
```

## 데이터 흐름

`App.jsx`는 선택 파일, 편집 중인 코드, 저장된 파일, 원본 저장 가능 여부, 콘솔 로그를 관리합니다. `workspace.js`는 로컬 폴더 읽기, 파일 읽기, 원본 저장 권한 처리를 담당합니다. `TodoApp.jsx`는 할 일 목록과 필터를 관리하고 변경된 데이터를 LocalStorage에 저장합니다.

현재 Run 기능은 브라우저에서 임의 코드를 컴파일하지 않고, 제출 안정성을 위해 실행 로그와 미리보기 새로고침을 수행합니다.

## 향후 개선 방향

- Monaco Editor 적용
- 실제 코드 실행 샌드박스 연결
- Express API 및 MongoDB 저장
- 사용자 로그인과 프로젝트별 파일 관리
- Vercel 배포 및 시연 영상 제작
