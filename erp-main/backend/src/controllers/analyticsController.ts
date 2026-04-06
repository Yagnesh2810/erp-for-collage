// src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import Customer from '../models/Customer';

/**
 * Get dashboard analytics data
 * @route GET /api/analytics/dashboard
 * @access Private
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get recent order statistics
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get revenue analytics
    const currentMonthOrders = await Order.find({
      createdAt: { $gte: startOfCurrentMonth }
    });
    
    const previousMonthOrders = await Order.find({
      createdAt: { 
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth
      }
    });
    
    const currentMonthRevenue = currentMonthOrders.reduce(
      (total, order) => total + order.totalAmount, 0
    );
    
    const previousMonthRevenue = previousMonthOrders.reduce(
      (total, order) => total + order.totalAmount, 0
    );
    
    // Calculate revenue change percentage
    const revenueChangePercentage = previousMonthRevenue !== 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 100;

    // Get product category distribution
    const productCategories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count" } }
    ]);
    
    // Get inventory status
    const lowStockThreshold = 10; // Define what "low stock" means
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Inventory.countDocuments({ quantity: { $lte: lowStockThreshold } });
    const outOfStockCount = await Inventory.countDocuments({ quantity: 0 });
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { 
          _id: "$products.product", 
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } 
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $project: {
          _id: 1,
          name: "$productDetails.name",
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);
    
    // Get recent customers
    const totalCustomers = await Customer.countDocuments();
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get order fulfillment metrics
    const fulfilledOrders = await Order.countDocuments({ status: "fulfilled" });
    const pendingFulfillment = await Order.countDocuments({ 
      status: { $in: ["processing", "pending"] } 
    });
    
    // Assemble the dashboard data
    const dashboardData = {
      orderMetrics: {
        total: totalOrders,
        recent: recentOrders,
        byStatus: ordersByStatus,
        percentChange: ((recentOrders - (totalOrders - recentOrders)) / (totalOrders - recentOrders || 1)) * 100
      },
      revenueMetrics: {
        currentMonth: currentMonthRevenue,
        previousMonth: previousMonthRevenue,
        percentChange: revenueChangePercentage
      },
      inventoryMetrics: {
        total: totalProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        percentLowStock: (lowStockCount / totalProducts) * 100
      },
      productMetrics: {
        categories: productCategories,
        topSelling: topSellingProducts
      },
      customerMetrics: {
        total: totalCustomers,
        new: newCustomers,
        percentNew: (newCustomers / totalCustomers) * 100
      },
      fulfillmentMetrics: {
        fulfilled: fulfilledOrders,
        pending: pendingFulfillment,
        percentFulfilled: (fulfilledOrders / (fulfilledOrders + pendingFulfillment || 1)) * 100
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics data' });
  }
};

/**
 * Get sales analytics data
 * @route GET /api/analytics/sales
 * @access Private
 */
export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    // Date filters - can be expanded with query params
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Monthly sales for the past year
    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: oneYearAgo },
          status: { $nin: ['cancelled'] }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format the data for the chart
    const formattedMonthlySales = monthlySales.map(item => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      return {
        month: monthNames[item._id.month - 1],
        year: item._id.year,
        sales: item.totalSales,
        orders: item.orderCount
      };
    });
    
    res.json({ 
      success: true, 
      data: {
        monthlySales: formattedMonthlySales
      }
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching sales analytics' });
  }
};

/**
 * Get inventory analytics data
 * @route GET /api/analytics/inventory
 * @access Private
 */
export const getInventoryAnalytics = async (req: Request, res: Response) => {
  try {
    // Get inventory status distribution
    const inventoryStatus = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          productName: "$productDetails.name",
          category: "$productDetails.category",
          quantity: 1,
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$quantity", 0] }, then: "Out of Stock" },
                { case: { $lte: ["$quantity", 10] }, then: "Low Stock" },
                { case: { $gte: ["$quantity", 50] }, then: "Well Stocked" }
              ],
              default: "Normal"
            }
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get inventory by category
    const inventoryByCategory = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          avgQuantity: { $avg: "$quantity" }
        }
      },
      {
        $project: {
          category: "$_id",
          totalItems: 1,
          totalQuantity: 1,
          avgQuantity: { $round: ["$avgQuantity", 0] },
          _id: 0
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        inventoryStatus,
        inventoryByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inventory analytics' });
  }
};

export default {
  getDashboardAnalytics,
  getSalesAnalytics,
  getInventoryAnalytics
};