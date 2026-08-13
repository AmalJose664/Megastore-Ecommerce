import mongoose from 'mongoose';
import config from '../config/env';
import { Promo } from '../models/Promo.model';

async function checkPromos() {
    try {
        console.log('Connecting to:', config.mongoUri);
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        const allPromos = await Promo.find({}).sort({ updatedAt: -1 });

        console.log('\n=== ALL PROMOS (Sorted by updatedAt DESC) ===');
        allPromos.forEach((promo, index) => {
            console.log(`\n${index + 1}. [${promo.isActive ? 'ACTIVE' : 'INACTIVE'}] ${promo.title}`);
            console.log(`   ID: ${promo._id}`);
            console.log(`   Code: ${promo.code}`);
            console.log(`   Updated: ${promo.updatedAt.toISOString()}`);
        });

        const activePromos = await Promo.find({ isActive: true }).sort({ updatedAt: -1 });
        console.log(`\n=== ACTIVE PROMOS COUNT: ${activePromos.length} ===`);
        activePromos.forEach((promo, index) => {
            console.log(`   ${index + 1}. ${promo.title} (${promo._id}) - Updated: ${promo.updatedAt.toISOString()}`);
        });

        const findActiveResult = await Promo.findOne({ isActive: true }).sort({ updatedAt: -1 });
        console.log(`\n=== RESULT OF findActive() logic ===`);
        if (findActiveResult) {
            console.log(`   Title: ${findActiveResult.title}`);
            console.log(`   ID: ${findActiveResult._id}`);
        } else {
            console.log(`   No active promo found!`);
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPromos();
