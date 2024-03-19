<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$conn = dbConnect();

$sqlSelect = "
SELECT *
FROM info
";
$result = $conn->query($sqlSelect);

if ($result->num_rows > 0) {

    $data = array();

    while($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => $row["id"],
            'key' => $row["key"],
            'value' => $row["value"]
        );
    }

    $response = array(
        'code' => 0,
        'message' => "Got info",
        'entities' => $data
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);  
    $conn->close();
    exit(0);    
}
else {
    $response = array(
        'code' => 1,
        'message' => "No info"
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);  
    $conn->close();
    exit(0);       
}