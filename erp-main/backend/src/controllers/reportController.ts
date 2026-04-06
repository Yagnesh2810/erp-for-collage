import { Request, Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import Project from '../models/Project';
import Task from '../models/Task';
import mongoose from 'mongoose';

/**
 * @desc    Get product categories data
 * @route   GET /api/reports/product-categories
 * @access  Private
 */
export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    // Create date filters if provided
    const dateFilter = {};
    if (from && to) {
      Object.assign(dateFilter, {
        createdAt: {
          $gte: new Date(from as string),
          $lte: new Date(to as string)
        }
      });
    }

    // Aggregate products by category
    const categories = await Product.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count'
        }
      },
      { $sort: { value: -1 } }
    ]);

    // If no categories found with the date filter, get all categories
    if (categories.length === 0 && (from || to)) {
      const allCategories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            value: '$count'
          }
        },
        { $sort: { value: -1 } }
      ]);
      
      return res.status(200).json({
        success: true,
        data: allCategories,
        message: 'No products found in the date range. Showing all categories.'
      });
    }

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get sales over time data
 * @route   GET /api/reports/sales-over-time
 * @access  Private
 */
export const getSalesOverTime = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required'
      });
    }

    // Create date range for the query
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);
    
    // Calculate appropriate date grouping based on the range
    const daysDifference = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
    
    let groupFormat;
    let formatPipeline;
    
    if (daysDifference <= 31) {
      // Group by day for ranges up to a month
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      formatPipeline = {
        $addFields: {
          date: '$_id'
        }
      };
    } else if (daysDifference <= 90) {
      // Group by week for ranges up to 3 months
      groupFormat = {
        $dateToString: { 
          format: '%Y-%U', 
          date: '$createdAt' 
        }
      };
      formatPipeline = {
        $addFields: {
          date: {
            $concat: ['Week ', { $substr: [{ $split: ['$_id', '-'] }, 1, -1] }, ', ', 
                      { $substr: [{ $split: ['$_id', '-'] }, 0, 1] }]
          }
        }
      };
    } else {
      // Group by month for larger ranges
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      formatPipeline = {
        $addFields: {
          date: {
            $let: {
              vars: {
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              in: {
                $concat: [
                  { $arrayElemAt: ['$monthNames', { $subtract: [{ $toInt: { $substr: [{ $split: ['$_id', '-'] }, 1, -1] } }, 1] }] },
                  ' ',
                  { $substr: [{ $split: ['$_id', '-'] }, 0, 1] }
                ]
              }
            }
          }
        }
      };
    }

    // Aggregate orders by created date
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
          status: { $nin: ['Cancelled'] }
        }
      },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      formatPipeline,
      {
        $project: {
          _id: 0,
          date: 1,
          total: 1,
          orders: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get top selling products
 * @route   GET /api/reports/top-products
 * @access  Private
 */
export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const { from, to, limit = 10 } = req.query;
    
    // Create date filters
    const matchFilter: any = {};
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }
    
    matchFilter.status = { $nin: ['Cancelled'] };

    // Lookup and aggregate order items to get top products
    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          quantity: 1,
          revenue: 1
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get inventory status
 * @route   GET /api/reports/inventory-status
 * @access  Private
 */
export const getInventoryStatus = async (req: Request, res: Response) => {
  try {
    // Get inventory data with product details
    const inventoryStatus = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: '$_id',
          name: '$productInfo.name',
          category: '$productInfo.category',
          currentStock: '$quantity',
          reorderPoint: { $ifNull: ['$reorderPoint', 10] },
          lowStock: { 
            $cond: { 
              if: { $lte: ['$quantity', { $ifNull: ['$reorderPoint', 10] }] }, 
              then: true, 
              else: false 
            } 
          }
        }
      },
      { $sort: { lowStock: -1, currentStock: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: inventoryStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get order status
 * @route   GET /api/reports/order-status
 * @access  Private
 */
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    // Create date filters
    const matchFilter: any = {};
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }

    // Get orders with customer details
    const orders = await Order.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          status: 1,
          total: 1,
          createdAt: 1,
          customer: {
            $cond: {
              if: { $gt: [{ $size: '$customerInfo' }, 0] },
              then: { 
                _id: { $arrayElemAt: ['$customerInfo._id', 0] },
                name: { $arrayElemAt: ['$customerInfo.name', 0] }
              },
              else: null
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get project reports
 * @route   GET /api/reports/projects
 * @access  Private
 */
export const getProjectReports = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    const matchFilter: any = {};
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }

    const projectStats = await Project.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          spentBudget: { $sum: '$spentBudget' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          totalBudget: 1,
          spentBudget: 1
        }
      }
    ]);

    const projectProgress = await Project.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress' },
          totalProjects: { $sum: 1 },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: projectStats,
        progress: projectProgress[0] || { avgProgress: 0, totalProjects: 0, completedProjects: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get task reports
 * @route   GET /api/reports/tasks
 * @access  Private
 */
export const getTaskReports = async (req: Request, res: Response) => {
  try {
    const { from, to, projectId } = req.query;
    
    const matchFilter: any = {};
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }
    if (projectId) {
      matchFilter.project = new mongoose.Types.ObjectId(projectId as string);
    }

    const taskStats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimated: { $sum: '$estimatedHours' },
          totalActual: { $sum: '$actualHours' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          totalEstimated: 1,
          totalActual: 1
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1
        }
      }
    ]);

    const overdueTasks = await Task.countDocuments({
      ...matchFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: taskStats,
        priorityBreakdown: priorityStats,
        overdueTasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Get team productivity report
 * @route   GET /api/reports/team-productivity
 * @access  Private
 */
export const getTeamProductivity = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    const matchFilter: any = {};
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }

    // Check if there are any tasks first
    const taskCount = await Task.countDocuments(matchFilter);
    if (taskCount === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const productivity = await Task.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'employees',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $match: {
          'employee.0': { $exists: true }
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$assignedTo',
          name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalEstimated: { $sum: { $ifNull: ['$estimatedHours', 0] } },
          totalActual: { $sum: { $ifNull: ['$actualHours', 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          employeeId: '$_id',
          name: 1,
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              0
            ]
          },
          efficiency: {
            $cond: [
              { $and: [{ $gt: ['$totalEstimated', 0] }, { $gt: ['$totalActual', 0] }] },
              { $multiply: [{ $divide: ['$totalEstimated', '$totalActual'] }, 100] },
              100
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: productivity
    });
  } catch (error) {
    console.error('Team productivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team productivity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};