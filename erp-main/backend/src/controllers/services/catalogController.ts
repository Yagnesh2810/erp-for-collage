import { Request, Response } from 'express';
import ServiceCatalog from '../../models/services/ServiceCatalog';

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
    try {
        const { category, available, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (category) filter.category = category;
        if (available !== undefined) filter.available = available === 'true';

        const services = await ServiceCatalog.find(filter)
            .populate('providers', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await ServiceCatalog.countDocuments(filter);

        res.json({
            success: true,
            data: services,
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
            message: 'Error fetching services',
            error: error.message,
        });
    }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
    try {
        const service = await ServiceCatalog.findById(req.params.id)
            .populate('providers')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            data: service,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service',
            error: error.message,
        });
    }
};

// Create service
export const createService = async (req: Request, res: Response) => {
    try {
        const serviceData = {
            ...req.body,
            createdBy: (req as any).user._id,
        };

        const service = await ServiceCatalog.create(serviceData);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message,
        });
    }
};

// Update service
export const updateService = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const service = await ServiceCatalog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('providers');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message,
        });
    }
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
    try {
        const service = await ServiceCatalog.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message,
        });
    }
};

// Get service categories
export const getServiceCategories = async (req: Request, res: Response) => {
    try {
        const categories = await ServiceCatalog.distinct('category');

        res.json({
            success: true,
            data: categories,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service categories',
            error: error.message,
        });
    }
};
