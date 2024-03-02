<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$build_enabled = true;

$conn = dbConnect();
$heroUUID = "";

$buildPrice = 1000;

if ($build_enabled == false) {
    $response = array(
        'code' => 6,
        'message' => "Building temporarily disabled",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();    
    exit(0);  
}

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

if (!isset($_COOKIE["privateHeroUUID"])) {
    $response = array(
        'code' => 3,
        'message' => "Not authorized: no heroUUID",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();    
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
        $conn->close();        
        exit(0);
    }
}

$sql = "SELECT * FROM entities WHERE private_uuid = '$heroUUID'";
$result = $conn->query($sql);  

if ($result->num_rows > 0) {

    $row = $result->fetch_assoc();
    if ($row == null) {
        $response = array(
            'code' => 5,
            'message' => "Build error: heroUUID search error 2",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE); 
        $conn->close();          
        exit(0);  
    }

    $balance = $row["balance"];

    if ($balance < $buildPrice) {
        $response = array(
            'code' => 7,
            'message' => "Build error: not enough money: $balance < $buildPrice",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE); 
        $conn->close();          
        exit(0);          
    }

    $latitude = $row['latitude'];
    $longitude = $row['longitude'];

    $uuid = generateUUID();

    $order = $row['masonic_order'];
    $heroPublicUUID = $row['uuid'];

    if  ($order == "NONE") {
        $response = array(
            'code' => 8,
            'message' => "Can't build without Masonic order ($order), select order first!",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE); 
        $conn->close();      
        exit(0);        
    }

    $borderDistance = 14;
    $minimalEntityLatitude = $latitude - $borderDistance / 10000;
    $minimalEntityLongitude = $longitude - $borderDistance / 10000;
    $maximalEntityLatitude = $latitude + $borderDistance / 10000;
    $maximalEntityLongitude = $longitude + $borderDistance / 10000;

    $sqlCheck = "SELECT COUNT(*) as count FROM entities WHERE type = 'building' AND latitude >= $minimalEntityLatitude AND latitude <= $maximalEntityLatitude AND longitude >= $minimalEntityLongitude AND longitude <= $maximalEntityLongitude";
    $resultCheck = $conn->query($sqlCheck);
    $rowCheck = $resultCheck->fetch_assoc();

    if ($rowCheck == null) {
        $response = array(
            'code' => 9,
            'message' => "RowCheck = null",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);  
    }

    $count = $rowCheck['count'];

    if ($count > 0) {
        $response = array(
            'code' => 10,
            'message' => "There is building in this area",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0); 
    }

    $sqlInsert = "INSERT INTO entities (uuid, owner_uuid, masonic_order, type, balance, latitude, longitude) VALUES ('$uuid', '$heroPublicUUID', '$order', 'building', 1000, $latitude, $longitude)";
    $conn->query($sqlInsert);

    $lastInsertID = $conn->insert_id;

    $sqlFetch = "SELECT * FROM entities WHERE id = '$lastInsertID'";
    $result = $conn->query($sqlFetch);

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

    $balanceUpdateSql = "UPDATE entities SET balance = balance - $buildPrice WHERE private_uuid = '$heroUUID'";
    $conn->query($balanceUpdateSql);

    $response = array(
        'code' => 0,
        'message' => "Build success!",
        'entities' => $data
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();    
    exit(0);    
}
else {
    $response = array(
        'code' => 4,
        'message' => "Build error: heroUUID $heroUUID not found}",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
    $conn->close();      
    exit(0);       
}
