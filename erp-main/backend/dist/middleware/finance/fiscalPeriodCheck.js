"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFiscalPeriodOpen = void 0;
const FiscalPeriod_1 = __importDefault(require("../../models/finance/FiscalPeriod"));
const checkFiscalPeriodOpen = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const activePeriod = await FiscalPeriod_1.default.findOne({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });
        if (!activePeriod) {
            return res.status(400).json({ error: 'No active fiscal period found' });
        }
        if (activePeriod.isClosed) {
            return res.status(400).json({ error: 'Current fiscal period is closed' });
        }
        req.body.fiscalPeriod = activePeriod;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check fiscal period' });
    }
};
exports.checkFiscalPeriodOpen = checkFiscalPeriodOpen;
