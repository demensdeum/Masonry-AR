<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$orderlLenLimit = 32;

$conn = dbConnect();
$privateHeroUUID = "";

if ($conn->connect_error) {
    die("Database Connection Error: " . $conn->connect_error);
}

if (!isset($_COOKIE["privateHeroUUID"])) {
    $response = array(
        'code' => 4,
        'message' => "Not authorized: no heroUUID",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);    
} else {
    $privateHeroUUID = $_COOKIE["privateHeroUUID"];
    if (!validateUUID($privateHeroUUID)) {
        $response = array(
            'code' => 3,
            'message' => "Invalid UUID format for $privateHeroUUID",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);
    }
}

if (isset($_GET['order'])) {
    $order = $conn->real_escape_string($_GET['order']);
    $orderLen = strlen($order);
    if ($orderLen > $orderlLenLimit) {
        $response = array(
            'code' => 2,
            'message' => "Order is too long: $order - ($orderLen)/($orderlLenLimit)",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);        
    }
    $updateSql = "UPDATE entities SET masonic_order = '$order' WHERE private_uuid = '$privateHeroUUID'";
    $conn->query($updateSql);

    $response = array(
        'code' => 0,
        'message' => "Order set to $order",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);    
}
else {
    $response = array(
        'code' => 1,
        'message' => "No order input parameter!",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0); 
}

