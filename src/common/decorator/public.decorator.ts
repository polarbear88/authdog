import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// 设置允许公开访问 绕过jwth和角色授权
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
