import mongoose from 'mongoose';
import config from '../config/env';
import { promoService } from '../services/promo.service';
import { Promo } from '../models/Promo.model';

async function testActivation() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        const promos = await Promo.find({});
        if (promos.length < 2) {
            console.log('Need at least 2 promos to test. Found:', promos.length);
            await mongoose.disconnect();
            return;
        }

        const promo1 = promos[0];
        const promo2 = promos[1];

        console.log(`\n--- Testing Activation of ${promo1.title} (${promo1._id}) ---`);
        await promoService.activatePromo(promo1._id.toString());

        let active = await Promo.find({ isActive: true });
        console.log(`Currently active: ${active.map(p => p.title).join(', ')}`);

        console.log(`\n--- Testing Activation of ${promo2.title} (${promo2._id}) ---`);
        await promoService.activatePromo(promo2._id.toString());

        active = await Promo.find({ isActive: true });
        console.log(`Currently active: ${active.map(p => p.title).join(', ')}`);

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testActivation();
