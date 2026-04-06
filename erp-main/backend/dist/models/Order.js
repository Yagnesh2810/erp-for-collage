"use strict";
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
const OrderSchema = new mongoose_1.Schema({
    customer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true,
        default: function () {
            // Provide a temporary default value that will be replaced by the pre-save hook
            return `ORD-TEMP-${new Date().getTime()}`;
        }
    },
    products: [
        {
            product: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Product is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: [1, 'Quantity must be at least 1']
            },
            price: {
                type: Number,
                required: [true, 'Price is required']
            }
        }
    ],
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Street is required']
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
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount must be at least 0']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'fulfilled', 'completed', 'cancelled'],
        default: 'pending'
    },
    // New fields for fulfillment
    fulfillmentStatus: {
        type: String,
        enum: ['unfulfilled', 'partial', 'fulfilled'],
        default: 'unfulfilled'
    },
    fulfillmentDate: {
        type: Date
    },
    trackingInfo: {
        carrier: {
            type: String
        },
        trackingNumber: {
            type: String
        },
        trackingUrl: {
            type: String
        },
        estimatedDelivery: {
            type: Date
        },
        actualDelivery: {
            type: Date
        }
    },
    // New fields for completion
    completionDate: {
        type: Date
    },
    paymentReconciliation: {
        status: {
            type: String,
            enum: ['pending', 'complete', 'partial', 'discrepancy'],
            default: 'pending'
        },
        date: {
            type: Date
        },
        method: {
            type: String
        },
        reference: {
            type: String
        },
        amount: {
            type: Number
        },
        notes: {
            type: String
        }
    },
    loyaltyUpdate: {
        previousPoints: {
            type: Number
        },
        currentPoints: {
            type: Number
        },
        pointsEarned: {
            type: Number
        },
        updateDate: {
            type: Date
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    // Audit trail for tracking all changes to the order
    auditTrail: [
        {
            event: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            details: {
                type: String
            }
        }
    ],
    // Sales rep reference
    salesRepId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});
// Modified pre-save hook to work with the default value
OrderSchema.pre('save', async function (next) {
    // Check if this is a new document or if it has the temporary order number
    if (this.isNew || this.orderNumber.startsWith('ORD-TEMP')) {
        try {
            // Generate order number based on current date and a sequential counter
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            // Find the latest order to get the next sequence
            const latestOrder = await mongoose_1.default.model('Order').findOne({ orderNumber: { $not: { $regex: /^ORD-TEMP/ } } }, // Exclude temporary order numbers
            {}, { sort: { 'createdAt': -1 } });
            let sequence = 1;
            if (latestOrder && latestOrder.orderNumber) {
                // Extract sequence from the latest order number and increment
                const parts = latestOrder.orderNumber.split('-');
                if (parts.length >= 3) {
                    const lastSequence = parseInt(parts[2], 10);
                    if (!isNaN(lastSequence)) {
                        sequence = lastSequence + 1;
                    }
                }
            }
            // Format: ORD-YYMMDD-SEQUENCE
            this.orderNumber = `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
            next();
        }
        catch (error) {
            next(error);
        }
    }
    else {
        next();
    }
});
// Add audit entry on status change
OrderSchema.pre('save', function (next) {
    const order = this;
    if (order.isModified('status')) {
        if (!order.auditTrail) {
            order.auditTrail = [];
        }
        order.auditTrail.push({
            event: `status_changed_to_${order.status}`,
            date: new Date(),
            user: order.salesRepId || order.customer,
            details: `Order status changed to ${order.status}`
        });
    }
    next();
});
// Create and export the Order model
exports.default = mongoose_1.default.model('Order', OrderSchema);
