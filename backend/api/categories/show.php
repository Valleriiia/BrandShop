<?php
require_once '../../config/db.php';

$id = $_GET['id'] ?? null;

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некоректний ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM academic_department WHERE id = ?");
    $stmt->execute([$id]);
    $category = $stmt->fetch();

    if (!$category) {
        http_response_code(404);
        echo json_encode(['error' => 'Кафедра не знайдена']);
        exit;
    }

    echo json_encode($category);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка при отриманні кафедри']);
}
