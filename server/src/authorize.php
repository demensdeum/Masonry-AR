<?php
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

$conn = new mysqli($servername, $username, $password, $database);

function createHero() {
    global $conn;
    $heroUuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
    setcookie("heroUuid", $heroUuid, time() + 10 * 365 * 24 * 60 * 60, "/");
    $sqlInsert = "INSERT INTO entities (uuid, type, latitude, longitude) VALUES ('$heroUuid', 'hero', 0.0, 0.0)";
    $conn->query($sqlInsert);
    $response = array(
        'code' => 0,
        'message' => "Authorization success: new data created",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);    
} 

if (!isset($_COOKIE["heroUuid"])) {
    createHero();
} else {
    $heroUuid = $_COOKIE["heroUuid"];
    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $heroUuid)) {
        $sqlCheck = "SELECT * FROM entities WHERE type = 'hero' AND uuid = '$heroUuid'";
        $result = $conn->query($sqlCheck);

        if ($result->num_rows == 0) {
            createHero();
        }
        else {
            $response = array(
                'code' => 0,
                'message' => "Authorization success: using saved data",
                'entities' => []
            );
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }
    else {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $heroUuid",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
}
?>
