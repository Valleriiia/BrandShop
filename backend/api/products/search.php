<?php
require_once '../../config/db.php';

$query = $_GET['q'] ?? '';

if (trim($query) === '') {
    echo json_encode(['error' => 'Порожній запит']);
    exit;
}

// Пошук по назві + опису
$sql = "SELECT * FROM products 
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY id DESC";

$searchTerm = '%' . $query . '%';

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$searchTerm, $searchTerm]);
    $results = $stmt->fetchAll();
    echo json_encode($results);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка пошуку']);
}
