import http from "http";
import express from "express";
import Websocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));


const handleListen = () => console.log(`Listening on http://localhost:3000`);

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
      sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
    } else if(message.type === "nickname") { // 닉네임 type인 경우
      socket["nickname"] = message.payload;
    }
  });
});

server.listen(3000, handleListen);