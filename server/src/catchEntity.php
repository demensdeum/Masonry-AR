<?php
$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar"; // Replace with your database name

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

if (isset($_GET['uuid'])) {
    $uuid = $_GET['uuid'];

    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {

        $sql = "SELECT * FROM entities WHERE uuid = '$uuid'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {

            $deleteSql = "DELETE FROM entities WHERE uuid = '$uuid'";
            $conn->query($deleteSql);

            $response = array(
                'code' => 0,
                'message' => "Entity $uuid caught!"
            );
        } else {
            $response = array(
                'code' => 1,
                'message' => "Entity $uuid not found!"
            );
        }
    } else {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $uuid"
        );
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(array('code' => 3, 'message' => 'UUID parameter is missing'), JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
