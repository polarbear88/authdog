import { IsIn, IsString, Length } from 'class-validator';
import { AppAuthMode, AppCryptoMode, AppStatus } from '../application.type';

export class CreateApplicationDto {
    @IsString({ message: '应用名称必须是字符串' })
    @Length(1, 32, { message: '应用名称长度必须在1-32位之间' })
    name: string;

    @IsString({ message: '应用版本必须是字符串' })
    @Length(1, 32, { message: '应用版本长度必须在1-32位之间' })
    version: string;

    @IsIn(['none', 'aes', 'rsa', 'ecdh'], { message: '加密模式不正确' })
    cryptoMode: AppCryptoMode;

    @IsIn(['deviceid', 'user'], { message: '授权模式不正确' })
    authMode: AppAuthMode;
}

export class SetApplicationNoticeDto {
    @IsString({ message: '应用公告必须是字符串' })
    @Length(1, 500, { message: '应用公告长度必须在1-500位之间' })
    notice: string;
}
