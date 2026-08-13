import { BaseRepository } from './base.repository';
import { Hero } from '../models';
import { IHero } from '../types';

export class HeroRepository extends BaseRepository<IHero> {
    constructor() {
        super(Hero);
    }

    async findActive(): Promise<IHero | null> {
        return this.model.findOne({ isActive: true }).exec();
    }
}

export const heroRepository = new HeroRepository();
