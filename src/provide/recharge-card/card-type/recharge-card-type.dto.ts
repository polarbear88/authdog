import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateRechargeCardTypeDto {
    @IsNotEmpty({ message: '名称不能为空' })
    @IsString({ message: '名称必须是字符串' })
    @Length(1, 32, { message: '名称长度必须在1-32之间' })
    name: string;

    @IsNotEmpty({ message: '是否需要密码不能为空' })
    @IsBoolean({ message: '是否需要密码必须是布尔值' })
    isNeedPassword: boolean;

    @IsOptional()
    @IsString({ message: '卡号前缀是字符串' })
    @Length(0, 128, { message: '卡号前缀长度必须在1-128之间' })
    prefix: string;

    @IsNotEmpty({ message: '时间不能为空' })
    @IsNumber({}, { message: '时间必须是数字' })
    @Max(5256000, { message: '时间最大值为十年' })
    @Min(0, { message: '时间最小值为0分钟' })
    time: number;

    @IsNotEmpty({ message: '次数不能为空' })
    @IsNumber({}, { message: '次数必须是数字' })
    @Max(10000000, { message: '次数最大值为1000万' })
    @Min(0, { message: '次数最小值为0' })
    money: number;

    @IsNotEmpty({ message: '顶级代理价格不能为空' })
    @IsNumber({}, { message: '顶级代理价格必须是数字' })
    @Max(10000000, { message: '顶级代理价格最大值为1000万' })
    @Min(0, { message: '顶级代理价格最小值为0' })
    topSalerPrice: number;
}

export class DeleteRechargeCardTypeDto {
    @IsNotEmpty({ message: 'id不能为空' })
    @IsNumber({}, { message: 'id必须是数字' })
    id: number;
}

export class UpdateRechargeCardTypeDto {
    @IsNotEmpty({ message: 'id不能为空' })
    @IsNumber({}, { message: 'id必须是数字' })
    id: number;

    @IsNotEmpty({ message: '是否需要密码不能为空' })
    @IsBoolean({ message: '是否需要密码必须是布尔值' })
    isNeedPassword: boolean;

    @IsOptional()
    @IsString({ message: '卡号前缀是字符串' })
    @Length(0, 128, { message: '卡号前缀长度必须在1-128之间' })
    prefix: string;

    @IsNotEmpty({ message: '时间不能为空' })
    @IsNumber({}, { message: '时间必须是数字' })
    @Max(5256000, { message: '时间最大值为十年' })
    @Min(0, { message: '时间最小值为0分钟' })
    time: number;

    @IsNotEmpty({ message: '次数不能为空' })
    @IsNumber({}, { message: '次数必须是数字' })
    @Max(10000000, { message: '次数最大值为1000万' })
    @Min(0, { message: '次数最小值为0' })
    money: number;

    @IsNotEmpty({ message: '顶级代理价格不能为空' })
    @IsNumber({}, { message: '顶级代理价格必须是数字' })
    @Max(10000000, { message: '顶级代理价格最大值为1000万' })
    @Min(0, { message: '顶级代理价格最小值为0' })
    topSalerPrice: number;
}
