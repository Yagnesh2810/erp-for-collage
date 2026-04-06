"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveModules = exports.updateActiveModules = exports.updateCompanySettings = exports.getCompanySettings = void 0;
const CompanySettings_1 = __importDefault(require("../models/CompanySettings"));
// Get company settings
const getCompanySettings = async (req, res) => {
    try {
        let settings = await CompanySettings_1.default.findOne();
        // Create default settings if none exist
        if (!settings) {
            settings = await CompanySettings_1.default.create({
                companyName: 'My Company',
                industryType: 'GENERAL',
                companyProfile: {
                    email: 'admin@company.com',
                    phone: '+1234567890',
                    address: {
                        street: '123 Main St',
                        city: 'City',
                        state: 'State',
                        country: 'Country',
                        postalCode: '12345',
                    },
                },
            });
        }
        res.json({
            success: true,
            data: settings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching company settings',
            error: error.message,
        });
    }
};
exports.getCompanySettings = getCompanySettings;
// Update company settings
const updateCompanySettings = async (req, res) => {
    try {
        let settings = await CompanySettings_1.default.findOne();
        if (!settings) {
            // Create if doesn't exist
            settings = await CompanySettings_1.default.create(req.body);
        }
        else {
            // Update existing
            settings = await CompanySettings_1.default.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
        }
        res.json({
            success: true,
            message: 'Company settings updated successfully',
            data: settings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating company settings',
            error: error.message,
        });
    }
};
exports.updateCompanySettings = updateCompanySettings;
// Update active modules
const updateActiveModules = async (req, res) => {
    try {
        const { modules } = req.body;
        const settings = await CompanySettings_1.default.findOne();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Company settings not found',
            });
        }
        settings.activeModules = { ...settings.activeModules, ...modules };
        await settings.save();
        res.json({
            success: true,
            message: 'Active modules updated successfully',
            data: settings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating active modules',
            error: error.message,
        });
    }
};
exports.updateActiveModules = updateActiveModules;
// Get active modules
const getActiveModules = async (req, res) => {
    try {
        const settings = await CompanySettings_1.default.findOne();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Company settings not found',
            });
        }
        res.json({
            success: true,
            data: {
                industryType: settings.industryType,
                activeModules: settings.activeModules,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active modules',
            error: error.message,
        });
    }
};
exports.getActiveModules = getActiveModules;
