const input = document.getElementById("todo-input");
const taskList = document.getElementById("task-list");

function addTask() {
  if (input.value.trim() === "") return;

  const li = document.createElement("li");

  li.innerHTML = `
            ${input.value}
            <button onclick="this.parentElement.remove()">X</button>
        `;
  taskList.appendChild(li);
  input.value = "";
}
function clearAll() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // This deletes every child element inside the list
}
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});
