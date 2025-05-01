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
    $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$_SESSION['user_id'], $product_id]);

    echo json_encode(['message' => 'Видалено з улюблених']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Не вдалося видалити']);
}
