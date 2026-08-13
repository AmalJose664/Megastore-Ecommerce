import mongoose from 'mongoose';
import config from '../config/env';
import { User } from '../models';
import { UserRole } from '../types';

const seedAdmin = async () => {
  try {
    console.log('👤 Creating admin user...');

    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: config.admin.email,
      role: UserRole.ADMIN 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Create Admin User
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: config.admin.email,
      password: config.admin.password,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    console.log(`
╔════════════════════════════════════════════╗
║        ✅ Admin User Created!              ║
╠════════════════════════════════════════════╣
║  Name: ${admin.firstName} ${admin.lastName}                   ║
║  Email: ${admin.email}                    ║
║  Role: ${admin.role}                              ║
║  Status: ${admin.isActive ? 'Active' : 'Inactive'}                          ║
║  Email Verified: ${admin.isEmailVerified ? 'Yes' : 'No'}                    ║
╠════════════════════════════════════════════╣
║  Login Credentials:                        ║
║  Email: ${config.admin.email.padEnd(30)} ║
║  Password: ${config.admin.password.padEnd(25)} ║
╚════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();