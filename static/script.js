// API Base URL
const API_BASE = 'http://127.0.0.1:5000';

// Helper function to show notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Helper function to make API requests
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${url}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// ========================
// TASKS FUNCTIONS
// ========================

// Load all tasks
async function loadTasks() {
    try {
        const data = await apiRequest('/tasks');
        displayTasks(data.tasks);
        updateTaskStats(data.tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksList').innerHTML = '<div class="loading">Error loading tasks</div>';
    }
}

// Display tasks in the UI
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="loading">No tasks yet. Create your first task!</div>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.done ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-header">
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.content)}</div>
                </div>
                <div class="task-actions">
                    <button class="btn-success" onclick="toggleTask(${task.id})">
                        <i class="fas ${task.done ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn-secondary" onclick="editTask(${task.id}, '${escapeHtml(task.content)}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add new task
async function addTask(content) {
    try {
        const result = await apiRequest('/tasks', 'POST', { content });
        showToast('Task added successfully!');
        loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Toggle task completion
async function toggleTask(id) {
    try {
        const result = await apiRequest(`/tasks/${id}/complete`, 'PUT');
        showToast('Task status updated!');
        loadTasks();
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

// Edit task
async function editTask(id, currentContent) {
    const newContent = prompt('Edit task:', currentContent);
    if (newContent && newContent.trim()) {
        try {
            const result = await apiRequest(`/tasks/${id}`, 'PUT', { content: newContent });
            showToast('Task updated successfully!');
            loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }
}

// Delete task
async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const result = await apiRequest(`/tasks/${id}`, 'DELETE');
            showToast('Task deleted successfully!');
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}

// Update task statistics
function updateTaskStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
}

// ========================
// USERS FUNCTIONS
// ========================

// Load all users
async function loadUsers() {
    try {
        const data = await apiRequest('/users');
        displayUsers(data.users);
        document.getElementById('totalUsers').textContent = data.users.length;
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersList').innerHTML = '<div class="loading">Error loading users</div>';
    }
}

// Display users in the UI
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="loading">No users yet. Create your first user!</div>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item" data-id="${user.id}">
            <div class="user-header">
                <div class="user-name">
                    <strong>${escapeHtml(user.name)} ${escapeHtml(user.lastname)}</strong>
                </div>
                <div class="user-actions">
                    <button class="btn-secondary" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="user-address">
                <i class="fas fa-map-marker-alt"></i>
                ${user.address.city ? user.address.city + ', ' : ''}
                ${user.address.country ? user.address.country : ''}
                ${user.address.postal_code ? ' (' + user.address.postal_code + ')' : ''}
                ${!user.address.city && !user.address.country ? 'No address provided' : ''}
            </div>
        </div>
    `).join('');
}

// Add new user
async function addUser(userData) {
    try {
        const result = await apiRequest('/users', 'POST', userData);
        showToast('User created successfully!');
        loadUsers();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

// Edit user
async function editUser(id) {
    // First, get current user data
    try {
        const user = await apiRequest(`/users/${id}`);
        const newName = prompt('Edit first name:', user.name);
        const newLastname = prompt('Edit last name:', user.lastname);
        const newCity = prompt('Edit city:', user.address.city);
        const newCountry = prompt('Edit country:', user.address.country);
        const newPostalCode = prompt('Edit postal code:', user.address.postal_code);
        
        const updateData = {};
        if (newName && newName.trim()) updateData.name = newName.trim();
        if (newLastname && newLastname.trim()) updateData.lastname = newLastname.trim();
        if (newCity && newCity.trim()) updateData.city = newCity.trim();
        if (newCountry && newCountry.trim()) updateData.country = newCountry.trim();
        if (newPostalCode && newPostalCode.trim()) updateData.postal_code = newPostalCode.trim();
        
        if (Object.keys(updateData).length > 0) {
            const result = await apiRequest(`/users/${id}`, 'PUT', updateData);
            showToast('User updated successfully!');
            loadUsers();
        }
    } catch (error) {
        console.error('Error editing user:', error);
    }
}

// Delete user
async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const result = await apiRequest(`/users/${id}`, 'DELETE');
            showToast('User deleted successfully!');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================
// EVENT LISTENERS
// ========================

// Task form submission
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('taskContent').value.trim();
    if (content) {
        addTask(content);
        document.getElementById('taskContent').value = '';
    }
});

// User form submission
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('userName').value.trim(),
        lastname: document.getElementById('userLastname').value.trim(),
        city: document.getElementById('userCity').value.trim(),
        country: document.getElementById('userCountry').value.trim(),
        postal_code: document.getElementById('userPostalCode').value.trim()
    };
    
    if (userData.name && userData.lastname) {
        await addUser(userData);
        // Clear form
        document.getElementById('userName').value = '';
        document.getElementById('userLastname').value = '';
        document.getElementById('userCity').value = '';
        document.getElementById('userCountry').value = '';
        document.getElementById('userPostalCode').value = '';
    } else {
        showToast('Name and lastname are required!', 'error');
    }
});

// ========================
// INITIALIZE APP
// ========================
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadUsers();
});