<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$session_uuid = $_COOKIE["session_uuid"];

if (!validateSession($session_uuid)) {
    echo json_encode(array('code' => 1, 'message' => "Wrong session"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$conn = dbConnect();

if (!isset($_GET['type'])) {
    echo json_encode(array('code' => 2, 'message' => "Need type as get param"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$type = $conn->real_escape_string($_GET['type']);
$entities = entitiesOfType($type);
echo json_encode(array('code' => 0, 'entities' => $entities), JSON_UNESCAPED_UNICODE);

$conn->close();