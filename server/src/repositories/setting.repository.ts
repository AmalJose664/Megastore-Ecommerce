import { BaseRepository } from './base.repository';
import { Setting } from '../models';
import { ISetting } from '../types';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super(Setting);
  }

  async getSettings(): Promise<ISetting> {
    let setting = await this.model.findOne().exec();
    if (!setting) {
      setting = await this.model.create({});
    }
    return setting;
  }

  async updateSettings(data: Partial<ISetting>): Promise<ISetting> {
    const setting = await this.getSettings();
    Object.assign(setting, data);
    return setting.save();
  }
}

export const settingRepository = new SettingRepository();
