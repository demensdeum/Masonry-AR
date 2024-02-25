<?php
    unset($_COOKIE['heroUUID']); 
    setcookie('heroUUID', '', -1, '/'); 
    unset($_COOKIE['privateHeroUUID']); 
    setcookie('privateHeroUUID', '', -1, '/');     

    $response = array(
        'code' => 0,
        'message' => "Logout success!",
        'entities' => []
    );    
    echo json_encode($response, JSON_UNESCAPED_UNICODE); 
    $conn->close();      
    exit(0);     