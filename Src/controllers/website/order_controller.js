require('dotenv').config();
const jwt = require('jsonwebtoken');
const orderModel = require('../../models/Order');
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const app = express();


// ----------------- PLACE ORDER -----------------
exports.orderPlaced = async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.send({ _status: false, _message: "Token is required" });
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.KEY);

    const totalOrder = await orderModel.countDocuments();
    const data = req.body;
    data.user_id = decoded.userData._id;
    data.order_number = "ORD_00" + (totalOrder + 1);

    // Save order
    const savedOrder = await orderModel.create(data);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.net_amount * 100,
      currency: "usd",
      metadata: { 
        order_id: savedOrder._id.toString(), 
        receipt_id: "RECEIPT_" + (totalOrder + 1) 
      }
    });

    // Update order with payment ID
    await orderModel.updateOne(
      { _id: savedOrder._id },
      { $set: { stripe_payment_id: paymentIntent.id } }
    );

    res.send({
      _status: true,
      _message: "Order placed successfully",
      _orderInfo: paymentIntent,
      _data: savedOrder
    });
  } catch (error) {
    res.send({ 
        _status: false, 
        _message: "Failed to place order", 
        _error: error.message });
  }
};
//stripe listen --forward-to localhost:4000/webhook  we have to run this command in localhost
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  // ✅ 1. Verify webhook signature (SECURITY)
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ 2. Handle events safely
  try {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent?.metadata?.order_id;

    // If no orderId → ignore
    if (!orderId) {
      return res.json({ received: true });
    }

    // Find order once (OPTIMIZED)
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({ received: true });
    }

    // ================= SUCCESS =================
    if (event.type === "payment_intent.succeeded") {

      // Prevent duplicate update (IMPORTANT)
      if (order.payment_status === "paid") {
        return res.json({ received: true });
      }

      await orderModel.findByIdAndUpdate(orderId, {
        payment_status: "paid",
        order_status: "confirmed",
        updated_at: new Date()
      });
    }

    // ================= FAILED =================
    else if (event.type === "payment_intent.payment_failed") {

      await orderModel.findByIdAndUpdate(orderId, {
        payment_status: "failed",
        order_status: "cancelled",
        updated_at: new Date()
      });

      console.log("Payment FAILED → Order Cancelled:", orderId);
    }

    // ================= OTHER EVENTS =================
    else {
      console.log(`Unhandled event type: ${event.type}`);
    }

  } catch (error) {
    console.error("Webhook DB Error:", error.message);
  }

  // ✅ 3. Always respond to Stripe
  res.json({ received: true });
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status, payment_status } = req.body;
    if (!orderId || !status || !payment_status)
      return res.send({ _status: false, _message: "Order ID and status required" });

    const order = await orderModel.findById(orderId);
    if (!order) return res.send({ _status: false, _message: "Order not found" });

    await orderModel.updateOne(
      { _id: orderId },
      { $set: { order_status: status, payment_status: payment_status } }
    );

    res.send({ _status: true, _message: "Order status updated successfully" });
  } catch (error) {
    res.send({ _status: false, _message: error.message });
  }
};
