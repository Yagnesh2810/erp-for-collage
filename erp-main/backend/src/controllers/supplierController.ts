import { Request, Response } from 'express';
import Supplier from '../models/Supplier';

// Get all suppliers
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    return res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ message: 'Failed to fetch suppliers', error });
  }
};

// Get a single supplier
export const getSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id).populate('products');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    return res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return res.status(500).json({ message: 'Failed to fetch supplier', error });
  }
};

// Create a new supplier
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;
    
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }
    
    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      contactPerson,
      products: []
    });
    
    return res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return res.status(500).json({ message: 'Failed to create supplier', error });
  }
};

// Update a supplier
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson, products, notes, isActive } = req.body;
    
    // Check if email is taken by another supplier
    if (email) {
      const existingSupplier = await Supplier.findOne({ email, _id: { $ne: id } });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Email already in use by another supplier' });
      }
    }
    
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, email, phone, address, contactPerson, products, notes, isActive },
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    return res.status(200).json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({ message: 'Failed to update supplier', error });
  }
};

// Delete a supplier
export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    return res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({ message: 'Failed to delete supplier', error });
  }
};