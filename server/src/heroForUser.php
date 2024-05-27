<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$conn = dbConnect();

$sessionUUID = SessionController::sessionUUID();

if (!$sessionUUID) {
    echo json_encode(array('code' => 1, 'message' => "Wrong session"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$hero = heroForSessionUUID($sessionUUID);

if ($hero) {
    echo json_encode(array('code' => 0, 'message' => "Hero exists!", 'hero' => $hero), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
} else {
    echo json_encode(array('code' => 1, 'message' => "No hero", 'hero' => NULL), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
}
