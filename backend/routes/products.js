const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/random', productController.getRandomProducts);
router.get('/search', productController.searchProducts);
router.get('/discounted', productController.getDiscountedProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
