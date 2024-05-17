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

function entitiesOfType($type) {
    $session_uuid = $_COOKIE["session_uuid"];

    if (!validateSession($session_uuid)) {
        return [];
    }
    
    $conn = dbConnect();
    $type = $conn->real_escape_string($type);

    $stmt = $conn->prepare("CALL OwnedEntitiesOfType(?,?)");
    $stmt->bind_param("ss", $session_uuid, $type);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $entities = $result->fetch_all(MYSQLI_ASSOC);
    
    return $entities;
}

function validateSession($uuid) {
    $conn = dbConnect();
    if (validateUUID($uuid) != true) {
        echo "1";
        return false;
    }

    $sql_select = "SELECT COUNT(*) as count FROM sessions WHERE private_uuid = ? LIMIT 1";
    $stmt_select = $conn->prepare($sql_select);
    if (!$stmt_select) {
        die("Error preparing statement: " . $conn->error);
    }

    $stmt_select->bind_param("s", $uuid);
    $stmt_select->execute();

    $count = null;

    $stmt_select->bind_result($count);
    $stmt_select->fetch();    
    $stmt_select->close();

    if ($count !== null && $count == 1) {
        return true;
    }

    return false;
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
    
    $count = null;

    $stmt_select->bind_result($count);
    $stmt_select->fetch();    
    $stmt_select->close();

    if ($count !== null) {
        if ($count > 0) {
            $onExistsFunction($uuid, $conn);
        } else {
            $insertFunction($uuid, $conn);
        }    
    } else {
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