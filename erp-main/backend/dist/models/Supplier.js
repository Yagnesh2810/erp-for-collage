"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supplierSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Supplier email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Supplier phone number is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Supplier address is required'],
        trim: true,
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true,
    },
    products: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Product',
        }],
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});
const Supplier = mongoose_1.default.model('Supplier', supplierSchema);
exports.default = Supplier;
