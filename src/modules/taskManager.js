class TaskManager {
    constructor(store) {
        this.store = store;
        this.tasks = this.store.get('tasks') || [];
    }

    addTask(text) {
        const task = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.save();
        return task;
    }

    completeTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task && !task.completed) {
            task.completed = true;
            this.save();
            return true; // Reward valid
        }
        return false;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    }

    getTasks() {
        return this.tasks;
    }

    save() {
        this.store.set('tasks', this.tasks);
    }
}

module.exports = TaskManager;
