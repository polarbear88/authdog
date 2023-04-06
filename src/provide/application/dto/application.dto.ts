import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { AppAuthMode, AppCryptoMode, AppStatus } from '../application.type';

export class CreateApplicationDto {
    @IsNotEmpty({ message: '应用名称不能为空' })
    @IsString({ message: '应用名称必须是字符串' })
    @Length(1, 32, { message: '应用名称长度必须在1-32位之间' })
    name: string;

    @IsNotEmpty({ message: '应用版本不能为空' })
    @IsString({ message: '应用版本必须是字符串' })
    @Length(1, 32, { message: '应用版本长度必须在1-32位之间' })
    version: string;

    @IsIn(['none', 'aes', 'rsa', 'ecdh', 'samenc'], { message: '加密模式不正确' })
    cryptoMode: AppCryptoMode;

    @IsIn(['deviceid', 'user'], { message: '授权模式不正确' })
    authMode: AppAuthMode;
}

export class SetApplicationNoticeDto {
    @IsNotEmpty({ message: '应用公告不能为空' })
    @IsString({ message: '应用公告必须是字符串' })
    @Length(1, 500, { message: '应用公告长度必须在1-500位之间' })
    notice: string;
}

export class SetApplicationDownloadUrlDto {
    @IsNotEmpty({ message: '下载地址不能为空' })
    @IsString({ message: '下载地址必须是字符串' })
    @Length(1, 500, { message: '下载地址长度必须在1-500位之间' })
    downloadUrl: string;
}

export class ResetApplicationCryptoModeDto {
    @IsIn(['none', 'aes', 'rsa', 'ecdh', 'samenc'], { message: '加密模式不正确' })
    cryptoMode: AppCryptoMode;
}

export class SetApplicationIsFreeDto {
    @IsNotEmpty({ message: '是否免费不能为空' })
    @IsBoolean({ message: '是否免费必须是布尔值' })
    free: boolean;
}

export class SetApplicationtTrialTimeDto {
    @IsNotEmpty({ message: '试用时间不能为空' })
    @IsNumber({}, { message: '试用时间必须是数字' })
    trialTime: number;
}

export class SetApplicationIsBindDeviceDto {
    @IsNotEmpty({ message: '是否绑定机器码不能为空' })
    @IsBoolean({ message: '是否绑定机器码必须是布尔值' })
    bindDevice: boolean;
}

export class SetApplicationIsAllowUnbindDto {
    @IsNotEmpty({ message: '是否允许解绑不能为空' })
    @IsBoolean({ message: '是否允许解绑必须是布尔值' })
    allowUnbind: boolean;
}

export class SetApplicationUnbindDeductTimeDto {
    @IsNotEmpty({ message: '解绑一次扣时间不能为空' })
    @IsNumber({}, { message: '解绑一次扣时间必须是数字' })
    unbindDeductTime: number;
}

export class SetApplicationUnbindDeductCountDto {
    @IsNotEmpty({ message: '解绑一次扣次数不能为空' })
    @IsNumber({}, { message: '解绑一次扣次数必须是数字' })
    unbindDeductCount: number;
}

export class SetApplicationMaxUnbindCountDto {
    @IsNotEmpty({ message: '最大解绑次数不能为空' })
    @IsNumber({}, { message: '最大解绑次数必须是数字' })
    maxUnbindCount: number;
}

export class SetApplicationAllowMultiDeviceDto {
    @IsNotEmpty({ message: '是否允许多设备登录不能为空' })
    @IsBoolean({ message: '是否允许多设备登录是布尔值' })
    allowUnbind: boolean;
}

export class SetApplicationMaxMultiDeviceDto {
    @IsNotEmpty({ message: '最大同时登录设备数不能为空' })
    @IsNumber({}, { message: '最大同时登录设备数是数字' })
    @Max(10, { message: '最大同时登录设备数不能超过10' })
    @Min(0, { message: '最大同时登录设备数不能小于0' })
    maxUnbindCount: number;
}

export class SetApplicationUseCountModeDto {
    @IsNotEmpty({ message: '是否使用按次收费不能为空' })
    @IsBoolean({ message: '是否使用按次收费是布尔值' })
    useCountMode: boolean;
}

export class SetApplicationAllowLoginWhenCountUsedUpDto {
    @IsNotEmpty({ message: '次数用尽后允许登录不能为空' })
    @IsBoolean({ message: '次数用尽后允许登录是布尔值' })
    allowLoginWhenCountUsedUp: boolean;
}

export class SetApplicationtTrialCountDto {
    @IsNotEmpty({ message: '试用次数不能为空' })
    @IsNumber({}, { message: '试用次数必须是数字' })
    trialCount: number;
}

export class SetApplicationAllowForceLoginDto {
    @IsNotEmpty({ message: '是否允许强制登录不能为空' })
    @IsBoolean({ message: '是否允许强制登录是布尔值' })
    allowForceLogin: boolean;
}

export class SetApplicationVersionDto {
    @IsNotEmpty({ message: '应用版本不能为空' })
    @IsString({ message: '应用版本必须是字符串' })
    @Length(1, 50, { message: '应用版本长度必须在1-50位之间' })
    version: string;
}
