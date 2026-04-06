// project\backend\src\controllers\orderController.ts

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import Product from '../models/Product';
import Customer from '../models/Customer';
import { logger } from '../utils/logger';
import { 
  emitOrderCreated,
  emitNewOrder, 
  emitOrderDeleted,
  emitSalesTeamAlert, 
  emitLowStockAlert, 
  emitCustomerNotification,
  emitDashboardRefresh,
  emitOrderUpdated,
  emitProductStatsUpdated,
  emitProductUpdated,
  emitEmployeeCommissionUpdate,
  emitOrderFulfilled,
  emitOrderCompleted,
  emitInventoryReorderAlert,
  emitLoyaltyPointsUpdated,
  emitInvoiceGenerated
} from '../utils/socketEvents';

/**
 * Helper function for safe socket emissions with error handling
 */
const safeEmit = (emitter: Function, data: any) => {
  try {
    emitter(data);
  } catch (error) {
    logger.error('Socket emission error:', { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Helper function to get user ID from request
 */
const getUserId = (req: Request): mongoose.Types.ObjectId => {
  if (req.user && typeof req.user === 'object' && '_id' in req.user) {
    return req.user._id;
  }
  return new mongoose.Types.ObjectId();
};

/**
 * Helper function to parse customer info from various formats
 */
const getCustomerInfo = (customer: any) => {
  if (!customer) return { name: 'Unknown Customer', email: '' };
  
  if (typeof customer === 'object' && customer !== null) {
    return { 
      name: customer.name || 'Unknown Customer', 
      email: customer.email || '' 
    };
  }
  
  return { name: 'Unknown Customer', email: '' };
};

/**
 * Helper function to safely validate ObjectId values
 */
const validateObjectId = (id: string | null | undefined): mongoose.Types.ObjectId | null => {
  if (!id || id === '') {
    return null;
  }
  
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    return null;
  }
};




// Get all orders
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('products.product', 'name price');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    logger.error('Error fetching all orders:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    next(error);
  }
};

// Get single order
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('products.product', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Error fetching order by ID:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Emit socket event for deleted order
    safeEmit(emitOrderDeleted, req.params.id);
    
    // Also refresh dashboard metrics
    safeEmit(emitDashboardRefresh, null);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Order delete error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

// Batch update inventory for order creation
const updateInventoryForOrder = async (
  products: any[], 
  orderNumber: string, 
  orderId: mongoose.Types.ObjectId, 
  userId: mongoose.Types.ObjectId, 
  session: mongoose.ClientSession
): Promise<mongoose.Document[]> => {
  // Prepare arrays for bulk operations
  const inventoryUpdates: any[] = [];
  const transactions: any[] = [];
  const lowStockAlerts: any[] = [];
  const productUpdates: any[] = [];
  
  // Get all product IDs
  const productIds = products.map(item => {
    return typeof item.product === 'object' && item.product !== null 
      ? item.product._id 
      : item.product;
  });
  
  // Fetch all inventory records in one query
  const inventoryItems = await Inventory.find({ productId: { $in: productIds } })
    .session(session);
  
  // Create a map for quicker lookups
  const inventoryMap = new Map();
  inventoryItems.forEach(item => {
    inventoryMap.set(item.productId.toString(), item);
  });
  
  // Fetch all products in one query
  const productItems = await Product.find({ _id: { $in: productIds } })
    .session(session);
  
  // Create a map for quicker lookups
  const productMap = new Map();
  productItems.forEach(item => {
    productMap.set(item._id.toString(), item);
  });
  
  // Process each product
  for (const item of products) {
    const productId = typeof item.product === 'object' && item.product !== null 
      ? item.product._id.toString() 
      : item.product.toString();
    
    // Handle inventory update
    const inventory = inventoryMap.get(productId);
    if (inventory) {
      const previousQuantity = inventory.quantity;
      const newQuantity = inventory.quantity - item.quantity;
      
      // Add to inventory updates
      inventoryUpdates.push({
        updateOne: {
          filter: { _id: inventory._id },
          update: { $set: { quantity: newQuantity } }
        }
      });
      
      // Add transaction record
      transactions.push({
        inventoryId: inventory._id,
        productId: inventory.productId,
        type: 'issue',
        quantity: item.quantity,
        previousQuantity,
        newQuantity,
        reason: `Order ${orderNumber}`,
        referenceId: orderId,
        referenceType: 'Order',
        performedBy: userId,
        date: new Date(),
        notes: `Automatically reduced for order ${orderNumber}`
      });
      
      // Check if inventory is now below reorder point
      if (newQuantity <= inventory.reorderPoint && previousQuantity > inventory.reorderPoint) {
        lowStockAlerts.push(inventory._id);
      }
    }
    
    // Handle product stats update
    const product = productMap.get(productId);
    if (product) {
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { 
            $inc: { salesCount: item.quantity },
            $set: { lastSoldDate: new Date() }
          }
        }
      });
    }
  }
  
  // Execute all bulk operations
  if (inventoryUpdates.length > 0) {
    await Inventory.bulkWrite(inventoryUpdates, { session });
  }
  
  if (transactions.length > 0) {
    await InventoryTransaction.insertMany(transactions, { session });
  }
  
  if (productUpdates.length > 0) {
    await Product.bulkWrite(productUpdates, { session });
  }
  
  // Get populated inventory items for alerts
  let lowStockItems: mongoose.Document[] = [];
  if (lowStockAlerts.length > 0) {
    lowStockItems = await Inventory.find({ _id: { $in: lowStockAlerts } })
      .populate('productId', 'name sku price category')
      .session(session);
  }
  
  return lowStockItems;
};

// Create new order with all required triggers
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  // Start a mongoose session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { customer, products, shippingAddress, paymentMethod, status } = req.body;
    const salesRepId = validateObjectId(req.body.salesRepId);
    const userId = getUserId(req);    
    // Validation 1: Check if customer exists and verify credit status
    const customerDoc = await Customer.findById(customer).session(session);
    if (!customerDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check customer's active status (simple credit check)
    if (!customerDoc.active) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Customer account is inactive. Please contact sales department.'
      });
    }
    
    // Calculate total amount and validate inventory for each product
    let totalAmount = 0;
    let insufficientStock = [];
    
    // Process each product in the order
    for (const item of products) {
      // Calculate line total
      totalAmount += item.price * item.quantity;
      
      // Validation 2: Check inventory availability
      const inventory = await Inventory.findOne({ 
        productId: item.product 
      }).session(session);
      
      if (!inventory) {
        insufficientStock.push({
          productId: item.product,
          requested: item.quantity,
          available: 0,
          message: 'No inventory record found'
        });
        continue;
      }
      
      if (inventory.quantity < item.quantity) {
        insufficientStock.push({
          productId: item.product,
          requested: item.quantity,
          available: inventory.quantity,
          message: 'Insufficient stock'
        });
      }
    }
    
    // If any product has insufficient stock, abort the transaction
    if (insufficientStock.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order could not be created due to insufficient stock',
        insufficientStock
      });
    }
    
    // All validations passed, proceed with order creation
    const order = await Order.create(
      [{
        customer,
        products,
        shippingAddress,
        paymentMethod,
        totalAmount,
        status: status || 'pending',
        salesRepId,
        auditTrail: [{
          event: 'order_created',
          date: new Date(),
          user: userId,
          details: 'Order created'
        }]
      }],
      { session }
    );
    
    // Update inventory, product stats, and collect low stock alerts
    const lowStockAlerts = await updateInventoryForOrder(
      products, 
      order[0].orderNumber, 
      order[0]._id, 
      userId, 
      session
    );
    
    // Update customer purchase history
    const customerUpdates = {
      lastPurchaseDate: new Date(),
      $inc: {
        totalOrders: 1,
        totalSpent: totalAmount
      }
    };
    
    await Customer.findByIdAndUpdate(customer, customerUpdates, { session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    // Populate order for response and notifications
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('customer', 'name email')
      .populate('products.product', 'name price');
    
    // Send notifications after successful transaction
    try {
      // Notification 1: Emit order created event
      if (populatedOrder) {
        safeEmit(emitOrderCreated, populatedOrder);
      
        // Notification 2: Alert sales team of new order
        if (salesRepId) {
          safeEmit(emitSalesTeamAlert, populatedOrder);
        }
      }
      
      // Notification 3: Send low stock alerts if any
      for (const inventoryItem of lowStockAlerts) {
        safeEmit(emitLowStockAlert, inventoryItem);
      }
      
      // Notification 4: Send customer confirmation
      if (populatedOrder) {
        const customerNotification = {
          type: 'order_confirmation',
          orderId: order[0]._id,
          orderNumber: order[0].orderNumber,
          message: `Your order ${order[0].orderNumber} has been received and is being processed.`,
          date: new Date()
        };
        safeEmit(emitCustomerNotification, { 
          customerId: customer.toString(), 
          notification: customerNotification 
        });
      }
      
      // Notification 5: Update dashboard metrics
      safeEmit(emitDashboardRefresh, null);
      
      // Notification 6: Update product statistics
      for (const item of products) {
        const productStats = {
          orderId: order[0]._id,
          quantity: item.quantity,
          salesAmount: item.price * item.quantity,
          date: new Date()
        };
        safeEmit(emitProductStatsUpdated, { 
          productId: item.product, 
          stats: productStats 
        });
      }
      
      // Notification 7: Update employee commission if applicable
      if (salesRepId) {
        const commission = {
          orderId: order[0]._id,
          orderAmount: totalAmount,
          // Calculate commission (example: 5% of order total)
          amount: totalAmount * 0.05,
          date: new Date()
        };
        safeEmit(emitEmployeeCommissionUpdate, { 
          employeeId: salesRepId, 
          commission 
        });
      }
    } catch (notificationError) {
      // Log notification errors but don't fail the request
      logger.error('Error sending notifications:', {
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        orderId: order[0]._id
      });
    }
    
    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    try {
      // Only abort if the transaction isn't already committed
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (abortError) {
      logger.error('Error aborting transaction:', {
        error: abortError instanceof Error ? abortError.message : String(abortError)
      });
    } finally {
      session.endSession();
    }
    
    logger.error('Order creation error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    next(error);
  }
};

// Update order
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    
    // Add audit trail entry if it doesn't exist
    if (!req.body.auditTrail) {
      const existingOrder = await Order.findById(req.params.id);
      if (existingOrder) {
        // Copy existing audit trail if it exists
        req.body.auditTrail = existingOrder.auditTrail || [];
        
        // Add new audit entry
        req.body.auditTrail.push({
          event: 'order_updated',
          date: new Date(),
          user: userId,
          details: 'Order details updated'
        });
      }
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('customer', 'name email')
     .populate('products.product', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Emit socket events for updated order
    safeEmit(emitOrderUpdated, order);
    
    // Also refresh dashboard metrics
    safeEmit(emitDashboardRefresh, null);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Order update error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = getUserId(req);
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }
    
    // Find existing order to get current audit trail
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Add audit trail entry
    const auditTrail = existingOrder.auditTrail || [];
    auditTrail.push({
      event: `status_changed_to_${status}`,
      date: new Date(),
      user: userId,
      details: `Order status changed from ${existingOrder.status} to ${status}`
    });
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        auditTrail
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('customer', 'name email')
     .populate('products.product', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Emit socket event for updated order status
    safeEmit(emitOrderUpdated, order);
    
    // Notify customer of status change
    const customerId = typeof order.customer === 'object' && order.customer !== null
      ? order.customer._id.toString()
      : typeof order.customer === 'string' 
        ? order.customer 
        : String(order.customer || '');
    const customerNotification = {
      type: 'order_status_update',
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      message: `Your order ${order.orderNumber} has been updated to ${order.status}.`,
      date: new Date()
    };
    safeEmit(emitCustomerNotification, { 
      customerId, 
      notification: customerNotification 
    });
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Order status update error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

// Get order statistics
export const getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get counts for different statuses - do this in one aggregate query
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Map the results to the expected structure
    const statusMap = statusCounts.reduce((acc, status) => {
      acc[status._id] = status.count;
      return acc;
    }, {});
    
    const pendingOrders = statusMap['pending'] || 0;
    const processingOrders = statusMap['processing'] || 0;
    const fulfilledOrders = statusMap['fulfilled'] || 0;
    const completedOrders = statusMap['completed'] || 0;
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');
    
    // Get monthly order trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format monthly data for easier frontend consumption
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthlyOrders.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      orderCount: item.count,
      revenue: item.revenue
    }));
    
    // Get category distribution if your orders have category data
    let categoryDistribution = [];
    try {
      categoryDistribution = await Order.aggregate([
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            count: { $sum: 1 },
            totalAmount: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
          }
        },
        {
          $project: {
            category: { $ifNull: ['$_id', 'Uncategorized'] },
            count: 1,
            totalAmount: 1,
            percentage: { 
              $multiply: [
                { $divide: ['$count', { $literal: totalOrders > 0 ? totalOrders : 1 }] }, 
                100
              ]
            }
          }
        },
        { $sort: { count: -1 } }
      ]);
    } catch (error) {
      logger.error('Error getting category distribution:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    res.status(200).json({
      success: true,
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      fulfilledOrders,
      completedOrders,
      recentOrders,
      monthlySales,
      categoryDistribution
    });
  } catch (error) {
    logger.error('Order stats error:', {
      error: error instanceof Error ? error.message : String(error)
    });
    next(error);
  }
};

/**
 * Handle order fulfillment process
 * @route PUT /api/orders/:id/fulfill
 */
export const fulfillOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const { 
      trackingInfo, 
      fulfillmentDate = new Date(),
      fulfillmentStatus = 'fulfilled',
      notes
    } = req.body;
    
    // Find the order
    const order = await Order.findById(id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate order status - can only fulfill from processing or shipped
    if (!['processing', 'shipped'].includes(order.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order must be in processing or shipped status to be fulfilled'
      });
    }
    
    // Update order with fulfillment details
    order.status = 'fulfilled';
    order.fulfillmentStatus = fulfillmentStatus;
    order.fulfillmentDate = fulfillmentDate;
    
    // Add tracking information if provided
    if (trackingInfo) {
      order.trackingInfo = {
        ...trackingInfo,
        estimatedDelivery: trackingInfo.estimatedDelivery || undefined
      };
    }
    
    // Add audit trail entry
    if (!order.auditTrail) {
      order.auditTrail = [];
    }
    
    order.auditTrail.push({
      event: 'order_fulfilled',
      date: new Date(),
      user: userId,
      details: notes || 'Order fulfilled'
    });
    
    await order.save({ session });
    
    // Check inventory levels for reorder thresholds
    const productIds = order.products.map(p => 
      typeof p.product === 'object' ? p.product._id : p.product
    );
    
    const inventoryItems = await Inventory.find({ 
      productId: { $in: productIds } 
    }).populate('productId').session(session);
    
    // Collect low stock items to trigger reorders
    const reorderItems = [];
    
    for (const inventoryItem of inventoryItems) {
      if (inventoryItem.quantity <= inventoryItem.reorderPoint) {
        reorderItems.push(inventoryItem);
      }
    }
    
    // Get customer data for notification
    const populatedOrder = await Order.findById(id)
      .populate('customer')
      .populate('products.product')
      .session(session);
      
    await session.commitTransaction();
    session.endSession();
    
    // Send notifications after successful transaction
    try {
      // Notify about the fulfilled order
      safeEmit(emitOrderFulfilled, populatedOrder);
      safeEmit(emitOrderUpdated, populatedOrder);
      
      // Send customer notification about fulfillment with tracking info
      if (populatedOrder) {
        const customerId = typeof populatedOrder.customer === 'object' && populatedOrder.customer
          ? populatedOrder.customer._id.toString() 
          : String(populatedOrder.customer || '');
          
        const customerNotification = {
          type: 'order_fulfilled',
          orderId: order._id,
          orderNumber: order.orderNumber,
          trackingInfo: order.trackingInfo,
          message: `Your order ${order.orderNumber} has been fulfilled and is on its way!`,
          date: new Date()
        };
        
        safeEmit(emitCustomerNotification, {
          customerId,
          notification: customerNotification
        });
      }
      
      // Trigger reorder notifications for low stock items
      for (const item of reorderItems) {
        safeEmit(emitInventoryReorderAlert, item);
      }
      
      // Refresh dashboard
      safeEmit(emitDashboardRefresh, null);
      
    } catch (notificationError) {
      // Log notification errors but don't fail the request
      logger.error('Error sending fulfillment notifications:', {
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        orderId: id
      });
    }
    
    res.status(200).json({
      success: true,
      data: populatedOrder
    });
    
  } catch (error) {
    // Ensure transaction is properly handled
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (abortError) {
      logger.error('Error aborting transaction:', {
        error: abortError instanceof Error ? abortError.message : String(abortError)
      });
    } finally {
      session.endSession();
    }
    
    logger.error('Order fulfillment error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

/**
 * Handle order completion process
 * @route PUT /api/orders/:id/complete
 */
export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const { 
      paymentReconciliation,
      loyaltyPoints,
      completionDate = new Date(),
      notes,
      archiveOrder = false
    } = req.body;
    
    // Find the order
    const order = await Order.findById(id)
      .populate('customer')
      .session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate order status - can only complete from fulfilled status
    if (order.status !== 'fulfilled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order must be in fulfilled status to be completed'
      });
    }
    
    // Update order completion details
    order.status = 'completed';
    order.completionDate = completionDate;
    
    // Add payment reconciliation if provided
    if (paymentReconciliation) {
      order.paymentReconciliation = {
        ...paymentReconciliation,
        date: paymentReconciliation.date || new Date()
      };
    }
    
    // Archive order if requested
    if (archiveOrder) {
      order.isArchived = true;
    }
    
    // Add audit trail entry
    if (!order.auditTrail) {
      order.auditTrail = [];
    }
    
    order.auditTrail.push({
      event: 'order_completed',
      date: new Date(),
      user: userId,
      details: notes || 'Order completed'
    });
    
    await order.save({ session });
    
    // Update customer loyalty points if provided
    if (loyaltyPoints && loyaltyPoints.pointsEarned > 0 && order.customer) {
      const customerId = typeof order.customer === 'object' 
        ? order.customer._id 
        : order.customer;
        
      const customer = await Customer.findById(customerId).session(session);
      
      if (customer) {
        // Handle the case where loyaltyPoints might be undefined
        const currentPoints = customer.loyaltyPoints || 0;
        const previousPoints = currentPoints;
        
        // Update the loyalty points
        customer.loyaltyPoints = currentPoints + loyaltyPoints.pointsEarned;
        
        // Save updates to customer
        await customer.save({ session });
        
        // Add loyalty update to order
        order.loyaltyUpdate = {
          previousPoints,
          currentPoints: customer.loyaltyPoints,
          pointsEarned: loyaltyPoints.pointsEarned,
          updateDate: new Date()
        };
        
        await order.save({ session });
      }
    }
    
    // Get fully populated order for response
    const populatedOrder = await Order.findById(id)
      .populate('customer')
      .populate('products.product')
      .session(session);
      
    await session.commitTransaction();
    session.endSession();
    
    // Send notifications after successful transaction
    try {
      // Notify about the completed order
      safeEmit(emitOrderCompleted, populatedOrder);
      safeEmit(emitOrderUpdated, populatedOrder);
      
      // Send customer notification about completion
      if (populatedOrder) {
        const customerId = typeof populatedOrder.customer === 'object' && populatedOrder.customer
          ? populatedOrder.customer._id.toString() 
          : String(populatedOrder.customer || '');
          
        const customerNotification = {
          type: 'order_completed',
          orderId: order._id,
          orderNumber: order.orderNumber,
          message: `Your order ${order.orderNumber} is now complete. Thank you for your business!`,
          date: new Date()
        };
        
        safeEmit(emitCustomerNotification, {
          customerId,
          notification: customerNotification
        });
      }
      
      // If loyalty points were updated, send notification
      if (loyaltyPoints && loyaltyPoints.pointsEarned > 0 && order.loyaltyUpdate) {
        safeEmit(emitLoyaltyPointsUpdated, {
          customerId: typeof order.customer === 'object' && order.customer
          ? order.customer._id.toString() 
          : String(order.customer || ''),
          previousPoints: order.loyaltyUpdate.previousPoints,
          currentPoints: order.loyaltyUpdate.currentPoints,
          pointsEarned: order.loyaltyUpdate.pointsEarned,
          orderNumber: order.orderNumber
        });
      }
      
      // Refresh dashboard
      safeEmit(emitDashboardRefresh, null);
      
    } catch (notificationError) {
      // Log notification errors but don't fail the request
      logger.error('Error sending completion notifications:', {
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        orderId: id
      });
    }
    
    res.status(200).json({
      success: true,
      data: populatedOrder
    });
    
  } catch (error) {
    // Ensure transaction is properly handled
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (abortError) {
      logger.error('Error aborting transaction:', {
        error: abortError instanceof Error ? abortError.message : String(abortError)
      });
    } finally {
      session.endSession();
    }
    
    logger.error('Order completion error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

/**
 * Generate Invoice from order
 * @route GET /api/orders/:id/invoice
 */
export const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Find the order with populated fields
    const order = await Order.findById(id)
      .populate('customer')
      .populate('products.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get customer info safely
    const customerInfo = (typeof order.customer === 'object' && order.customer && 'name' in order.customer) ? {
      name: (order.customer as { name?: string; email?: string }).name || 'Customer',
      email: (order.customer as { name?: string; email?: string }).email || '',
      address: order.shippingAddress
    } : {
      name: 'Customer',
      email: '',
      address: order.shippingAddress
    };
    
    // Generate invoice data structure (would be used for actual PDF generation)
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber.slice(4)}`,
      orderNumber: order.orderNumber,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      customerInfo,
      items: order.products.map(item => {
        const productName = typeof item.product === 'object' && item.product && 'name' in item.product
          ? (item.product as { name: string }).name 
          : 'Product';
          
        return {
          name: productName,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        };
      }),
      subtotal: order.totalAmount,
      tax: 0, // Calculate tax if needed
      total: order.totalAmount,
      notes: 'Thank you for your business!',
      paymentTerms: 'Net 30'
    };
    
    // In a real implementation, you would generate a PDF here
    // For now, just return the invoice data
    
    // Add audit trail entry for invoice generation
    if (!order.auditTrail) {
      order.auditTrail = [];
    }
    
    order.auditTrail.push({
      event: 'invoice_generated',
      date: new Date(),
      user: userId,
      details: `Invoice ${invoice.invoiceNumber} generated`
    });
    
    await order.save();
    
    // Emit invoice generated event
    safeEmit(emitInvoiceGenerated, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      total: invoice.total
    });
    
    res.status(200).json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    logger.error('Invoice generation error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

/**
 * Get order audit trail
 * @route GET /api/orders/:id/audit-trail
 */
export const getOrderAuditTrail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate({
        path: 'auditTrail.user',
        select: 'name email'
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const auditTrail = order.auditTrail || [];
    
    res.status(200).json({
      success: true,
      data: auditTrail
    });
  } catch (error) {
    logger.error('Error fetching audit trail:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id
    });
    next(error);
  }
};

/**
 * Archive an order
 * @route PUT /api/orders/:id/archive
 */
export const archiveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isArchived = true } = req.body;
    const userId = getUserId(req);
    
    // Find the order to get current audit trail
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Add audit trail entry
    const auditTrail = existingOrder.auditTrail || [];
    auditTrail.push({
      event: isArchived ? 'order_archived' : 'order_unarchived',
      date: new Date(),
      user: userId,
      details: isArchived ? 'Order archived' : 'Order restored from archive'
    });
    
    const order = await Order.findByIdAndUpdate(
      id,
      { 
        isArchived,
        auditTrail
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('customer', 'name email')
     .populate('products.product', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Order archive operation error:', {
      error: error instanceof Error ? error.message : String(error),
      orderId: req.params.id,
      action: req.body.isArchived ? 'archive' : 'unarchive'
    });
    next(error);
  }
};