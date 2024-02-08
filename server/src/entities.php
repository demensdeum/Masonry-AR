<?php
ini_set('display_errors', 1); 

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

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

    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} else {
    echo "[]";
}

$conn->close();
?>
