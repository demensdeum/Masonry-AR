<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$insertEnabled = true;
$minEntitesPerSector = 3;
$entitiesChance = 26;
$polling_timeout_seconds = 3;
$walkChallengeChance = 4;
$treasureChestChance = 4;

$sessionUUID = SessionController::sessionUUID();

if (!$sessionUUID) {
    $response = array(
        'code' => 2,
        'message' => "Session UUID is incorrect",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);   
    exit(0);
}

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

$hero = heroForSessionUUID($sessionUUID);

if ($hero) {
    $update_date = strtotime($hero["update_date"]);
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
        'message' => "Entities fetch error: hero not found. huh?",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
    $conn->close();      
    exit(0);       
}

$heroID = $hero["id"];
if (!$heroID) {
    $response = array(
        'code' => 69,
        'message' => "Entities fetch error: no hero id. huh?",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
    $conn->close();      
    exit(0);       
}

$sqlUpdate = "UPDATE entities SET update_date = utc_timestamp(), latitude = $latitude, longitude = $longitude WHERE id = '$heroID'";
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
        if (mt_rand(0, $entitiesChance) == 0) {     
            $randomRecords = mt_rand(1, $minEntitesPerSector);
            for ($i = 0; $i < $randomRecords; $i++) {
                $balance = mt_rand(1, 3) * 100;
                $entityLatitude = $eyesMinimalEntityLatitude + mt_rand(0, $eyesDistance * 2) / 10000;
                $entityLongitude = $eyesMinimalEntityLongitude + mt_rand(0, $eyesDistance * 2) / 10000;
                $entity_type = "eye";
                $model = "DEFAULT";
                if (mt_rand(0, $walkChallengeChance) == 0) {
                    $entity_type = "walkChallenge";
                }
                elseif (mt_rand(0, $treasureChestChance) == 0) {
                    $model = "com.demensdeum.treasure.chest";
                }
                $sqlInsert = "INSERT INTO entities 
                (type, balance, latitude, longitude, model) 
                VALUES ('". $entity_type . "', $balance, $entityLatitude, $entityLongitude, '". $model ."')";
                $conn->query($sqlInsert);
            }
        }
    }
}

$sqlSelect = "
SELECT *
FROM entities e
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
            'type' => $row["type"],
            'model' => "DEFAULT",
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
