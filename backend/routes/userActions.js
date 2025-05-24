const express = require('express');
const router = express.Router();
const userActions = require('../controllers/userActionsController');

// Улюблені
router.post('/favorites', userActions.addToFavorites);
router.delete('/favorites/remove', userActions.removeFromFavorites);
router.get('/favorites/:userId', userActions.getFavorites);

// Кошик
router.post('/cart', userActions.addToCart);
router.delete('/cart', userActions.removeFromCart);
router.patch('/cart', userActions.updateCartItem);
router.get('/cart/:userId', userActions.getCart);

module.exports = router;
