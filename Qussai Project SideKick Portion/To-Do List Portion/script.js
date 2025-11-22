document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-btn");
    const todoInput = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");

    addBtn.addEventListener("click", () => {
        const task = todoInput.value.trim();
        if (task) {
            addTask(task);
            todoInput.value = "";
        }
    });

    function addTask(task) {
        const li = document.createElement("li");
        li.className = "todo-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.addEventListener("change", () => {
            taskText.classList.toggle("completed");
        });

        const taskText = document.createElement("span");
        taskText.textContent = task;
        taskText.className = "task-text";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            li.remove();
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }
});