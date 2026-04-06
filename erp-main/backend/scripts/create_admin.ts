import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../src/models/User';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'admin@example.com';
        const password = 'password123';

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists. Updating role...');
            user.role = UserRole.ADMIN;
            // user.roles = []; // Clear RBAC roles if any to rely on check bypass
        } else {
            console.log('Creating new admin user...');
            user = new User({
                name: 'Admin User',
                email,
                password,
                role: UserRole.ADMIN,
                status: 'active'
            });
        }

        await user.save();
        console.log(`User ${email} saved with role ${user.role}`);
        console.log(`Password: ${password}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
