# DevTodo Fullstack

제출용으로 분리한 Todo 풀스택 앱입니다. 기존 Web IDE 형태의 과제앱은 그대로 두고, 이 폴더 안에서 React 프론트엔드와 Express 백엔드가 실제로 통신하도록 구성했습니다.

## 구현 범위

- React UI: 할 일 등록, 목록 조회, 완료 처리, 수정, 삭제
- Express REST API: `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`
- 저장소 구조: 기본은 로컬 JSON 파일 저장, `MONGODB_URI`가 있으면 MongoDB 저장소 사용
- MongoDB 스키마: `server/src/models/Todo.js`
- 프론트엔드-백엔드 요청/응답: `client/src/api/todos.js`

## 실행 방법

프로젝트 루트에서 실행합니다.

```bash
npm install
npm run todo:dev
```

실행 후 브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5175/
```

백엔드 상태 확인 주소입니다.

```text
http://127.0.0.1:4000/api/health
```

## MongoDB 연결 방법

MongoDB가 준비된 경우 `.env` 파일을 만들고 아래 값을 넣으면 MongoDB로 저장됩니다.

```bash
cp todo-fullstack/.env.example .env
```

```env
MONGODB_URI=mongodb://127.0.0.1:27017/devtodo
```

MongoDB 연결값이 없거나 연결에 실패하면, 시연이 끊기지 않도록 로컬 JSON 파일 저장소로 자동 전환됩니다.

## 과제 주석용 요약

- 프론트엔드: React로 Todo UI를 구성했습니다.
- 백엔드: Express로 Todo CRUD REST API를 구현했습니다.
- 데이터 저장: MongoDB 스키마와 저장소를 구현했고, 로컬 실행 안정성을 위해 JSON 저장소 fallback을 함께 두었습니다.
- 연동: 프론트엔드가 `fetch`로 백엔드 API에 요청을 보내고 응답을 받아 화면을 갱신합니다.

