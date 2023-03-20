import { IsBoolean, IsIn, IsNumber, IsString, Length } from 'class-validator';
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

export class SetApplicationDownloadUrlDto {
    @IsString({ message: '下载地址必须是字符串' })
    @Length(1, 500, { message: '下载地址长度必须在1-500位之间' })
    downloadUrl: string;
}

export class ResetApplicationCryptoModeDto {
    @IsIn(['none', 'aes', 'rsa', 'ecdh'], { message: '加密模式不正确' })
    cryptoMode: AppCryptoMode;
}

export class SetApplicationIsFreeDto {
    @IsBoolean({ message: '是否免费必须是布尔值' })
    free: boolean;
}

export class SetApplicationtTrialTimeDto {
    @IsNumber({}, { message: '试用时间必须是数字' })
    trialTime: number;
}

export class SetApplicationIsBindDeviceDto {
    @IsBoolean({ message: '是否绑定机器码必须是布尔值' })
    bindDevice: boolean;
}

export class SetApplicationIsAllowUnbindDto {
    @IsBoolean({ message: '是否允许解绑必须是布尔值' })
    allowUnbind: boolean;
}

export class SetApplicationUnbindDeductTimeDto {
    @IsNumber({}, { message: '解绑一次扣时间必须是数字' })
    unbindDeductTime: number;
}

export class SetApplicationUnbindDeductCountDto {
    @IsNumber({}, { message: '解绑一次扣次数必须是数字' })
    unbindDeductCount: number;
}

export class SetApplicationMaxUnbindCountDto {
    @IsNumber({}, { message: '最大解绑次数必须是数字' })
    maxUnbindCount: number;
}

export class SetApplicationAllowMultiDeviceDto {
    @IsBoolean({ message: '是否允许多设备登录是布尔值' })
    allowUnbind: boolean;
}

export class SetApplicationMaxMultiDeviceDto {
    @IsNumber({}, { message: '最大同时登录设备数是数字' })
    maxUnbindCount: number;
}

export class SetApplicationUseCountModeDto {
    @IsBoolean({ message: '是否使用按次收费是布尔值' })
    useCountMode: boolean;
}

export class SetApplicationAllowLoginWhenCountUsedUpDto {
    @IsBoolean({ message: '次数用尽后允许登录是布尔值' })
    allowLoginWhenCountUsedUp: boolean;
}
