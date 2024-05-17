<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$conn = dbConnect();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = $conn->real_escape_string($_POST['login']);
    $password = $conn->real_escape_string($_POST['password']);

    $sql = "SELECT * FROM users WHERE login = '$login' LIMIT 1";
    $result = $conn->query($sql);

    $row = $result->fetch_assoc();

    if ($result->num_rows > 0 && $row != null) {
        if (password_verify($password, $row['password'])) {
            $_SESSION['login'] = $login;
            $userID = intval($row['id']);
            
            $updateOrInsert = function($action, $userID, $conn) {
                $session_uuid = generateUUID();
                if ($action == "insert") {
                    $sql = "UPDATE sessions SET private_uuid = '$session_uuid' WHERE user_id = $userID";
                }
                elseif ($action == "update") {
                    $sql = "INSERT INTO sessions (private_uuid, user_id) VALUES ('$session_uuid', $userID)";
                }
                if ($conn->query($sql) === TRUE) {
                    $response = array(
                        'code' => 0,
                        'message' => "Login success",
                        'session_uuid' => $session_uuid
                    );
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(array('code' => 1, 'message' => "Failed to update session"), JSON_UNESCAPED_UNICODE);
                }                
            };

            $onSessionExists = function($userID, $conn) use ($updateOrInsert) {
                $updateOrInsert("update", $userID, $conn);
            };
            
            $onInsertExists = function($userID, $conn) use ($updateOrInsert) {
                $updateOrInsert("insert", $userID, $conn);
            };
            checkInsertOrUpdateRecord($userID, "user_id", $conn, "sessions", $onSessionExists, $onInsertExists);
        } else {
            echo json_encode(array('code' => 2, 'message' => "Invalid login or password"), JSON_UNESCAPED_UNICODE);
        }
    } else {
        # keep same error code and text for security
        echo json_encode(array('code' => 2, 'message' => "Invalid login or password"), JSON_UNESCAPED_UNICODE);
    }
}
