"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchContacts = exports.deleteContact = exports.updateContact = exports.createContact = exports.getContactById = exports.getContacts = void 0;
const Contact_1 = __importDefault(require("../models/Contact"));
// Define a type assertion function to safely access req.user
const getUserId = (req) => {
    // We know req.user exists and has an id because of the protect middleware
    if (!req.user || !req.user.id) {
        throw new Error('User not authenticated');
    }
    return req.user.id;
};
// Get all contacts for the logged-in user
const getContacts = async (req, res) => {
    try {
        const userId = getUserId(req);
        const contacts = await Contact_1.default.find({ createdBy: userId })
            .sort({ name: 1 })
            .exec();
        return res.status(200).json(contacts);
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ message: 'Error fetching contacts' });
    }
};
exports.getContacts = getContacts;
// Get a single contact by ID
const getContactById = async (req, res) => {
    try {
        const userId = getUserId(req);
        const contact = await Contact_1.default.findOne({
            _id: req.params.id,
            createdBy: userId,
        });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json(contact);
    }
    catch (error) {
        console.error('Error fetching contact:', error);
        return res.status(500).json({ message: 'Error fetching contact' });
    }
};
exports.getContactById = getContactById;
// Create a new contact
const createContact = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, email, phone, company, position, address, notes, tags } = req.body;
        // Basic validation
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }
        const newContact = new Contact_1.default({
            name,
            email,
            phone,
            company,
            position,
            address,
            notes,
            tags,
            createdBy: userId,
        });
        const savedContact = await newContact.save();
        return res.status(201).json(savedContact);
    }
    catch (error) {
        console.error('Error creating contact:', error);
        return res.status(500).json({ message: 'Error creating contact' });
    }
};
exports.createContact = createContact;
// Update an existing contact
const updateContact = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, email, phone, company, position, address, notes, tags } = req.body;
        // Find contact and check ownership
        const contact = await Contact_1.default.findOne({
            _id: req.params.id,
            createdBy: userId,
        });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        // Update fields
        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.phone = phone || contact.phone;
        contact.company = company || contact.company;
        contact.position = position || contact.position;
        contact.address = address || contact.address;
        contact.notes = notes || contact.notes;
        contact.tags = tags || contact.tags;
        const updatedContact = await contact.save();
        return res.status(200).json(updatedContact);
    }
    catch (error) {
        console.error('Error updating contact:', error);
        return res.status(500).json({ message: 'Error updating contact' });
    }
};
exports.updateContact = updateContact;
// Delete a contact
const deleteContact = async (req, res) => {
    try {
        const userId = getUserId(req);
        const contact = await Contact_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: userId,
        });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json({ message: 'Contact deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting contact:', error);
        return res.status(500).json({ message: 'Error deleting contact' });
    }
};
exports.deleteContact = deleteContact;
// Search contacts
const searchContacts = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const contacts = await Contact_1.default.find({
            createdBy: userId,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { company: { $regex: query, $options: 'i' } },
            ],
        }).sort({ name: 1 });
        return res.status(200).json(contacts);
    }
    catch (error) {
        console.error('Error searching contacts:', error);
        return res.status(500).json({ message: 'Error searching contacts' });
    }
};
exports.searchContacts = searchContacts;
