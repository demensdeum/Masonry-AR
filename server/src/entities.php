<?php
$servername = "localhost";
$username = "root";
$password = "new_password";
$database = "masonry_ar"; // Замените на имя вашей базы данных

// Создаем соединение
$conn = new mysqli($servername, $username, $password, $database);

// Проверяем соединение
if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}

// SQL запрос для выбора данных из таблицы entities
$sql = "SELECT * FROM entities";
$result = $conn->query($sql);

// Проверяем успешность выполнения запроса
if ($result->num_rows > 0) {
    // Создаем массив для хранения данных
    $data = array();

    // Заполняем массив данными из каждой строки
    while($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => $row["id"],
            'type' => $row["type"],
            'latitude' => $row["latitude"],            
            'longitude' => $row["longitude"]
        );
    }

    // Выводим данные в формате JSON
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} else {
    echo "0 результатов";
}

// Закрываем соединение
$conn->close();
?>
