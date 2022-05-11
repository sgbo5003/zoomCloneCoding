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