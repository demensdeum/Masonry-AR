<?php
include("config.php");
include("utils.php");
ini_set('display_errors', 1); 

$conn = dbConnect();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $recaptcha_secret = "6LcNG-ApAAAAALQJY3DtSAC4IpTo4cXxCigcNg42";
    $recaptcha_response = $_POST['g-recaptcha-response'];

    $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$recaptcha_secret&response=$recaptcha_response");
    $response_data = json_decode($response, true);

    if ($response_data == null || intval($response_data["success"]) !== 1) {
        echo json_encode(array('code' => 5, 'message' => "Bad captcha"), JSON_UNESCAPED_UNICODE);
        exit(0);
    }
    if (isset($response_data['score'])) {
        $score = $response_data['score'];
        $threshold = 0.5;
        if ($score < $threshold) {
            # keep success error code and message for security
            echo json_encode(array('code' => 5, 'message' => "Bad captcha"), JSON_UNESCAPED_UNICODE);
            exit(0);
        }
    } else {
        # keep success error code and message for security
        echo json_encode(array('code' => 5, 'message' => "Bad captcha"), JSON_UNESCAPED_UNICODE);
        exit(0);
    }
}
else {
    exit(0);
}

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

$sql = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    # keep success error code and message for security
    echo json_encode(array('code' => 0, 'message' => "New record created successfully"), JSON_UNESCAPED_UNICODE);
    exit(0);
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (login, password, email) VALUES ('$login', '$hashed_password', '$email')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(array('code' => 0, 'message' => "New record created successfully"), JSON_UNESCAPED_UNICODE);
    exit(0);
} else {
    echo json_encode(array('code' => 4, 'message' => "Error: $sql"), JSON_UNESCAPED_UNICODE);
    exit(0);
}