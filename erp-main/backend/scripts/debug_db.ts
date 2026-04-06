import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Role: '${u.role}'`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
