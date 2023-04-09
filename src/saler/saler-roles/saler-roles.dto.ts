import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';

export class SalerRolesSetPriceConfigItemDto {
    @IsNotEmpty()
    @IsInt()
    appid: number;

    @IsInt()
    @IsNotEmpty()
    cardTypeId: number;

    @IsNotEmpty({ message: '顶级代理价格不能为空' })
    @IsNumber({}, { message: '顶级代理价格必须是数字' })
    @Max(10000000, { message: '顶级代理价格最大值为1000万' })
    @Min(0, { message: '顶级代理价格最小值为0' })
    topSalerPrice: number;
}

export class SalerRolesSetPriceConfigDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ValidateNested({ each: true })
    @Type(() => SalerRolesSetPriceConfigItemDto)
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    priceConfig: SalerRolesSetPriceConfigItemDto[];
}
