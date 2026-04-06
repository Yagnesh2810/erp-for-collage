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
exports.SettingScope = void 0;
// backend/src/models/Settings.ts
const mongoose_1 = __importStar(require("mongoose"));
var SettingScope;
(function (SettingScope) {
    SettingScope["GLOBAL"] = "global";
    SettingScope["ORGANIZATION"] = "organization";
    SettingScope["USER"] = "user";
})(SettingScope = exports.SettingScope || (exports.SettingScope = {}));
const SettingSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    scope: {
        type: String,
        enum: Object.values(SettingScope),
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.scope === SettingScope.USER;
        }
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: function () {
            return this.scope === SettingScope.ORGANIZATION;
        }
    }
}, {
    timestamps: true
});
// Create a compound index for efficient lookups
SettingSchema.index({ key: 1, scope: 1, userId: 1, organizationId: 1 }, { unique: true });
// Create a model from the schema
const Setting = mongoose_1.default.model('Setting', SettingSchema);
exports.default = Setting;
