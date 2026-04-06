import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find()
      .populate("supplier", "name")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("supplier", "name contactPerson email phone");
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user ID from authenticated request
    // The req.user is available thanks to the global namespace augmentation
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized"
      });
    }
    
    const userId = req.user._id;
    
    // Convert to ObjectId if needed (but req.user._id may already be an ObjectId)
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const newProduct = new Product({
      ...req.body,
      createdBy: userObjectId,
      updatedBy: userObjectId
    });
    
    const savedProduct = await newProduct.save();
    
    res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user ID from authenticated request
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized"
      });
    }
    
    const userId = req.user._id;
    
    // Convert to ObjectId if needed
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: userObjectId
      },
      { new: true, runValidators: true }
    ).populate("supplier", "name");
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized"
      });
    }
    
    const userId = req.user._id;
    
    // Convert to ObjectId if needed
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    product.stockQuantity += quantity;
    product.updatedBy = userObjectId;
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};