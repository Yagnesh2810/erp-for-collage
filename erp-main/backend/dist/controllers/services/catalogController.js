"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCategories = exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getAllServices = void 0;
const ServiceCatalog_1 = __importDefault(require("../../models/services/ServiceCatalog"));
// Get all services
const getAllServices = async (req, res) => {
    try {
        const { category, available, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (available !== undefined)
            filter.available = available === 'true';
        const services = await ServiceCatalog_1.default.find(filter)
            .populate('providers', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await ServiceCatalog_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching services',
            error: error.message,
        });
    }
};
exports.getAllServices = getAllServices;
// Get service by ID
const getServiceById = async (req, res) => {
    try {
        const service = await ServiceCatalog_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service',
            error: error.message,
        });
    }
};
exports.getServiceById = getServiceById;
// Create service
const createService = async (req, res) => {
    try {
        const serviceData = {
            ...req.body,
            createdBy: req.user._id,
        };
        const service = await ServiceCatalog_1.default.create(serviceData);
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message,
        });
    }
};
exports.createService = createService;
// Update service
const updateService = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const service = await ServiceCatalog_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('providers');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message,
        });
    }
};
exports.updateService = updateService;
// Delete service
const deleteService = async (req, res) => {
    try {
        const service = await ServiceCatalog_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message,
        });
    }
};
exports.deleteService = deleteService;
// Get service categories
const getServiceCategories = async (req, res) => {
    try {
        const categories = await ServiceCatalog_1.default.distinct('category');
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service categories',
            error: error.message,
        });
    }
};
exports.getServiceCategories = getServiceCategories;
