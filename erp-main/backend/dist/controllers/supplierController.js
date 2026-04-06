"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplier = exports.getAllSuppliers = void 0;
const Supplier_1 = __importDefault(require("../models/Supplier"));
// Get all suppliers
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier_1.default.find({}).sort({ createdAt: -1 });
        return res.status(200).json(suppliers);
    }
    catch (error) {
        console.error('Error fetching suppliers:', error);
        return res.status(500).json({ message: 'Failed to fetch suppliers', error });
    }
};
exports.getAllSuppliers = getAllSuppliers;
// Get a single supplier
const getSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier_1.default.findById(id).populate('products');
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        return res.status(200).json(supplier);
    }
    catch (error) {
        console.error('Error fetching supplier:', error);
        return res.status(500).json({ message: 'Failed to fetch supplier', error });
    }
};
exports.getSupplier = getSupplier;
// Create a new supplier
const createSupplier = async (req, res) => {
    try {
        const { name, email, phone, address, contactPerson } = req.body;
        const existingSupplier = await Supplier_1.default.findOne({ email });
        if (existingSupplier) {
            return res.status(400).json({ message: 'Supplier with this email already exists' });
        }
        const supplier = await Supplier_1.default.create({
            name,
            email,
            phone,
            address,
            contactPerson,
            products: []
        });
        return res.status(201).json(supplier);
    }
    catch (error) {
        console.error('Error creating supplier:', error);
        return res.status(500).json({ message: 'Failed to create supplier', error });
    }
};
exports.createSupplier = createSupplier;
// Update a supplier
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, contactPerson, products, notes, isActive } = req.body;
        // Check if email is taken by another supplier
        if (email) {
            const existingSupplier = await Supplier_1.default.findOne({ email, _id: { $ne: id } });
            if (existingSupplier) {
                return res.status(400).json({ message: 'Email already in use by another supplier' });
            }
        }
        const supplier = await Supplier_1.default.findByIdAndUpdate(id, { name, email, phone, address, contactPerson, products, notes, isActive }, { new: true, runValidators: true });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        return res.status(200).json(supplier);
    }
    catch (error) {
        console.error('Error updating supplier:', error);
        return res.status(500).json({ message: 'Failed to update supplier', error });
    }
};
exports.updateSupplier = updateSupplier;
// Delete a supplier
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier_1.default.findByIdAndDelete(id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        return res.status(200).json({ message: 'Supplier deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting supplier:', error);
        return res.status(500).json({ message: 'Failed to delete supplier', error });
    }
};
exports.deleteSupplier = deleteSupplier;
