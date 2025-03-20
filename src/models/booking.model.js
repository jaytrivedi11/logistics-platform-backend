const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  pickup: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    time: {
      type: Date,
      required: true
    },
    contact: {
      name: String,
      phone: String
    }
  },
  delivery: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    time: {
      type: Date,
      required: true
    },
    contact: {
      name: String,
      phone: String
    }
  },
  cargo: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash'
    },
    transactionId: String,
    paidAt: Date
  },
  tracking: {
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    estimatedTime: Date,
    distance: Number,
    route: [[Number]]
  },
  notes: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

// Indexes for geospatial queries
bookingSchema.index({ 'pickup.location': '2dsphere' });
bookingSchema.index({ 'delivery.location': '2dsphere' });
bookingSchema.index({ 'tracking.currentLocation': '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 
