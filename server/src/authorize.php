<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1);

$conn = dbConnect();

function createHero() {
    global $conn;
    
    $private_uuid = generateUUID();
    $uuid = generateUUID();

    $sqlInsert = "INSERT INTO entities (private_uuid, uuid, type, latitude, longitude) VALUES ('$private_uuid', '$uuid', 'hero', 0.0, 0.0)";
    $conn->query($sqlInsert);

    $lastInsertID = $conn->insert_id;
    $sqlFetch = "SELECT * FROM entities WHERE id = '$lastInsertID'";
    $result = $conn->query($sqlFetch);

    if ($result !== false) {
        $row = $result->fetch_assoc();
        if ($row !== null) {
            $heroUUID = $row["uuid"];    
            $privateHeroUuid = $row["private_uuid"];
            setcookie("privateHeroUUID", $privateHeroUuid, time() + 10 * 365 * 24 * 60 * 60, "/");
            $response = array(
                'code' => 0,
                'message' => "Authorization success: new data created",
                'heroUUID' => $heroUUID
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

if (!isset($_COOKIE["privateHeroUUID"])) {
    createHero();
} else {
    $privateHeroUUID = $_COOKIE["privateHeroUUID"];
    if (validateUUID($privateHeroUUID)) {
        $sqlCheck = "SELECT * FROM entities WHERE type = 'hero' AND private_uuid = '$privateHeroUUID'";
        $result = $conn->query($sqlCheck);

        $row = $result->fetch_assoc();

        if ($result->num_rows == 0 || $row == null) {
            $response = array(
                'code' => 4,
                'message' => "Authorization error: $privateHeroUUID not found in database!",
                'entities' => []
            );
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            $conn->close();            
            exit(0);
        }
        else {
            $privateHeroUUID = $row["uuid"];
            $response = array(
                'code' => 0,
                'message' => "Authorization success: using saved data",
                'heroUUID' => $privateHeroUUID
            );
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            $conn->close();            
            exit(0);
        }
    }
    else {
        $response = array(
            'code' => 2,
            'message' => "Invalid UUID format for $privateHeroUUID",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();        
        exit(0);
    }
}

