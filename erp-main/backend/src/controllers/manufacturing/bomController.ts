import { Request, Response } from 'express';
import BillOfMaterials from '../../models/manufacturing/BillOfMaterials';
import Product from '../../models/Product';
import { generateBOMNumber } from '../../utils/numberGenerator';

// Get all BOMs
export const getAllBOMs = async (req: Request, res: Response) => {
    try {
        const { product, isActive, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (product) filter.product = product;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const boms = await BillOfMaterials.find(filter)
            .populate('product', 'name sku')
            .populate('components.product', 'name sku stock')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await BillOfMaterials.countDocuments(filter);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching BOMs',
            error: error.message,
        });
    }
};

// Get BOM by ID
export const getBOMById = async (req: Request, res: Response) => {
    try {
        const bom = await BillOfMaterials.findById(req.params.id)
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching BOM',
            error: error.message,
        });
    }
};

// Create BOM
export const createBOM = async (req: Request, res: Response) => {
    try {
        const bomNumber = await generateBOMNumber();

        const bomData = {
            ...req.body,
            bomNumber,
            createdBy: (req as any).user._id,
        };

        // Validate product exists
        const product = await Product.findById(bomData.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Validate all component products exist
        for (const component of bomData.components) {
            const componentProduct = await Product.findById(component.product);
            if (!componentProduct) {
                return res.status(404).json({
                    success: false,
                    message: `Component product ${component.product} not found`,
                });
            }
        }

        const bom = await BillOfMaterials.create(bomData);

        res.status(201).json({
            success: true,
            message: 'BOM created successfully',
            data: bom,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating BOM',
            error: error.message,
        });
    }
};

// Update BOM
export const updateBOM = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const bom = await BillOfMaterials.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating BOM',
            error: error.message,
        });
    }
};

// Delete BOM
export const deleteBOM = async (req: Request, res: Response) => {
    try {
        const bom = await BillOfMaterials.findByIdAndDelete(req.params.id);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting BOM',
            error: error.message,
        });
    }
};

// Check component availability
export const checkComponentAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.query;

        const bom = await BillOfMaterials.findById(id).populate('components.product');

        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }

        const requiredQuantity = Number(quantity) || 1;
        const availability = [];

        for (const component of bom.components) {
            const product: any = component.product;
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error checking component availability',
            error: error.message,
        });
    }
};

// Calculate BOM cost
export const calculateBOMCost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.query;

        const bom = await BillOfMaterials.findById(id);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error calculating BOM cost',
            error: error.message,
        });
    }
};
