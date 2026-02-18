import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) { }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async findMany(
    filter: FilterQuery<T> = {},
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model.find(filter, null, options);
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<any> {
    return this.model.updateMany(filter, update);
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter);
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1);
    return count > 0;
  }
}