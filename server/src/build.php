<?php
ini_set('display_errors', 1); 

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

$conn = new mysqli($servername, $username, $password, $database);
$heroUuid = "";

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

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

$sql = "SELECT * FROM entities WHERE uuid = '$heroUuid'";
$result = $conn->query($sql);

if ($result == false) {
    $response = array(
        'code' => 4,
        'message' => "Build error: heroUuid search error 1",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);   
    exit(0);        
}    

if ($result->num_rows > 0) {

    $row = $result->fetch_assoc();
    if ($row == null) {
        $response = array(
            'code' => 5,
            'message' => "Build error: heroUuid search error 2",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);   
        exit(0);  
    }

    $latitude = $row['latitude'];
    $longitude = $row['longitude'];



    $sqlInsert = "INSERT INTO entities (type, balance, latitude, longitude) VALUES ('building', 1000, $latitude, $longitude)";
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

    $response = array(
        'code' => 0,
        'message' => "Build success!",
        'entities' => $data
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit(0);    
}

$conn->close();
?>
