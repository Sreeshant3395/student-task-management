const API_URL = "http://localhost:5000/api/tasks";
let allTasks = [];

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");


// ===============================
// GET ALL TASKS
// ===============================

async function loadTasks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();

        allTasks = tasks;

        displayTasks(allTasks);

    } catch (error) {
        console.error("Error loading tasks:", error);
        taskList.innerHTML = "<p>Unable to load tasks.</p>";
    }
}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    updateStatistics(tasks);

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <p id="emptyMessage">
                No tasks found. Add your first task!
            </p>
        `;
        return;
    }

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        taskCard.innerHTML = `
            <h3>${task.title}</h3>

            <p>
                <strong>Description:</strong>
                ${task.description || "No description"}
            </p>

            <div class="task-info">

                <p>
                    <strong>Subject:</strong>
                    ${task.subject}
                </p>

                <p>
                    <strong>Deadline:</strong>
                    ${new Date(task.deadline).toLocaleDateString()}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${task.priority}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${task.status}
                </p>

            </div>

            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editTask('${task._id}')">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask('${task._id}')">
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskCard);
    });
}


// ===============================
// CREATE TASK
// ===============================

taskForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const taskData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        subject: document.getElementById("subject").value,
        deadline: document.getElementById("deadline").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        alert("Task added successfully!");

        taskForm.reset();

        document.getElementById("priority").value = "Medium";
        document.getElementById("status").value = "Pending";

        loadTasks();

    } catch (error) {

        console.error("Error creating task:", error);

        alert("Failed to add task.");
    }
});


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        alert("Task deleted successfully!");

        loadTasks();

    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Failed to delete task.");
    }
}


// ===============================
// EDIT TASK
// ===============================

async function editTask(id) {

    const newStatus = prompt(
        "Enter new status:\nPending\nIn Progress\nCompleted"
    );

    if (!newStatus) {
        return;
    }

    if (
        newStatus !== "Pending" &&
        newStatus !== "In Progress" &&
        newStatus !== "Completed"
    ) {
        alert("Invalid status.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        alert("Task updated successfully!");

        loadTasks();

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Failed to update task.");
    }
}


// ===============================
// REFRESH BUTTON
// ===============================

refreshBtn.addEventListener("click", loadTasks);


// ===============================
// LOAD TASKS WHEN PAGE OPENS
// ===============================

loadTasks();

// ===============================
// UPDATE DASHBOARD STATISTICS
// ===============================

function updateStatistics(tasks) {

    const totalTasks = tasks.length;

    const pendingTasks = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const inProgressTasks = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    ).length;

    document.getElementById("totalTasks").textContent = totalTasks;

    document.getElementById("pendingTasks").textContent = pendingTasks;

    document.getElementById("inProgressTasks").textContent = inProgressTasks;

    document.getElementById("completedTasks").textContent = completedTasks;
}

// ===============================
// SEARCH AND FILTER TASKS
// ===============================

function filterTasks() {

    const searchText = searchInput.value.toLowerCase().trim();

    const selectedStatus = statusFilter.value;

    const selectedPriority = priorityFilter.value;

    const filteredTasks = allTasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            task.subject.toLowerCase().includes(searchText) ||
            (task.description || "").toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            task.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "All" ||
            task.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    displayTasks(filteredTasks);
}

searchInput.addEventListener("input", filterTasks);

statusFilter.addEventListener("change", filterTasks);

priorityFilter.addEventListener("change", filterTasks);
