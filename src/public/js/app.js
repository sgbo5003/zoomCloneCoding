const socket = io(); // io는 자동적으로 back-end socket.io와 연결 해주는 function

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom); // socket.emit(첫번째 인자: event 이름, 두번째 인자: 보내고 싶은 payload, 세번째 인자: 서버에서 호출하는 function)
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleSubmit);