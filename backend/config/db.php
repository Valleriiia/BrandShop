<?php
// backend/db.php

$host = 'localhost';        // або 127.0.0.1
$db   = 'kursovadb4sem';             // назва твоєї БД (з дампу)
$user = 'root';             // стандартно для XAMPP
$pass = '';                 // стандартно для XAMPP
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Налаштування для PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // показувати помилки
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // повертати асоціативні масиви
    PDO::ATTR_EMULATE_PREPARES   => false,                  // вимкнути емуляцію prepared statements
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>
