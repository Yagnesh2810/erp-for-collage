"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePermissions = exports.getUserPermissions = exports.assignRolesToUser = exports.createPermission = exports.getPermissions = exports.toggleRoleStatus = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const User_1 = __importDefault(require("../models/User"));
// Roles Management
const getRoles = async (req, res) => {
    try {
        const roles = await Role_1.Role.find().sort({ createdAt: -1 });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};
exports.getRoles = getRoles;
const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const existingRole = await Role_1.Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }
        const role = new Role_1.Role({ name, description, permissions });
        await role.save();
        res.status(201).json(role);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating role', error });
    }
};
exports.createRole = createRole;
const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name, description, permissions, isActive } = req.body;
        const updateData = { name, description, permissions };
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }
        const role = await Role_1.Role.findByIdAndUpdate(roleId, updateData, { new: true });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating role', error });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        // Check if role is assigned to any users
        const usersWithRole = await User_1.default.find({ roles: roleId });
        if (usersWithRole.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete role. It is assigned to users.'
            });
        }
        await Role_1.Role.findByIdAndUpdate(roleId, { isActive: false });
        res.json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting role', error });
    }
};
exports.deleteRole = deleteRole;
const toggleRoleStatus = async (req, res) => {
    try {
        const { roleId } = req.params;
        const role = await Role_1.Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        role.isActive = !role.isActive;
        await role.save();
        res.json({ message: `Role ${role.isActive ? 'activated' : 'deactivated'} successfully`, role });
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling role status', error });
    }
};
exports.toggleRoleStatus = toggleRoleStatus;
// Permissions Management
const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission_1.Permission.find({ isActive: true }).sort({ category: 1, name: 1 });
        res.json(permissions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching permissions', error });
    }
};
exports.getPermissions = getPermissions;
const createPermission = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const existingPermission = await Permission_1.Permission.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ message: 'Permission already exists' });
        }
        const permission = new Permission_1.Permission({ name, description, category });
        await permission.save();
        res.status(201).json(permission);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating permission', error });
    }
};
exports.createPermission = createPermission;
// User Role Assignment
const assignRolesToUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleIds } = req.body;
        const user = await User_1.default.findByIdAndUpdate(userId, { roles: roleIds }, { new: true }).populate('roles').select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const formattedUser = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            roles: user.roles || [],
            status: user.status || 'active',
            lastLogin: user.lastLogin || user.createdAt
        };
        res.json(formattedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error assigning roles', error });
    }
};
exports.assignRolesToUser = assignRolesToUser;
const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).populate('roles');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const permissions = new Set();
        // Get permissions from all assigned roles
        if (user.roles) {
            for (const role of user.roles) {
                role.permissions.forEach((permission) => permissions.add(permission));
            }
        }
        res.json({ permissions: Array.from(permissions) });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user permissions', error });
    }
};
exports.getUserPermissions = getUserPermissions;
// Initialize default permissions
const initializePermissions = async () => {
    const defaultPermissions = [
        // User Management
        { name: 'view_users', description: 'View users list', category: 'User Management' },
        { name: 'create_user', description: 'Create new users', category: 'User Management' },
        { name: 'update_user', description: 'Update user details', category: 'User Management' },
        { name: 'delete_user', description: 'Delete users', category: 'User Management' },
        // Product Management
        { name: 'view_products', description: 'View products', category: 'Product Management' },
        { name: 'create_product', description: 'Create products', category: 'Product Management' },
        { name: 'update_product', description: 'Update products', category: 'Product Management' },
        { name: 'delete_product', description: 'Delete products', category: 'Product Management' },
        // Order Management
        { name: 'view_orders', description: 'View orders', category: 'Order Management' },
        { name: 'create_order', description: 'Create orders', category: 'Order Management' },
        { name: 'update_order', description: 'Update orders', category: 'Order Management' },
        { name: 'delete_order', description: 'Delete orders', category: 'Order Management' },
        // Inventory Management
        { name: 'view_inventory', description: 'View inventory', category: 'Inventory Management' },
        { name: 'manage_inventory', description: 'Manage inventory levels', category: 'Inventory Management' },
        // Customer Management
        { name: 'view_customers', description: 'View customers', category: 'Customer Management' },
        { name: 'create_customer', description: 'Create customers', category: 'Customer Management' },
        { name: 'update_customer', description: 'Update customers', category: 'Customer Management' },
        { name: 'delete_customer', description: 'Delete customers', category: 'Customer Management' },
        // Reports & Analytics
        { name: 'view_reports', description: 'View reports', category: 'Reports & Analytics' },
        { name: 'export_data', description: 'Export data', category: 'Reports & Analytics' },
        // System Administration
        { name: 'manage_roles', description: 'Manage roles and permissions', category: 'System Administration' },
        { name: 'system_settings', description: 'Access system settings', category: 'System Administration' },
        { name: 'view_logs', description: 'View system logs', category: 'System Administration' }
    ];
    try {
        for (const permData of defaultPermissions) {
            const existing = await Permission_1.Permission.findOne({ name: permData.name });
            if (!existing) {
                await Permission_1.Permission.create(permData);
            }
        }
        console.log('Default permissions initialized');
    }
    catch (error) {
        console.error('Error initializing permissions:', error);
    }
};
exports.initializePermissions = initializePermissions;
