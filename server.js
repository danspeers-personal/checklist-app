// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// File where tasks will be saved
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Middleware - helps Express understand JSON and serve static files
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize tasks file if it doesn't exist
if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
}

// GET endpoint - retrieves all tasks
// When browser requests tasks, read them from the JSON file and send back
app.get('/api/tasks', (req, res) => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        console.error('Error reading tasks:', error);
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// POST endpoint - adds a new task
// When browser sends a new task, add it to the list and save to file
app.post('/api/tasks', (req, res) => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);

        // Create new task with unique ID
        const newTask = {
            id: Date.now(), // Simple unique ID using timestamp
            text: req.body.text,
            completed: false
        };

        tasks.push(newTask);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json(newTask);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// PUT endpoint - updates a task (marks as complete/incomplete)
// When browser says a task was checked/unchecked, update it in the file
app.put('/api/tasks/:id', (req, res) => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);

        // Find the task by ID and update it
        const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = req.body.completed;
            fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
            res.json(tasks[taskIndex]);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE endpoint - removes a task
// When browser wants to delete a task, remove it from the file
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        let tasks = JSON.parse(data);

        // Filter out the task with matching ID
        tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Checklist app running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
