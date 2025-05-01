<?php
require_once '../../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Треба увійти в акаунт']);
    exit;
}

// Отримати дані POST
$data = json_decode(file_get_contents("php://input"), true);

$product_id = $data['product_id'] ?? null;
$rating = $data['rating'] ?? null;
$comment = $data['comment'] ?? null;

if (!$product_id || !$rating || !is_numeric($rating)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID товару і рейтинг обовʼязкові']);
    exit;
}

// Запис у БД
try {
    $stmt = $pdo->prepare("INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment) 
                           VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $product_id,
        $_SESSION['user_id'],
        $_SESSION['user_name'], // name береться з сесії
        $rating,
        $comment
    ]);

    echo json_encode(['message' => 'Відгук додано']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка збереження відгуку']);
}
