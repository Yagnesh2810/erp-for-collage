import { Request, Response } from 'express';
import CompanySettings from '../models/CompanySettings';

// Get company settings
export const getCompanySettings = async (req: Request, res: Response) => {
    try {
        let settings = await CompanySettings.findOne();

        // Create default settings if none exist
        if (!settings) {
            settings = await CompanySettings.create({
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching company settings',
            error: error.message,
        });
    }
};

// Update company settings
export const updateCompanySettings = async (req: Request, res: Response) => {
    try {
        let settings = await CompanySettings.findOne();

        if (!settings) {
            // Create if doesn't exist
            settings = await CompanySettings.create(req.body);
        } else {
            // Update existing
            settings = await CompanySettings.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.json({
            success: true,
            message: 'Company settings updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating company settings',
            error: error.message,
        });
    }
};

// Update active modules
export const updateActiveModules = async (req: Request, res: Response) => {
    try {
        const { modules } = req.body;

        const settings = await CompanySettings.findOne();

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating active modules',
            error: error.message,
        });
    }
};

// Get active modules
export const getActiveModules = async (req: Request, res: Response) => {
    try {
        const settings = await CompanySettings.findOne();

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active modules',
            error: error.message,
        });
    }
};
