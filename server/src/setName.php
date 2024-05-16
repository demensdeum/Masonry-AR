<?php

include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$namelLenLimit = 32;
$conn = dbConnect();
$privateHeroUUID = "";

if (!isset($_COOKIE["privateHeroUUID"])) {
    $response = array(
        'code' => 1,
        'message' => "Not authorized: no heroUUID",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit(0);    
} else {
    $privateHeroUUID = $_COOKIE["privateHeroUUID"];
    if (!validateUUID($privateHeroUUID)) {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $privateHeroUUID",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
}

$privateHeroUUID = $_COOKIE["privateHeroUUID"];

if (isset($_GET['name'])) {
    $name = $conn->real_escape_string($_GET['name']);
    $nameLen = strlen($name);
    if ($nameLen > $namelLenLimit) {
        $response = array(
            'code' => 3,
            'message' => "Name is too long: $name - ($nameLen)/($namelLenLimit)",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);        
    }
    $updateSql = "UPDATE entities SET name = '$name' WHERE private_uuid = '$privateHeroUUID'";
    $conn->query($updateSql);

    $response = array(
        'code' => 0,
        'message' => "Name set to $name",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);    
}
else {
    $response = array(
        'code' => 4,
        'message' => "No name input parameter!",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0); 
}
