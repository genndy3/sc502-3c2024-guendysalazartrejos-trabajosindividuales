<?php

require 'db.php';

function obtenerCommentsPorTask($task_id)
{
    global $pdo;
    try {
        $sql = "Select * from comments where task_id = :task_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['task_id' => $task_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        logError("Error al obtener comentarios: " . $e->getMessage());
        return [];
    }
}

function crearComentario($task_id, $comment): int|string
{
    global $pdo;
    try {
        $sql = "INSERT INTO comments (task_id, comment) values (:task_id, :comment)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'task_id' => $task_id,
            'comment' => $comment,
        ]);
        //devuelve el id de la tarea creada en la linea anterior
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando comentario: " . $e->getMessage());
        return 0;
    }
}

function editarComentario($id, $comment)
{
    global $pdo;

    try {
        $sql = "UPDATE comments set comment = :comment where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'comment' => $comment,
            'id' => $id
        ]);

        $affectedRows = $stmt->rowCount();
        logError("Filas afectadas: {$affectedRows}");

        return $affectedRows > 0;
    } catch (Exception $e) {
        logError("Error al editar comentario: " . $e->getMessage());
        return false;
    }
}


function eliminarComentario($id)
{
    global $pdo;
    try {
        $sql = "delete from comments where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;// true si se elimina algo
    } catch (Exception $e) {
        logError("Error al eliminar el comentario: " . $e->getMessage());
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
            $task_id = $_GET['task_id'];
            $comments = obtenerCommentsPorTask($task_id);
            echo json_encode($comments);
            break;

        case 'POST':
            $input = getJsonInput();
            if (isset($input['task_id'], $input['comment'])) {
                //vamos a crear tarea
                $id = crearComentario($input['task_id'], $input['comment']);
                if ($id > 0) {
                    http_response_code(201);
                    echo json_encode(value: ["messsage" => "Comentario creado: ID:" . $id]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error general creando el comentario"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;

        case 'PUT':
            $input = getJsonInput();
            if (isset($input['comment']) && $_GET['id']) {
                $editResult = editarComentario($_GET['id'], $input['comment']);
                if ($editResult) {
                    http_response_code(201);
                    echo json_encode(['message' => "Comentario actualizado"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Error actualizando el comentario"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;

        case 'DELETE':
            if ($_GET['id']) {
                $fueEliminado = eliminarComentario($_GET['id']);
                if ($fueEliminado) {
                    http_response_code(200);
                    echo json_encode(['message' => "Comentario eliminado"]);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Sucedio un error al eliminar el comentario']);
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









