const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Додати коментар
router.post('/', reviewController.addReview);

// Отримати коментарі для товару
router.get('/:product_id', reviewController.getReviewsByProduct);

module.exports = router;