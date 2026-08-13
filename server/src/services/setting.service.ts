import { settingRepository } from '../repositories';
import { ISetting } from '../types';

export class SettingService {
  async getSettings(): Promise<ISetting> {
    return settingRepository.getSettings();
  }

  async updateSettings(data: Partial<ISetting>): Promise<ISetting> {
    return settingRepository.updateSettings(data);
  }
}

export const settingService = new SettingService();
