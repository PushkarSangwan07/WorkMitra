const Razorpay = require('razorpay');
const crypto = require('crypto');
const WorkerProfile = require('../models/WorkerProfile'); // Adjust path if needed

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create the Order
const createOrder = async (req, res) => {
  try {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    if (!worker || worker.walletBalance >= 0) {
      return res.status(400).json({ success: false, message: 'No dues to pay' });
    }

    // Razorpay requires amounts in PAISE (multiply by 100)
    const amountInPaise = Math.abs(worker.walletBalance) * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_worker_${worker._id}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// 2. Verify the Payment & Clear Dues
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Securely verify the signature matches
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid signature. Payment failed.' });
    }

    // PAYMENT SUCCESSFUL! Reset the worker's wallet balance to 0.
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    worker.walletBalance = 0; 
    await worker.save();

    res.status(200).json({ success: true, message: 'Payment verified successfully! Dues cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

module.exports = { createOrder, verifyPayment };