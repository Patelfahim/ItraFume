const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/mine', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
