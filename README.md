# Zoom Clone using NodeJS, webRTC and Websockets

## #0 INTRODUCTION
------- 
### #0.2 Server Setup

1. 폴더 생성
2. `npm init -y` 명령어로 package.json 파일 생성
3. `npm i nodemon -D` 로 nodemon 설치
4. `git init .` 로 깃파일 생성
5. `npm i @babel/core @babel/cli @babel/node @babel/preset-env-D` 로 바벨 패키지 다운로드
6. `npm i express` 로 express 설치
7. `npm i pug` 로 pug 설치
8. `npm run dev` 로 nodemon 서버 실행

### #0.3 Frontend Setup

> pug
> 
- pug는 express의 패키지 view engine이다.
- HTML 을 PUG 문법으로 작성하면 HTML로 바꿔주는 기능을 한다.

```tsx
doctype html
html(lang="en")
  head
    meta(charset="UTF-8")
    meta(http-equiv="X-UA-Compatible", content="IE=edge")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title Zoom
    link(rel="stylesheet", href="https://unpkg.com/mvp.css")
  body 
    header 
      h1 Zoom
    main 
      h2 welcome to Zoom
    script(src="/public/js/app.js")
```

## #1 CHAT WITH WEBSOCKETS
------- 
### #1.2 WebSockets in NodeJs
- `npm i ws` 명령어로 websocket 설치

### #1.3 WebSocket Events
- 웹소켓 이벤트 알아보기
- 웹소켓 생성 및 연동
### #1.4 WebSocket Messages
- 프론트와 백엔드에서 메세지 주고받기
- 프론트

```tsx
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server ✔");
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server");
});

setTimeout(() => {
  socket.send("hello from the browser!");
}, 10000);
```

- 백엔드

```tsx
const server = http.createServer(app);
const wss = new Websocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✔");
  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (message) => {
    console.log(message.toString());
  });
  socket.send("hello!!");
});
```
### #1.6 Chat Completed
- fake database를 생성하여 각각 다른 브라우저에서 채팅 주고받기 (콘솔에서)
- 프론트

```tsx
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server ✔");
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
```

- 백엔드

```tsx
const server = http.createServer(app);
const wss = new Websocket.Server({ server });

const sockets = []; // fake database

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("Connected to Browser ✔");
  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (message) => {
    sockets.forEach((aSocket) => aSocket.send(message.toString()));
  });
});

server.listen(3000, handleListen);
```

- 화면
    
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ceb519f0-941b-4ed9-838b-48165303ade5/Untitled.png)

### #1.7 Nicknames part One
- nickname을 입력하는 form 생성
- 프론트에서 메세지를 두 타입으로 나눠 객체 → JSON문자 형태로 백엔드에 넘기기
    - 닉네임 : `{"type": "nickname", "payload": "input.value"}`
    - 메세지 : `{"type": "new_message", "payload": "input.value"}`
- 프론트
    
    ```tsx
    const messageList = document.querySelector("ul");
    const nickForm = document.querySelector("#nick");
    const messageForm = document.querySelector("#message");
    const socket = new WebSocket(`ws://${window.location.host}`);
    
    function makeMessage(type, payload) { // 서버에 보내기 위해 메세지를 객체 ({type, payload}) 로 만들어 JSON 문자 형태로 변환
      const msg = {type, payload};
      return JSON.stringify(msg);
    }
    
    socket.addEventListener("open", () => {
      console.log("Connected to Server ✔");
    });
    
    socket.addEventListener("message", (message) => {
      const li = document.createElement("li"); // li 생성
      li.innerText = message.data; // li에 메세지 집어넣기
      messageList.append(li);
    });
    
    socket.addEventListener("close", () => {
      console.log("Disconnected to Server");
    });
    
    function handleSubmit(event) {
      event.preventDefault();
      const input = messageForm.querySelector("input");
      socket.send(makeMessage("new_message", input.value));
      input.value = "";
    }
    
    function handleNickSubmit(event) {
      event.preventDefault();
      const input = nickForm.querySelector("input");
      socket.send(makeMessage("nickname", input.value));
      input.value = "";
    }
    
    messageForm.addEventListener("submit", handleSubmit);
    nickForm.addEventListener("submit", handleNickSubmit);
    ```
### #1.8 Nicknames part Two
- nickname을 입력하는 form 생성
- 프론트에서 두타입으로 넘어온 JSON을 풀어서(JSON.Parse) 조건 처리
    - new_message인 경우
        - `${socket.nickname}: ${message.payload}` 형태로 send
    - nickname인 경우
        - `socket["nickname"] = message.payload;`
- 백엔드
    
    ```tsx
    const server = http.createServer(app);
    const wss = new Websocket.Server({ server });
    
    const sockets = []; // fake database
    
    wss.on("connection", (socket) => {
      sockets.push(socket);
      socket["nickname"] = "Anonymous"; // 초기 닉네임 설정
      console.log("Connected to Browser ✔");
      socket.on("close", () => console.log("Disconnected from the Browser"));
      socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        if(message.type === "new_message") { // 매세지 type인 경우
          sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`)); // 자신과 다른 브라우저에 전송
        } else if(message.type === "nickname") { // 닉네임 type인 경우
          socket["nickname"] = message.payload;
        }
      });
    });
    ```



