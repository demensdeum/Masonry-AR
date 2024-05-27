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
$hero = $result->fetch_assoc();

if ($hero) {
    echo json_encode(array('code' => 0, 'message' => "Hero exists!", 'hero' => $hero), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
} else {
    echo json_encode(array('code' => 1, 'message' => "No hero", 'hero' => NULL), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
}
