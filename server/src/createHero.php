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

$heroEntities = entitiesOfType("hero");

if (count($heroEntities) > 0) {
    echo json_encode(array('code' => 2, 'message' => "One hero already exists for user"), JSON_UNESCAPED_UNICODE);
    exit(0);
}