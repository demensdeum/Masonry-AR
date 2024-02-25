<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

$conn = dbConnect();
$heroUUID = "";

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

if (isset($_GET['uuid'])) {
    $uuid = $_GET['uuid'];

    if (validateUUID($heroUUID)) {

        $sql = "SELECT * FROM entities WHERE uuid = '$uuid'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {

            $row = $result->fetch_assoc();
            if ($row == null) {
                $response = array(
                    'code' => 4,
                    'message' => "Row is null!",
                    'entities' => []
                );    
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
                $conn->close();
                exit(0);
            }  
                        
            $entityBalance = $row['balance'];          

            $balanceUpdateSql = "UPDATE entities SET balance = balance + $entityBalance WHERE private_uuid = '$heroUUID'";
            $conn->query($balanceUpdateSql);

            $deleteSql = "DELETE FROM entities WHERE uuid = '$uuid'";
            $conn->query($deleteSql);

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
    $conn->close();
    exit(0);
} else {
    echo json_encode(array('code' => 3, 'message' => 'UUID parameter is missing'), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
}

