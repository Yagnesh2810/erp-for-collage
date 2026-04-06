"use strict";
// project\backend\src\models\Customer.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CustomerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        }
    },
    contactPerson: {
        type: String,
        trim: true
    },
    customerType: {
        type: String,
        enum: ['regular', 'wholesale', 'vip'],
        default: 'regular'
    },
    taxId: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    tags: [String],
    // Purchase history tracking fields
    lastPurchaseDate: {
        type: Date
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    creditLimit: {
        type: Number,
        default: 5000 // Default credit limit
    },
    creditStatus: {
        type: String,
        enum: ['good', 'review', 'hold'],
        default: 'good'
    },
    // Add loyaltyPoints field to schema
    loyaltyPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Add an index for faster searching
CustomerSchema.index({ name: 'text', email: 'text', 'address.city': 'text' });
exports.default = mongoose_1.default.model('Customer', CustomerSchema);
