document.addEventListener('DOMContentLoaded', function () {

    let isEditMode = false;
    let edittingId;
    let tasks = [];
    const API_URL = 'backend/tasks.php';
    const API_URL_COMMENTS = 'backend/comments.php';

    async function loadTasks() {
        //va al servidor por las tareas
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                tasks = await response.json();
                renderTasks(tasks);
            } else {
                if (response.status == 401) {
                    window.location.href = 'index.html';
                }
                console.error("Error al obtener tareas");
            }
        } catch (err) {
            console.error(err);
        }
    }

    function renderTasks(tasks) {
        //traer las tareas desde el backend
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        tasks.forEach(function (task) {

            let commentsList = '';
            if (task.comments && task.comments.length > 0) {
                commentsList = '<ul class="list-group list-group-flush">';
                task.comments.forEach(comment => {
                    commentsList += `<li class="list-group-item">${comment.comment} 
                    <button type="button" class="btn btn-sm btn-link edit-comment" data-comment="${comment.comment}" data-id="${task.id}" data-commentid="${comment.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-link remove-comment" data-visitid="${task.id}" data-commentid="${comment.id}">Remove</button>
                    </li>`;
                });
                commentsList += '</ul>';
            }
            const taskCard = document.createElement('div');
            taskCard.className = 'col-md-4 mb-3';
            taskCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><small class="text-muted">Due: ${task.due_date}</small> </p>
                    ${commentsList}
                     <button type="button" class="btn btn-sm btn-link add-comment"  data-id="${task.id}">Add Comment</button>

                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-secondary btn-sm edit-task"data-id="${task.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                </div>
            </div>
            `;
            taskList.appendChild(taskCard);
        });

        document.querySelectorAll('.edit-task').forEach(function (button) {
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-task').forEach(function (button) {
            button.addEventListener('click', handleDeleteTask);
        });

        document.querySelectorAll('.add-comment').forEach(function (button) {
            button.addEventListener('click', function (e) {
                // alert(e.target.dataset.id);
                document.getElementById("comment-task-id").value = e.target.dataset.id;
                const modal = new bootstrap.Modal(document.getElementById("commentModal"));
                modal.show()

            })
        });

        document.querySelectorAll('.edit-comment').forEach(function (button) {
            button.addEventListener('click', handleEditComment); {
            }
        });

        document.querySelectorAll('.remove-comment').forEach(function (button) {
            button.addEventListener('click', async function (e) {
                let commentId = parseInt(e.target.dataset.commentid);

                const response = await fetch(`${API_URL_COMMENTS}?id=${commentId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    loadTasks();
                } else {
                    console.error("Error eliminando las tareas");
                }
                loadTasks();
            })
        });
    }

    function handleEditTask(event) {
        try {
            // alert(event.target.dataset.id);
            //localizar la tarea quieren editar
            const taskId = parseInt(event.target.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            //cargar los datos en el formulario 
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('due-date').value = task.due_date;
            //ponerlo en modo edicion
            isEditMode = true;
            edittingId = taskId;
            //mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById("taskModal"));
            modal.show();


        } catch (error) {
            alert("Error trying to edit a task");
            console.error(error);
        }
    }

    function handleEditComment(event) {
        try {
            // alert(event.target.dataset.id);
            //localizar la tarea quieren editar
            const taskId = parseInt(event.target.dataset.id);
            const commentId = parseInt(event.target.dataset.commentid);
            const comment = event.target.dataset.comment;

            //cargar los datos en el formulario 
            document.getElementById('task-comment-update').value = comment;
            document.getElementById('comment-id').value = commentId;
            document.getElementById('task-id').value = taskId;
            const modal = new bootstrap.Modal(document.getElementById("UpdateCommentModal"));
            modal.show();


        } catch (error) {
            alert("Error trying to edit a comment");
            console.error(error);
        }
    }


    async function handleDeleteTask(event) {
        const id = parseInt(event.target.dataset.id);
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadTasks();
        } else {
            console.error("Error eliminando las tareas");
        }
    }

    document.getElementById('update-comment-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const comment_id = document.getElementById('comment-id').value;
        const task_id = document.getElementById('task-id').value;
        const comment = document.getElementById('task-comment-update').value;

        const response = await fetch(`${API_URL_COMMENTS}?id=${comment_id}`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({task_id: task_id, comment: comment }),
            credentials: "include"
        });
        if (!response.ok) {
            console.error("Sucedió un error");
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('UpdateCommentModal'));
        modal.hide();
        loadTasks();

    })

    document.getElementById('comment-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const comment = document.getElementById('task-comment').value;
        const selectedTask = parseInt(document.getElementById('comment-task-id').value);
        const task = tasks.find(t => t.id === selectedTask);

        const newComment = {
            task_id: task.id,
            comment: comment
        };
        const response = await fetch(API_URL_COMMENTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newComment),
            credentials: "include"
        });
        if (!response.ok) {
            console.error("Sucedio un error");
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
        modal.hide();
        loadTasks();

    })

    document.getElementById('task-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-desc").value;
        const dueDate = document.getElementById("due-date").value;

        if (isEditMode) {
            //editar
            const response = await fetch(`${API_URL}?id=${edittingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, description: description, due_date: dueDate }),
                credentials: "include"
            });
            if (!response.ok) {
                console.error("Sucedió un error");
            }

        } else {
            const newTask = {
                title: title,
                description: description,
                due_date: dueDate
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask),
                credentials: "include"
            });
            if (!response.ok) {
                console.error("Sucedio un error");
            }
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modal.hide();
        loadTasks();
    });

    document.getElementById('commentModal').addEventListener('show.bs.modal', function () {
        document.getElementById('comment-form').reset();
    })

    document.getElementById('taskModal').addEventListener('show.bs.modal', function () {
        if (!isEditMode) {
            document.getElementById('task-form').reset();
            // document.getElementById('task-title').value = "";
            // document.getElementById('task-desc').value = "";
            // document.getElementById('due-date').value = "";
        }
    });

    document.getElementById("UpdateCommentModal").addEventListener('hidden.bs.modal', function () {
        document.getElementById('update-comment-form').reset();
    })

    document.getElementById("taskModal").addEventListener('hidden.bs.modal', function () {
        edittingId = null;
        isEditMode = false;
    })
    loadTasks();

});