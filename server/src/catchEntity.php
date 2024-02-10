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

if (isset($_GET['uuid'])) {
    $uuid = $_GET['uuid'];

    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {

        $sql = "SELECT * FROM entities WHERE uuid = '$uuid'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {

            $row = $result->fetch_assoc();
            $entityBalance = $row['balance'];

            $balanceUpdateSql = "UPDATE entities SET balance = balance + $entityBalance WHERE uuid = '$heroUuid'";
            $conn->query($balanceUpdateSql);

            $updateSql = "UPDATE entities SET is_visible = false, update_date = CURRENT_TIMESTAMP() WHERE uuid = '$uuid' AND type ='eye'";
            $conn->query($updateSql);

            $response = array(
                'code' => 0,
                'message' => "Entity $uuid caught!",
                'entities' => []
            );
        } else {
            $response = array(
                'code' => 1,
                'message' => "Entity $uuid not foundd!",
                'entities' => []
            );
        }
    } else {
        $response = array(
            'code' => 4,
            'message' => "Invalid UUID format for $uuid",
            'entities' => []
        );
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit(0);
} else {
    echo json_encode(array('code' => 3, 'message' => 'UUID parameter is missing'), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$conn->close();
?>
