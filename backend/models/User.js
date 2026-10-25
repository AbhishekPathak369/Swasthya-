
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid mobile number']
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ['patient', 'doctor'],
      default: 'patient'
    },
     avatar: {
    type: String,
    default: ''
  },

    doctorVerificationStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'approved', 'rejected'],
      default: 'not_applicable'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
