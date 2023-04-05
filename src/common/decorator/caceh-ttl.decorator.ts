import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cache_ttl';
// 设置允许公开访问 绕过jwth和角色授权
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl);
