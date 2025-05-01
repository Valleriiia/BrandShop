<?php
require_once '../../config/db.php';

// Отримання GET-параметрів
$department = $_GET['department'] ?? null;
$color = $_GET['color'] ?? null;
$type = $_GET['type'] ?? null;
$composition = $_GET['composition'] ?? null;
$country = $_GET['country'] ?? null;
$minPrice = $_GET['min_price'] ?? null;
$maxPrice = $_GET['max_price'] ?? null;
$sort = $_GET['sort'] ?? null;

// Початковий SQL
$sql = "SELECT * FROM products WHERE 1=1";
$params = [];

// Фільтри
if ($department !== null) {
    $sql .= " AND department_id = ?";
    $params[] = $department;
}
if ($color !== null) {
    $sql .= " AND color = ?";
    $params[] = $color;
}
if ($type !== null) {
    $sql .= " AND type = ?";
    $params[] = $type;
}
if ($composition !== null) {
    $sql .= " AND composition = ?";
    $params[] = $composition;
}
if ($country !== null) {
    $sql .= " AND country = ?";
    $params[] = $country;
}
if ($minPrice !== null) {
    $sql .= " AND price >= ?";
    $params[] = $minPrice;
}
if ($maxPrice !== null) {
    $sql .= " AND price <= ?";
    $params[] = $maxPrice;
}

// Сортування
switch ($sort) {
    case 'price_asc':
        $sql .= " ORDER BY price ASC";
        break;
    case 'price_desc':
        $sql .= " ORDER BY price DESC";
        break;
    case 'popular':
        $sql .= " ORDER BY views DESC"; // або інше поле популярності
        break;
    case 'new':
        $sql .= " ORDER BY created_at DESC";
        break;
    default:
        $sql .= " ORDER BY id DESC";
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    echo json_encode($products);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка при отриманні товарів']);
}
