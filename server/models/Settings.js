const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformFeePercentage: { type: Number, default: 10 }, // You take 10% of bookings
  supportEmail: { type: String, default: 'support@workmitra.com' },
  maintenanceMode: { type: Boolean, default: false } // To lock the app during updates
});

module.exports = mongoose.model('Settings', settingsSchema);