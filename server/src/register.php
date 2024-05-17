<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$conn = dbConnect();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = $conn->real_escape_string($_POST['login']);
    $password = $conn->real_escape_string($_POST['password']);
    $email = $conn->real_escape_string($_POST['email']);

    if (strlen($login) < 4) {
        echo json_encode(array('code' => 1, 'message' => "Login is too short! Must be 4 or more in length."), JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if (strlen($password) < 4) {
        echo json_encode(array('code' => 2, 'message' => "Password is too short! Must be 4 or more in length."), JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array('code' => 3, 'message' => "Email validation failed!"), JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (login, password, email) VALUES ('$login', '$hashed_password', '$email')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}