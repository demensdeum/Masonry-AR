<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$conn = dbConnect();
$heroUUID = "";

$destroyPrice = 1000;

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

        $sql = "SELECT * FROM entities WHERE private_uuid = '$heroUUID' AND type = 'hero'";
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
                        
            $heroBalance = $row['balance'];   
            
            if ($heroBalance < $destroyPrice) {
                $response = array(
                    'code' => 6,
                    'message' => "Balance is not enough to destroy - $heroBalance/$destroyPrice",
                    'entities' => []
                );    
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
                $conn->close();
                exit(0);
            }

            $balanceUpdateSql = "UPDATE entities SET balance = balance - $destroyPrice WHERE private_uuid = '$heroUUID'";
            $conn->query($balanceUpdateSql);

            $deleteSql = "DELETE FROM entities WHERE uuid = '$uuid'";
            $conn->query($deleteSql);

            $response = array(
                'code' => 0,
                'message' => "Entity $uuid caught!",
                'entities' => []
            );
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            $conn->close();
            exit(0);            
        } else {
            $response = array(
                'code' => 1,
                'message' => "Entity $uuid not foundd!",
                'entities' => []
            );
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            $conn->close();
            exit(0);            
        }
    } else {
        $response = array(
            'code' => 5,
            'message' => "Invalid UUID format for $uuid",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);        
    }
} else {
    echo json_encode(array('code' => 3, 'message' => 'UUID parameter is missing'), JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);
}
