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