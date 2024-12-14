<?php

require 'db.php';

function crearTarea($user_id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "INSERT INTO tasks (user_id, title, description, due_date) values (:user_id, :title, :description, :due_date)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $user_id,
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date
        ]);
        //devuelve el id de la tarea creada en la linea anterior
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando tarea: " . $e->getMessage());
        return 0;
    }
}

function editarTarea($id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "UPDATE tasks set title = :title, description = :description, due_date = :due_date where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date,
            'id' => $id
        ]);
        $affectedRows = $stmt->rowCount();
        return $affectedRows > 0;
    } catch (Exception $e) {
        logError($e->getMessage());
        return false;
    }
}

//obtenerTareasPorUsuario + comentarios
function obtenerTareasConComentarios($user_id)
{
    global $pdo;
    try {
        $sql = "
            SELECT 
                t.id AS task_id, 
                t.user_id,
                t.title, 
                t.description, 
                t.due_date, 
                c.id AS comment_id, 
                c.task_id AS comment_task_id,
                c.comment AS comment_description
            FROM 
                tasks t
            LEFT JOIN 
                comments c ON t.id = c.task_id
            WHERE 
                t.user_id = :user_id
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Agrupar tareas y comentarios
        $tareas = [];
        foreach ($result as $row) {
            $task_id = $row['task_id'];
            if (!isset($tareas[$task_id])) {
                $tareas[$task_id] = [
                    'id' => $row['task_id'],
                    'user_id' => $row['user_id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'due_date' => $row['due_date'],
                    'comments' => []
                ];
            }
            if ($row['comment_id']) {
                $tareas[$task_id]['comments'][] = [
                    'id' => $row['comment_id'],
                    'task_id' => $row['comment_task_id'],
                    'comment' => $row['comment_description']
                ];
            }
        }

        return array_values($tareas);
    } catch (Exception $e) {
        logError("Error al obtener tareas con comentarios: " . $e->getMessage());
        return [];
    }
}

//Eliminar una tarea por id
function eliminarTarea($id)
{
    global $pdo;
    try {
        $sql = "delete from tasks where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;// true si se elimina algo
    } catch (Exception $e) {
        logError("Error al eliminar la tareas: " . $e->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');
function getJsonInput()
{
    return json_decode(file_get_contents("php://input"), true);
}

session_start();
if (isset($_SESSION['user_id'])) {
    //el usuario tiene sesion
    $user_id = $_SESSION['user_id'];
    logDebug($user_id);
    switch ($method) {
        case 'GET':
            //devolver las tareas del usuario conectado
            $tareas = obtenerTareasConComentarios($user_id);
            echo json_encode($tareas);
            break;

        case 'POST':
            $input = getJsonInput();
            if (isset($input['title'], $input['description'], $input['due_date'])) {
                //vamos a crear tarea
                $id = crearTarea($user_id, $input['title'], $input['description'], $input['due_date']);
                if ($id > 0) {
                    http_response_code(201);
                    echo json_encode(value: ["messsage" => "Tarea creada: ID:" . $id]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error general creando la tarea"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;

        case 'PUT':
            $input = getJsonInput();
            if (isset($input['title'], $input['description'], $input['due_date']) && $_GET['id']) {
                $editResult = editarTarea($_GET['id'], $input['title'], $input['description'], $input['due_date']);
                if ($editResult) {
                    http_response_code(201);
                    echo json_encode(['message' => "Tarea actualizada"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Error actualizando la tarea"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;

        case 'DELETE':
            if ($_GET['id']) {
                $fueEliminado = eliminarTarea($_GET['id']);
                if ($fueEliminado) {
                    http_response_code(200);
                    echo json_encode(['message' => "Tarea eliminada"]);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Sucedio un error al eliminar la tarea']);
                }

            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Metodo no permitido"]);
            break;
    }

} else {
    http_response_code(401);
    echo json_encode(["error" => "Sesion no activa"]);
}