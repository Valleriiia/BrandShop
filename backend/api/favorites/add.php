<?php
require_once '../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Необхідна авторизація']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$product_id = $data['product_id'] ?? null;

if (!$product_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Не вказано ID товару']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)");
    $stmt->execute([$_SESSION['user_id'], $product_id]);

    echo json_encode(['message' => 'Додано до улюблених']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Не вдалося додати']);
}
