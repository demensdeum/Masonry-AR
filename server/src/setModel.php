<?php
include("models.php");
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$namelLenLimit = 32;
$conn = dbConnect();
$heroUUID = "";
$models = models();

if (!isset($_COOKIE["privateHeroUUID"])) {
    $response = array(
        'code' => 1,
        'message' => "Not authorized: no heroUUID",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
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
        exit(0);
    }
}

$heroUUID = $_COOKIE["privateHeroUUID"];

if (isset($_GET['modelIndex'])) {
    $modelIndexRaw = $conn->real_escape_string($_GET['modelIndex']);
    $modelIndex = intval($modelIndexRaw);
    $modelsCount = count($models);
    if ($modelIndex >= count($models)) {
        $response = array(
            'code' => 3,
            'message' => "Model index out of range: $modelIndex/$modelsCount)",
            'entities' => []
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);        
    }
    $model = $models[$modelIndex];
    $updateSql = "UPDATE entities SET model = '$model' WHERE private_uuid = '$heroUUID'";
    $conn->query($updateSql);

    $response = array(
        'code' => 0,
        'message' => "Model set to $model",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0);    
}
else {
    $response = array(
        'code' => 4,
        'message' => "No modelIndex input parameter!",
        'entities' => []
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit(0); 
}
