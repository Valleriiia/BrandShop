<?php
require_once '../../config/db.php';

$department_id = $_GET['id'] ?? null;

if (!$department_id || !is_numeric($department_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некоректний ID кафедри']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE department_id = ?");
    $stmt->execute([$department_id]);
    $products = $stmt->fetchAll();

    echo json_encode($products);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка при завантаженні товарів кафедри']);
}
