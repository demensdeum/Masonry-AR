<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$heroUuid = "";

$insertEnabled = true;
$minEntitesPerSector = 3;

if (!isset($_COOKIE["heroUuid"])) {
    $response = array(
        'code' => 3,
        'message' => "Not authorized: no heroUuid",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit(0);    
} else {
    $heroUuid = $_COOKIE["heroUuid"];
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $heroUuid)) {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $heroUuid",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
}

$heroUuid = $_COOKIE["heroUuid"];
$latitude = 0.0;
$longitude = 0.0;

if (!isset($_GET['latitude']) || !isset($_GET['longitude'])) {
    $response = array(
        'code' => 1,
        'message' => "Latitude or longitude must be provided",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);   
    exit(0);
}

$latitude_input = filter_input(INPUT_GET, 'latitude', FILTER_VALIDATE_FLOAT);
if ($latitude_input === false) {
    $response = array(
        'code' => 2,
        'message' => "Latitude format is invalid",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);  
    exit(0);
}
$latitude = $latitude_input;

$longitude_input = filter_input(INPUT_GET, 'longitude', FILTER_VALIDATE_FLOAT);
if ($longitude_input === false) {
    $response = array(
        'code' => 3,
        'message' => "Longitude format is invalid",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);   
    exit(0);
}
$longitude = $longitude_input;

if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
    $response = array(
        'code' => 4,
        'message' => "Latitude or langitude out of range",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);   
    exit(0);
}

$conn = dbConnect();

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}



$sqlUpdate = "UPDATE entities SET latitude = $latitude, longitude = $longitude WHERE uuid = '$heroUuid'";
$conn->query($sqlUpdate);

if ($insertEnabled) {

    $borderDistance = 7;
    $minimalEntityLatitude = $latitude - $borderDistance / 10000;
    $minimalEntityLongitude = $longitude - $borderDistance / 10000;
    $maximalEntityLatitude = $latitude + $borderDistance / 10000;
    $maximalEntityLongitude = $longitude + $borderDistance / 10000;

    $sqlCheck = "SELECT COUNT(*) as count FROM entities WHERE latitude >= $minimalEntityLatitude AND latitude <= $maximalEntityLatitude AND longitude >= $minimalEntityLongitude AND longitude <= $maximalEntityLongitude";
    $resultCheck = $conn->query($sqlCheck);
    $rowCheck = $resultCheck->fetch_assoc();

    if ($rowCheck == null) {
        $response = array(
            'code' => 5,
            'message' => "RowCheck = null",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);  
    }

    $count = $rowCheck['count'];

    if ($count < $minEntitesPerSector) {
        $randomRecords = mt_rand(0, 10) == 0 ? mt_rand(1, $minEntitesPerSector) : 0;        
        for ($i = 0; $i < $randomRecords; $i++) {
            $uuid = generateUUID();
            $balance = mt_rand(1, 3) * 100;
            $entityLatitude = $minimalEntityLatitude + mt_rand(0, $borderDistance * 2) / 10000;
            $entityLongitude = $minimalEntityLongitude + mt_rand(0, $borderDistance * 2) / 10000;
            $sqlInsert = "INSERT INTO entities (uuid, type, balance, latitude, longitude) VALUES ('$uuid', 'eye', $balance, $entityLatitude, $entityLongitude)";
            $conn->query($sqlInsert);
        }
    }
}

$sqlSelect = "SELECT * FROM entities";
$result = $conn->query($sqlSelect);

if ($result->num_rows > 0) {

    $data = array();

    while($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => $row["id"],
            'uuid' => $row["uuid"],
            'type' => $row["type"],
            'balance' => $row["balance"],
            'latitude' => $row["latitude"],            
            'longitude' => $row["longitude"]
        );
    }

    $response = array(
        'code' => 0,
        'message' => "Got entities",
        'entities' => $data
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);  
    $conn->close();
    exit(0);
} else {
    $response = array(
        'code' => 0,
        'message' => "No entities",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);  
}
