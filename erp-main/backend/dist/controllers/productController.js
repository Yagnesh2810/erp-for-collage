"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllProducts = async (_req, res, next) => {
    try {
        const products = await Product_1.default.find()
            .populate("supplier", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
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
            ? new mongoose_1.default.Types.ObjectId(userId)
            : userId;
        const newProduct = new Product_1.default({
            ...req.body,
            createdBy: userObjectId,
            updatedBy: userObjectId
        });
        const savedProduct = await newProduct.save();
        res.status(201).json({
            success: true,
            data: savedProduct
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
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
            ? new mongoose_1.default.Types.ObjectId(userId)
            : userId;
        const updatedProduct = await Product_1.default.findByIdAndUpdate(req.params.id, {
            ...req.body,
            updatedBy: userObjectId
        }, { new: true, runValidators: true }).populate("supplier", "name");
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const updateStock = async (req, res, next) => {
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
            ? new mongoose_1.default.Types.ObjectId(userId)
            : userId;
        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Quantity is required"
            });
        }
        const product = await Product_1.default.findById(req.params.id);
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateStock = updateStock;
