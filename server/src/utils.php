<?php
function generateUUID() {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    $uuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    return $uuid;    
}
function validateUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

function checkInsertOrUpdateRecord(
    $uuid,
    $columnName,
    $conn,
    $tableName,
    $onExistsFunction,
    $insertFunction
) {
    $sql_select = "SELECT COUNT(*) as count FROM $tableName WHERE $columnName = ?";
    $stmt_select = $conn->prepare($sql_select);
    if (!$stmt_select) {
        die("Error preparing statement: " . $conn->error);
    }
    
    $stmt_select->bind_param("s", $uuid);
    $stmt_select->execute();
    $result = $stmt_select->get_result();
    if (!$result) {
        die("Error getting result: " . $stmt_select->error);
    }

    $stmt_select->close();

    $row = $result->fetch_assoc();
    if ($row !== null && isset($row['count'])) {
        $count = $row['count'];

        if ($count > 0) {
            $onExistsFunction($uuid, $conn);
        } else {
            $insertFunction($uuid, $conn);
        }    
    }
    else {
        $response = array(
            'code' => -1,
            'message' => "Utils: checkInsertOrUpdateRecord row is null!",
            'entities' => []
        );    
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $conn->close();
        exit(0);
    }
}
