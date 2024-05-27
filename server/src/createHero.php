<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$sessionUUID = SessionController::sessionUUID();

if (!$sessionUUID) {
    echo json_encode(array('code' => 1, 'message' => "Wrong session"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$userID = SessionController::userID();
if ($userID == null) {
    echo json_encode(array('code' => 2, 'message' => "No userID found!"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$conn = dbConnect();
$balance = 0;

try {    
    $conn->begin_transaction();
    $sql = "INSERT INTO entities (type, balance) VALUES ('hero', $balance)";
    $conn->execute_query($sql);

    $sql = "INSERT INTO user_to_hero (user_id, entity_id) VALUES ($userID, LAST_INSERT_ID())";
    $conn->execute_query($sql);

    $conn->commit();

    echo json_encode(array('code' => 0, 'message' => "Hero created!"), JSON_UNESCAPED_UNICODE);
    exit(0);
} catch(\Throwable $e) {
    $conn->rollback();
    echo json_encode(array('code' => 3, 'message' => $e->getMessage()), JSON_UNESCAPED_UNICODE);
    exit(0);
}
