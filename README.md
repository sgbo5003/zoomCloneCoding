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

## #2 SOCKETIO
------- 
### #2.0 SocketIO vs WebSockets
> Socket IO
> 
- Socket IO는 프론트와 백엔드 간 실시간 통신을 가능하게 해주는 프레임워크 또는 라이브러리
- 프론트와 백엔드간 실시간 통신을 websocket을 이용해서 할 수 있다.

### #2.1 Installing SocketIO
- `npm i socket.io` 명령어로 socket.io 설치
- 백엔드 ↔ 프론트엔드 [socket.io](http://socket.io) 연결
    - 백엔드
        
        ```tsx
        import http from "http";
        import SocketIo from "socket.io";
        import express from "express";
        // import Websocket from "ws";
        
        const app = express();
        
        app.set("view engine", "pug");
        app.set("views", __dirname + "/views");
        app.use("/public", express.static(__dirname + "/public"));
        app.get("/", (_, res) => res.render("home"));
        app.get("/*", (_, res) => res.redirect("/"));
        
        const httpServer = http.createServer(app);
        const wsServer = SocketIo(httpServer);
        
        wsServer.on("connection", socket => {
          console.log(socket);
        });
        
        const handleListen = () => console.log(`Listening on http://localhost:3000`);
        httpServer.listen(3000, handleListen);
        ```
        
    - 프론트엔드
        
        ```tsx
        const socket = io(); // io는 자동적으로 back-end socket.io와 연결 해주는 function
        ```

### #2.2 SocketIO is Amazing

- socket.io 를 사용해 방 생성
- `socket.emit(인자1, 인자2, 인자3)`
    - 인자 1: event 이름
    - 인자 2: 보내고 싶은 payload
    - 인자 3: 서버에서 호출하는 function
- 프론트
    
    ```tsx
    const socket = io(); // io는 자동적으로 back-end socket.io와 연결 해주는 function
    
    const welcome = document.getElementById("welcome");
    const form = welcome.querySelector("form");
    
    function handleSubmit(event) {
      event.preventDefault();
      const input = form.querySelector("input");
      socket.emit("enter_room", { payload: input.value }, () => {
        console.log("Server is done");
      }); // socket.emit(첫번째 인자: event 이름, 두번째 인자: 보내고 싶은 payload, 세번째 인자: 서버에서 호출하는 function)
      input.value = ""
    }
    
    form.addEventListener("submit", handleSubmit);
    ```
    
- 백엔드
    
    ```tsx
    const httpServer = http.createServer(app);
    const wsServer = SocketIo(httpServer);
    
    wsServer.on("connection", (socket) => {
      socket.on("enter_room", (msg, done) => {
        console.log(msg);
        setTimeout(() => {
          done();
        }, 10000);
      });
    });
    ```

### #2.3 Recap
> socket.emit()
> 
- `socket.emit(인자1, 인자2, 인자3, 인자4, ...)`
    - 인자 1: event 이름
    - 인자 2: 보내고 싶은 payload
    - 인자 3~ : 원하는만큼 쓸 수 있다. (무제한)
    - 함수를 인자로 쓰고 싶다면 꼭 마지막에 와야 한다.
        
        ```tsx
        // 프론트
        socket.emit("enter_room", { payload: input.value }, 1, "hi", true);
        
        // 백엔드
        wsServer.on("connection", (socket) => {
          socket.on("enter_room", (a, b, c, d) => {
            console.log(a, b, c, d);
          });
        });
        ```
        
- `socket.emit()` 과 `socket.on()` 에는 같은 이름을 사용해야 한다.

### #2.4 Rooms
> socket 관련 함수들
> 
- `socket.join()` : 방에 들어가기 위해 쓰는 함수
- `socket.rooms` : socket이 어떤 방에 있는지 알수 있다.
- `socket.id` : 방의 room id 를 알 수 있다.

### #2.5 Room Messages
> socket 관련 함수 2
> 
- `socket.to(room name).emit(event name);`
- 프론트와 연결된 event를 해당 room(room name)에 있는 모든 사람들에게 emit
- 프론트 코드
    
    ```tsx
    socket.on("welcome", () => { // "welcome" => event name
      addMessage("someone joined!");
    });
    ```
    
- 백엔드 코드
    
    ```tsx
    socket.to(roomName).emit("welcome");
    ```

### #2.6 Room Notifications
> disconnecting event
> 

```tsx
socket.on("disconnecting", () => { // disconnect 했을 때 event
  socket.rooms.forEach((room) => socket.to(room).emit("bye"));
});
```

> 메세지 주고받기
> 
- 프론트

```tsx
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

socket.on("new_message", addMessage);
```

- 백엔드

```tsx
socket.on("new_message", (msg, room, done) => {
  socket.to(room).emit("new_message", msg);
  done();
});
```

### #2.7 Nicknames

> 닉네임 정하기
> 
- 프론트
    
    ```jsx
    function handleNicknameSubmit(event) {
      event.preventDefault();
      const input = room.querySelector("#name input");
      socket.emit("nickname", input.value);
    }
    
    function showRoom() {
      welcome.hidden = true;
      room.hidden = false;
      const h3 = room.querySelector("h3");
      h3.innerText = `Room ${roomName}`;
      const msgForm = room.querySelector("#msg");
      const nameForm = room.querySelector("#name");
      msgForm.addEventListener("submit", handleMessageSubmit);
      nameForm.addEventListener("submit", handleNicknameSubmit);
    }
    ```
    
- 백엔드
    
    ```jsx
    socket["nickname"] = "Anon";
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
    ```








