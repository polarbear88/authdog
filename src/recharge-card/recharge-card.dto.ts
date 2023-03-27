import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class DeveloperCreateRechargeCardDto {
    @IsNotEmpty({ message: '类型id不能为空' })
    @IsNumber({}, { message: '类型id必须是数字' })
    typeId: number;

    @IsOptional()
    @IsString({ message: '描述必须是字符串' })
    desc: string;

    @IsNotEmpty({ message: '数量不能为空' })
    @IsNumber({}, { message: '数量必须是数字' })
    @Max(1000, { message: '数量不能超过1000' })
    @Min(1, { message: '数量不能小于1' })
    count: number;
}
