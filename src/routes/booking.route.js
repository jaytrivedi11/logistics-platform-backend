const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle
 *               - pickup
 *               - delivery
 *               - cargo
 *               - weight
 *             properties:
 *               vehicle:
 *                 type: string
 *               pickup:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: object
 *                   location:
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: array
 *                   time:
 *                     type: string
 *                     format: date-time
 *                   contact:
 *                     type: object
 *               delivery:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: object
 *                   location:
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: array
 *                   time:
 *                     type: string
 *                     format: date-time
 *                   contact:
 *                     type: object
 *               cargo:
 *                 type: string
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post(
  '/',
  authMiddleware.protect,
  [
    body('vehicle').isMongoId().withMessage('Invalid vehicle ID'),
    body('pickup').isObject().withMessage('Pickup details are required'),
    body('pickup.location.coordinates').isArray().withMessage('Pickup coordinates are required'),
    body('delivery').isObject().withMessage('Delivery details are required'),
    body('delivery.location.coordinates').isArray().withMessage('Delivery coordinates are required'),
    body('cargo').trim().notEmpty().withMessage('Cargo type is required'),
    body('weight').isNumeric().withMessage('Weight must be a number'),
    body('dimensions').optional().isObject()
  ],
  bookingController.createBooking
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get(
  '/:id',
  authMiddleware.protect,
  bookingController.getBooking
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, in_transit, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch(
  '/:id/status',
  authMiddleware.protect,
  [
    body('status')
      .isIn(['accepted', 'in_transit', 'delivered', 'cancelled'])
      .withMessage('Invalid status')
  ],
  bookingController.updateBookingStatus
);

/**
 * @swagger
 * /api/bookings/{id}/location:
 *   patch:
 *     summary: Update booking location
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.patch(
  '/:id/location',
  authMiddleware.protect,
  authMiddleware.restrictTo('driver'),
  [
    body('latitude').isFloat().withMessage('Invalid latitude'),
    body('longitude').isFloat().withMessage('Invalid longitude')
  ],
  bookingController.updateBookingLocation
);

/**
 * @swagger
 * /api/bookings/user:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.get(
  '/user',
  authMiddleware.protect,
  bookingController.getUserBookings
);

/**
 * @swagger
 * /api/bookings/driver:
 *   get:
 *     summary: Get driver's active bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of driver's active bookings
 */
router.get(
  '/driver',
  authMiddleware.protect,
  authMiddleware.restrictTo('driver'),
  bookingController.getDriverBookings
);

module.exports = router; 
