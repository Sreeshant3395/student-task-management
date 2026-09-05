const API_URL = "http://localhost:5000/api/tasks";
const themeToggle = document.getElementById("themeToggle");
let allTasks = [];

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const editModal = document.getElementById("editModal");
const editTaskForm = document.getElementById("editTaskForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");


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
                    ${new Date(task.deadline).toLocaleDateString("en-GB")}

                    ${getDeadlineStatus(task.deadline, task.status)}
                </p>

                <p>
                    <strong>Priority:</strong>
                    <span class="priority-badge priority-${task.priority.toLowerCase()}">
                        ${task.priority}
                    </span>
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="status-badge status-${task.status
                        .toLowerCase()
                        .replace(" ", "-")}">
                        ${task.status}
                    </span>
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
// OPEN EDIT TASK MODAL
// ===============================

function editTask(id) {

    const task = allTasks.find(task => task._id === id);

    if (!task) {
        alert("Task not found.");
        return;
    }

    document.getElementById("editTaskId").value = task._id;

    document.getElementById("editTitle").value = task.title;

    document.getElementById("editDescription").value =
        task.description || "";

    document.getElementById("editSubject").value =
        task.subject;

    document.getElementById("editDeadline").value =
        task.deadline.split("T")[0];

    document.getElementById("editPriority").value =
        task.priority;

    document.getElementById("editStatus").value =
        task.status;

    editModal.style.display = "block";
}

// ===============================
// SAVE EDITED TASK
// ===============================

editTaskForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const id = document.getElementById("editTaskId").value;

    const updatedTask = {
        title: document.getElementById("editTitle").value,
        description: document.getElementById("editDescription").value,
        subject: document.getElementById("editSubject").value,
        deadline: document.getElementById("editDeadline").value,
        priority: document.getElementById("editPriority").value,
        status: document.getElementById("editStatus").value
    };

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        alert("Task updated successfully!");

        closeEditModal();

        await loadTasks();

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Failed to update task.");
    }
});

// ===============================
// CLOSE EDIT MODAL
// ===============================

function closeEditModal() {

    editModal.style.display = "none";

    editTaskForm.reset();
}

closeModalBtn.addEventListener("click", closeEditModal);

cancelEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", function(event) {

    if (event.target === editModal) {
        closeEditModal();
    }
});

// ===============================
// REFRESH BUTTON
// ===============================

refreshBtn.addEventListener("click", loadTasks);


// ===============================
// LOAD TASKS WHEN PAGE OPENS
// ===============================

loadTasks();

// Dark Mode Toggle

themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});


// Remember user's theme preference

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

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

// ===============================
// DEADLINE STATUS
// ===============================

function getDeadlineStatus(deadline, status) {

    // Completed tasks don't need an overdue warning
    if (status === "Completed") {
        return "";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const difference =
        deadlineDate.getTime() - today.getTime();

    const daysRemaining =
        Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return `<span class="deadline-overdue">Overdue</span>`;
    }

    if (daysRemaining === 0) {
        return `<span class="deadline-today">Due Today</span>`;
    }

    if (daysRemaining === 1) {
        return `<span class="deadline-soon">Due Tomorrow</span>`;
    }

    return "";
}