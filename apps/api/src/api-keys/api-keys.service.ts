import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async generateKey(name: string, userId: string): Promise<{ id: string; name: string; key: string; createdAt: Date }> {
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = this.apiKeyRepo.create({
      name,
      userId,
      keyHash,
      isActive: true,
    });

    const saved = (await this.apiKeyRepo.save(apiKey)) as unknown as ApiKey;

    return {
      id: saved.id,
      name: saved.name,
      key,
      createdAt: saved.createdAt,
    };
  }

  async findAll(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string, userId: string): Promise<void> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id, userId } });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    apiKey.isActive = false;
    await this.apiKeyRepo.save(apiKey);
  }

  async validateKey(key: string): Promise<{ userId: string; apiKeyId: string } | null> {
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await this.apiKeyRepo.findOne({ where: { keyHash } });

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepo.save(apiKey);

    return { userId: apiKey.userId, apiKeyId: apiKey.id };
  }
}
