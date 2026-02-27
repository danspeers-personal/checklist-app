// Get references to HTML elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const dateElement = document.getElementById('current-date');

// Display today's date
function displayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Load all tasks from the server
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();

        // Sort tasks: uncompleted first, completed last
        tasks.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        // Clear the list first
        taskList.innerHTML = '';

        // Add each task to the display
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks. Please refresh the page.');
    }
}

// Add a task to the visible list (DOM = Document Object Model)
function addTaskToDOM(task) {
    // Create list item
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    // If task is completed, add completed class
    if (task.completed) {
        li.classList.add('completed');
    }

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    // Create text span
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    // Add everything to the list item
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // Add list item to the list
    taskList.appendChild(li);
}

// Add a new task
async function addTask() {
    const text = taskInput.value.trim();

    // Don't add empty tasks
    if (!text) {
        alert('Please enter a task!');
        return;
    }

    try {
        // Send task to server
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const newTask = await response.json();

        // Add to display at the top
        addTaskToDOM(newTask);
        const newTaskElement = document.querySelector(`[data-id="${newTask.id}"]`);
        taskList.insertBefore(newTaskElement, taskList.firstChild);

        // Clear input field
        taskInput.value = '';
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
    }
}

// Toggle task completion (check/uncheck)
async function toggleTask(id, completed) {
    try {
        // Update on server
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });

        // Update display
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        if (completed) {
            // Mark as completed and move to bottom
            taskItem.classList.add('completed');
            taskList.appendChild(taskItem);
        } else {
            // Mark as uncompleted and move to top (before first completed task)
            taskItem.classList.remove('completed');
            const firstCompleted = document.querySelector('.task-item.completed');
            if (firstCompleted) {
                taskList.insertBefore(taskItem, firstCompleted);
            } else {
                // No completed tasks, so just move to end
                taskList.appendChild(taskItem);
            }
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        alert('Failed to update task. Please try again.');
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        // Delete from server
        await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        // Remove from display
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        taskItem.remove();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    }
}

// Event listeners
addBtn.addEventListener('click', addTask);

// Allow pressing Enter to add task
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// When page loads, display date and load tasks
displayDate();
loadTasks();
