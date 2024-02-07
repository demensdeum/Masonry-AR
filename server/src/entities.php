<?php
$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

$sql = "SELECT * FROM entities";
$result = $conn->query($sql);


if ($result->num_rows > 0) {

    $data = array();

    while($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => $row["id"],
            'uuid' => $row["uuid"],
            'type' => $row["type"],
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
