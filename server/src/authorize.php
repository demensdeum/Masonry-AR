<?php
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar";

$conn = new mysqli($servername, $username, $password, $database);

function createHero() {
    global $conn;
    
    $sqlInsert = "INSERT INTO entities (type, latitude, longitude) VALUES ('hero', 0.0, 0.0)";
    $conn->query($sqlInsert);

    $lastInsertID = $conn->insert_id;
    $sqlFetch = "SELECT * FROM entities WHERE id = '$lastInsertID'";
    $result = $conn->query($sqlFetch);

    if ($result !== false) {
        $row = $result->fetch_assoc();
        if ($row !== null) {    
            $heroUuid = $row["uuid"];
            setcookie("heroUuid", $heroUuid, time() + 10 * 365 * 24 * 60 * 60, "/");
            $response = array(
                'code' => 0,
                'message' => "Authorization success: new data created",
                'entities' => []
            );    
            echo json_encode($response, JSON_UNESCAPED_UNICODE);   
            $conn->close();            
            exit(0);
        }
        else {
            $response = array(
                'code' => 1,
                'message' => "Player hero entity did not added: entity not found",
                'entities' => []
            );    
            echo json_encode($response, JSON_UNESCAPED_UNICODE);   
            $conn->close();            
            exit(0);
        }
    }
    else {
        $response = array(
            'code' => 3,
            'message' => "Player hero entity did not added: entities search false",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);   
        $conn->close();        
        exit(0);
    } 
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
            $conn->close();            
            exit(0);
        }
    }
    else {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $heroUuid",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();        
        exit(0);
    }
}

