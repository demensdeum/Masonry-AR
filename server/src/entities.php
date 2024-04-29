<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$heroUUID = "";

$insertEnabled = true;
$minEntitesPerSector = 3;
$eyeChance = 12;
$polling_timeout_seconds = 3;

if (!isset($_COOKIE["privateHeroUUID"])) {
    $response = array(
        'code' => 3,
        'message' => "Not authorized: no heroUUID",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit(0);    
} else {
    $heroUUID = $_COOKIE["privateHeroUUID"];
    if (!validateUUID($heroUUID)) {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $heroUUID",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
}

$heroUUID = $_COOKIE["privateHeroUUID"];
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

$sql = "SELECT * FROM entities WHERE type = 'hero' AND private_uuid = '$heroUUID'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($row == null) {
        $response = array(
            'code' => 7,
            'message' => "Build error: heroUUID search error 2",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE); 
        $conn->close();          
        exit(0);  
    }

    $update_date = strtotime($row["update_date"]);
    $three_seconds_ago = time() - $polling_timeout_seconds;

    if ($update_date > $three_seconds_ago) {

        $formatted_update_date = date('Y-m-d H:i:s', $update_date);
        $formatted_three_seconds_ago_date = date('Y-m-d H:i:s', $three_seconds_ago);

        $response = array(
            'code' => 8,
            'message' => "TOO_EARLY_FOR_ENTITIES_TIMEOUT_REQUEST_ERROR",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE); 
        $conn->close();      
        exit(0);              
    }
}
else {
    $response = array(
        'code' => 6,
        'message' => "Entities fetch error: heroUUID $heroUUID not found}",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
    $conn->close();      
    exit(0);       
}

$sqlUpdate = "UPDATE entities SET update_date = utc_timestamp(), latitude = $latitude, longitude = $longitude WHERE private_uuid = '$heroUUID'";
$conn->query($sqlUpdate);

$borderDistance = 40;
$eyesDistance = 7;

$minimalEntityLatitude = $latitude - $borderDistance / 10000;
$minimalEntityLongitude = $longitude - $borderDistance / 10000;
$maximalEntityLatitude = $latitude + $borderDistance / 10000;
$maximalEntityLongitude = $longitude + $borderDistance / 10000;

$eyesMinimalEntityLatitude = $latitude - $eyesDistance / 10000;
$eyesMinimalEntityLongitude = $longitude - $eyesDistance / 10000;
$eyesMaximalEntityLatitude = $latitude + $eyesDistance / 10000;
$eyesMaximalEntityLongitude = $longitude + $eyesDistance / 10000;

if ($insertEnabled) {
    $sqlCheck = "
    SELECT COUNT(*) as count FROM entities WHERE type = 'eye' 
    AND latitude >= $eyesMinimalEntityLatitude 
    AND latitude <= $eyesMaximalEntityLatitude 
    AND longitude >= $eyesMinimalEntityLongitude 
    AND longitude <= $eyesMaximalEntityLongitude
    ";
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
        if (mt_rand(0, $eyeChance) == 0) {     
            $randomRecords = mt_rand(1, $minEntitesPerSector);
            for ($i = 0; $i < $randomRecords; $i++) {
                $uuid = generateUUID();
                $balance = mt_rand(1, 3) * 100;
                $entityLatitude = $eyesMinimalEntityLatitude + mt_rand(0, $eyesDistance * 2) / 10000;
                $entityLongitude = $eyesMinimalEntityLongitude + mt_rand(0, $eyesDistance * 2) / 10000;
                $sqlInsert = "INSERT INTO entities 
                (uuid, type, balance, latitude, longitude) 
                VALUES ('$uuid', 'eye', $balance, $entityLatitude, $entityLongitude)";
                $conn->query($sqlInsert);
            }
        }
    }
}

$sqlSelect = "
SELECT e.*, o.name AS owner_name
FROM entities e
LEFT JOIN entities o ON e.owner_uuid = o.uuid
WHERE e.latitude >= $minimalEntityLatitude 
  AND e.latitude <= $maximalEntityLatitude 
  AND e.longitude >= $minimalEntityLongitude 
  AND e.longitude <= $maximalEntityLongitude
  AND (e.type != 'hero' OR e.update_date > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE));
";
$result = $conn->query($sqlSelect);

if ($result->num_rows > 0) {

    $data = array();

    while($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => $row["id"],
            'uuid' => $row["uuid"],
            'name' => $row['name'],
            'ownerName' => $row['owner_name'],
            'order' => $row["masonic_order"],
            'type' => $row["type"],
            'model' => $row["model"],
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
