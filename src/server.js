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

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome"); // 방안에 있는 모든 사람들에게 emit
  });
  socket.on("disconnecting", () => { // disconnect 했을 때 event
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg);
    done();
  });
});


const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

// const wss = new Websocket.Server({ server });

// const sockets = []; // fake database

// wss.on("connection", (socket) => {
  //   sockets.push(socket);
  //   socket["nickname"] = "Anonymous"; // 초기 닉네임 설정
  //   console.log("Connected to Browser ✔");
  //   socket.on("close", () => console.log("Disconnected from the Browser"));
  //   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     if(message.type === "new_message") { // 매세지 type인 경우
//       sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`)); // 자신과 다른 브라우저에 전송
//     } else if(message.type === "nickname") { // 닉네임 type인 경우
//       socket["nickname"] = message.payload;
//     }
//   });
// });