<?php
require_once '../../config/db.php';

$id = $_GET['id'] ?? null;

if ($id === null || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Невірний або відсутній ID']);
    exit;
}

try {
    // Основна інформація про товар
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Товар не знайдено']);
        exit;
    }

    // Збільшити перегляди
    $pdo->prepare("UPDATE products SET views = views + 1 WHERE id = ?")->execute([$id]);

    // Коментарі та рейтинги
    $stmt = $pdo->prepare("SELECT user_name, rating, comment, created_at 
                           FROM product_reviews 
                           WHERE product_id = ? 
                           ORDER BY created_at DESC");
    $stmt->execute([$id]);
    $reviews = $stmt->fetchAll();

    // Середній рейтинг
    $stmt = $pdo->prepare("SELECT ROUND(AVG(rating), 1) as average_rating 
                           FROM product_reviews WHERE product_id = ?");
    $stmt->execute([$id]);
    $avgRating = $stmt->fetchColumn();

    // Відповідь
    echo json_encode([
        'product' => $product,
        'average_rating' => $avgRating ?: 0,
        'reviews' => $reviews
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка при завантаженні']);
}
