<?php
echo "こんにちは!<br>";

include("config.php");
if (dbConnect()) {
    echo "DB connected!<br>";
}
else {
    echo "DB Connection ERROR!<br>";
}