<?php

function dbConnect() {
    $servername = "localhost";
    $username = "root";
    $password = "new_password";
    $database = "masonry_ar";
    return new mysqli($servername, $username, $password, $database);
}
