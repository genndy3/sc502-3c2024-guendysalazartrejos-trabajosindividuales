document.addEventListener('DOMContentLoaded', function(){

    let isEditMode = false
    let editingId;
    const tasks = [{
        id: 1,
        title: "Complete project report",
        description: "Prepare and submit the project report",
        dueDate: "2024-12-01",
        comments: [{
            id: 1,
            description: "This is a comment"
        }]
    },
    {
        id:2,
        title: "Team Meeting",
        description: "Get ready for the season",
        dueDate: "2024-12-01",
        comments: []
    },
    {
        id: 3,
        title: "Code Review",
        description: "Check partners code",
        dueDate: "2024-12-01",
        comments: []
    },
    {
        id: 4,
        title: "Deploy",
        description: "Check deploy steps",
        dueDate: "2024-12-01",
        comments: []
    }];
    
    function loadTasks(){
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        tasks.forEach(function(task){
            const taskCard = document.createElement('div');
            const commentsHTML = task.comments.length > 0 
            ? task.comments.map((comment) => `
                <div class="comment d-flex justify-content-between" data-id="${comment.id}">
                    <div><p>${comment.description}</p></div>
                    <a href="#" class="text-primary delete-comment" data-task-id="${task.id}" data-comment-id="${comment.id}">Delete</a>
                </div>
                <hr>
            `).join('')            
            : '';

            taskCard.className = 'col-md-4 mb-3';
            taskCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small> </p>
                    <p class="card-text">${commentsHTML}</p>
                    <a href="#" class="text-primary add-comment" data-bs-toggle="modal" data-bs-target="#commentModal" data-task-id="${task.id}">Add comment</a>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-secondary btn-sm edit-task" data-id="${task.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                </div>
            </div>
            `;
            taskList.appendChild(taskCard);
        });

        document.querySelectorAll('.edit-task').forEach(function(button){
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-task').forEach(function(button){
            button.addEventListener('click', handleDeleteTask);
        });

        document.querySelectorAll('.delete-comment').forEach(function(button){
            button.addEventListener('click', handleDeleteComment);
        });
    }

    function handleEditTask(event) {
        try {
            const taskId = parseInt(event.target.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('due-date').value = task.dueDate;
            isEditMode = true;
            editingId = taskId;
            const modal = new bootstrap.Modal(document.getElementById('taskModal'));
            modal.show();
        } catch (error) {
            alert("Error trying to edit a task");
            console.error(error);
        }
    }


    function handleDeleteTask(event){
        const id = parseInt(event.target.dataset.id);
        const index = tasks.findIndex( t => t.id == id);
        tasks.splice(index,1);
        loadTasks();
    }

    function handleDeleteComment(event){
        const id = parseInt(event.target.dataset.id);
        const index = tasks.findIndex( t => t.id == id);
        tasks.splice(index,1);
        loadTasks();
    }

    function handleDeleteComment(event) {
        event.preventDefault();
    
        const taskId = event.target.getAttribute('data-task-id');
        const commentId = event.target.getAttribute('data-comment-id');
    
        const task = tasks.find(t => t.id == taskId);
        
        if (task) {
            const commentIndex = task.comments.findIndex(comment => comment.id == commentId);
            
            if (commentIndex !== -1) {
                task.comments.splice(commentIndex, 1);
            }
        }
    
        loadTasks();
    }


    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-desc").value;
        const dueDate = document.getElementById("due-date").value;
        if (isEditMode) {
            const task = tasks.find(t => t.id === editingId);
            task.title = title;
            task.description = description;
            task.dueDate = dueDate;
        } else {
            const newTask = {
                id: tasks.length + 1,
                title: title,
                description: description,
                dueDate: dueDate,
                comments: []
            };
            tasks.push(newTask);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modal.hide();
        editingId = null;
        isEditMode = false;
        loadTasks();
    });

    document.getElementById('comment-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const taskId = parseInt(document.getElementById("task-id").value);
        const description = document.getElementById("comment-description").value;
         
        const newComment = {
            id: tasks.find(t => t.id === taskId).comments.length + 1,
            description: description,
        };
    
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.comments.push(newComment);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
        modal.hide();
        loadTasks();
    });

    loadTasks();

    document.getElementById('taskModal').addEventListener('show.bs.modal',function(){
        if (!isEditMode){
            document.getElementById('task-form').reset();
        }
    });

    document.getElementById('taskModal').addEventListener('hidden.bs.modal',function(){
        editingId = null;
        isEditMode = false;
    })
    loadTasks();

    document.getElementById('commentModal').addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const taskId = button.getAttribute('data-task-id');
        document.getElementById('task-id').value = taskId;
    });

    document.getElementById('commentModal').addEventListener('hidden.bs.modal',function(){
        document.getElementById('comment-form').reset();
    });
});