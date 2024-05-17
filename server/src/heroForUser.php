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

$stmt = $conn->prepare("CALL OwnedHero(?)");
$stmt->bind_param("s", $session_uuid);
$stmt->execute();

$result = $stmt->get_result();
$entities = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(array('code' => 0, 'entities' => $entities), JSON_UNESCAPED_UNICODE);

$conn->close();