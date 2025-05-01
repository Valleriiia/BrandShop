<?php
require_once '../../config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM academic_department ORDER BY name");
    $departments = $stmt->fetchAll();

    echo json_encode($departments);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Помилка при отриманні кафедр']);
}
