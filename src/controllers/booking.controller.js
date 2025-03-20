const Booking = require('../models/booking.model');
const Vehicle = require('../models/vehicle.model');
const { validationResult } = require('express-validator');
const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const {
      vehicle,
      pickup,
      delivery,
      cargo,
      weight,
      dimensions
    } = req.body;

    // Check if vehicle is available
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc || vehicleDoc.status !== 'available') {
      return res.status(400).json({
        status: 'error',
        message: 'Vehicle is not available'
      });
    }

    // Calculate distance and estimated time using Google Maps API
    const distanceMatrix = await client.distancematrix({
      params: {
        origins: `${pickup.location.coordinates[1]},${pickup.location.coordinates[0]}`,
        destinations: `${delivery.location.coordinates[1]},${delivery.location.coordinates[0]}`,
        mode: 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const distance = distanceMatrix.data.rows[0].elements[0].distance.value;
    const duration = distanceMatrix.data.rows[0].elements[0].duration.value;

    // Calculate price based on distance and vehicle type
    const basePrice = calculateBasePrice(vehicleDoc.type, distance);
    const price = basePrice + (weight * 0.1); // Add weight-based surcharge

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      vehicle,
      pickup,
      delivery,
      cargo,
      weight,
      dimensions,
      price,
      tracking: {
        distance,
        estimatedTime: new Date(Date.now() + duration * 1000)
      }
    });

    // Update vehicle status
    vehicleDoc.status = 'in_use';
    await vehicleDoc.save();

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('vehicle', 'type registrationNumber driver');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view this booking
    if (booking.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        booking.vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this booking'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update this booking
    if (req.user.role !== 'admin' && 
        booking.vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    // Update vehicle status if booking is completed or cancelled
    if (status === 'delivered' || status === 'cancelled') {
      const vehicle = await Vehicle.findById(booking.vehicle);
      vehicle.status = 'available';
      await vehicle.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateBookingLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is the driver assigned to this booking
    if (booking.vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this booking location'
      });
    }

    booking.tracking.currentLocation.coordinates = [longitude, latitude];
    await booking.save();

    // Emit location update through Socket.IO
    req.app.get('io').emit('bookingLocationUpdate', {
      bookingId: booking._id,
      location: booking.tracking.currentLocation
    });

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle', 'type registrationNumber driver')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      'vehicle.driver': req.user._id,
      status: { $in: ['accepted', 'in_transit'] }
    })
      .populate('user', 'name phone')
      .populate('vehicle', 'type registrationNumber')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to calculate base price
const calculateBasePrice = (vehicleType, distance) => {
  const baseRates = {
    mini_truck: 10,
    pickup: 15,
    van: 20,
    truck: 25,
    large_truck: 30
  };

  const rate = baseRates[vehicleType] || 20;
  return rate * (distance / 1000); // Convert distance to kilometers
}; 
