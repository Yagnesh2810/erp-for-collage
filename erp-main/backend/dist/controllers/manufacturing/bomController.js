"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBOMCost = exports.checkComponentAvailability = exports.deleteBOM = exports.updateBOM = exports.createBOM = exports.getBOMById = exports.getAllBOMs = void 0;
const BillOfMaterials_1 = __importDefault(require("../../models/manufacturing/BillOfMaterials"));
const Product_1 = __importDefault(require("../../models/Product"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all BOMs
const getAllBOMs = async (req, res) => {
    try {
        const { product, isActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (product)
            filter.product = product;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const boms = await BillOfMaterials_1.default.find(filter)
            .populate('product', 'name sku')
            .populate('components.product', 'name sku stock')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await BillOfMaterials_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: boms,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching BOMs',
            error: error.message,
        });
    }
};
exports.getAllBOMs = getAllBOMs;
// Get BOM by ID
const getBOMById = async (req, res) => {
    try {
        const bom = await BillOfMaterials_1.default.findById(req.params.id)
            .populate('product')
            .populate('components.product')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        res.json({
            success: true,
            data: bom,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching BOM',
            error: error.message,
        });
    }
};
exports.getBOMById = getBOMById;
// Create BOM
const createBOM = async (req, res) => {
    try {
        const bomNumber = await (0, numberGenerator_1.generateBOMNumber)();
        const bomData = {
            ...req.body,
            bomNumber,
            createdBy: req.user._id,
        };
        // Validate product exists
        const product = await Product_1.default.findById(bomData.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        // Validate all component products exist
        for (const component of bomData.components) {
            const componentProduct = await Product_1.default.findById(component.product);
            if (!componentProduct) {
                return res.status(404).json({
                    success: false,
                    message: `Component product ${component.product} not found`,
                });
            }
        }
        const bom = await BillOfMaterials_1.default.create(bomData);
        res.status(201).json({
            success: true,
            message: 'BOM created successfully',
            data: bom,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating BOM',
            error: error.message,
        });
    }
};
exports.createBOM = createBOM;
// Update BOM
const updateBOM = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const bom = await BillOfMaterials_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('product')
            .populate('components.product');
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        res.json({
            success: true,
            message: 'BOM updated successfully',
            data: bom,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating BOM',
            error: error.message,
        });
    }
};
exports.updateBOM = updateBOM;
// Delete BOM
const deleteBOM = async (req, res) => {
    try {
        const bom = await BillOfMaterials_1.default.findByIdAndDelete(req.params.id);
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        res.json({
            success: true,
            message: 'BOM deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting BOM',
            error: error.message,
        });
    }
};
exports.deleteBOM = deleteBOM;
// Check component availability
const checkComponentAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.query;
        const bom = await BillOfMaterials_1.default.findById(id).populate('components.product');
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        const requiredQuantity = Number(quantity) || 1;
        const availability = [];
        for (const component of bom.components) {
            const product = component.product;
            const requiredQty = component.quantity * requiredQuantity;
            const available = product.stock >= requiredQty;
            availability.push({
                product: {
                    id: product._id,
                    name: product.name,
                    sku: product.sku,
                },
                required: requiredQty,
                available: product.stock,
                sufficient: available,
                shortage: available ? 0 : requiredQty - product.stock,
            });
        }
        const allAvailable = availability.every((item) => item.sufficient);
        res.json({
            success: true,
            data: {
                bom: {
                    id: bom._id,
                    name: bom.name,
                    bomNumber: bom.bomNumber,
                },
                quantity: requiredQuantity,
                allComponentsAvailable: allAvailable,
                components: availability,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking component availability',
            error: error.message,
        });
    }
};
exports.checkComponentAvailability = checkComponentAvailability;
// Calculate BOM cost
const calculateBOMCost = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.query;
        const bom = await BillOfMaterials_1.default.findById(id);
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        const productionQuantity = Number(quantity) || 1;
        const totalCost = bom.totalCost * productionQuantity;
        res.json({
            success: true,
            data: {
                bom: {
                    id: bom._id,
                    name: bom.name,
                    bomNumber: bom.bomNumber,
                },
                quantity: productionQuantity,
                costBreakdown: {
                    materialCost: (bom.totalCost - bom.laborCost - bom.overheadCost) * productionQuantity,
                    laborCost: bom.laborCost * productionQuantity,
                    overheadCost: bom.overheadCost * productionQuantity,
                    totalCost,
                },
                costPerUnit: bom.totalCost,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating BOM cost',
            error: error.message,
        });
    }
};
exports.calculateBOMCost = calculateBOMCost;
