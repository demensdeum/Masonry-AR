<?php
ini_set('display_errors', 1); 

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

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

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

$sqlCheck = "SELECT COUNT(*) as count FROM entities";
$resultCheck = $conn->query($sqlCheck);
$rowCheck = $resultCheck->fetch_assoc();
$count = $rowCheck['count'];
$randomRecords = mt_rand(1, 3);

if ($count < $randomRecords) {
    for ($i = 0; $i < $randomRecords; $i++) {
        $balance = mt_rand(100, 300);
        $sqlInsert = "INSERT INTO entities (type, balance, latitude, longitude) VALUES ('eye', $balance, 0.0, 0.0)";
        $conn->query($sqlInsert);
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
} else {
    $response = array(
        'code' => 0,
        'message' => "No entities",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);  
}

$conn->close();
?>
