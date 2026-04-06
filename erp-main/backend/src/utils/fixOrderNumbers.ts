// src/utils/fixOrderNumbers.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected for fixing order numbers');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const fixOrderNumbers = async () => {
  await connectDB();
  
  try {
    // Find all orders that either don't have an orderNumber field or have a null value
    const orders = await Order.find({
      $or: [
        { orderNumber: { $exists: false } },
        { orderNumber: null }
      ]
    }).sort({ createdAt: 1 }); // Sort by creation date to assign numbers chronologically
    
    console.log(`Found ${orders.length} orders to fix`);
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const date = order.createdAt || new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Generate unique order number
      const orderNumber = `ORD-${year}${month}${day}-${(i + 1).toString().padStart(4, '0')}`;
      
      // Update the order
      await Order.findByIdAndUpdate(order._id, { orderNumber });
      console.log(`Updated order ${order._id} with orderNumber: ${orderNumber}`);
    }
    
    console.log('All orders updated successfully!');
    
    // Find and fix any orders with temporary numbers that weren't properly replaced
    const tempOrders = await Order.find({
      orderNumber: { $regex: /^ORD-TEMP/ }
    }).sort({ createdAt: 1 });
    
    console.log(`Found ${tempOrders.length} orders with temporary numbers to fix`);
    
    for (let i = 0; i < tempOrders.length; i++) {
      const order = tempOrders[i];
      const date = order.createdAt || new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Find the latest real order number to determine the next sequence
      const latestOrder = await Order.findOne(
        { orderNumber: { $not: { $regex: /^ORD-TEMP/ } } },
        {},
        { sort: { createdAt: -1 } }
      );
      
      let sequence = 1;
      if (latestOrder && latestOrder.orderNumber) {
        const parts = latestOrder.orderNumber.split('-');
        if (parts.length >= 3) {
          sequence = parseInt(parts[2], 10) + 1;
        }
      }
      
      // Generate unique order number
      const orderNumber = `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
      
      // Update the order
      await Order.findByIdAndUpdate(order._id, { orderNumber });
      console.log(`Updated temporary order ${order._id} with orderNumber: ${orderNumber}`);
    }
    
    console.log('All temporary orders updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing order numbers:', error);
    process.exit(1);
  }
};

fixOrderNumbers();