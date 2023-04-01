import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsInt, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';

export class SalerRolesSetPriceConfigItemDto {
    @IsNotEmpty()
    @IsInt()
    appid: number;

    @IsInt()
    @IsNotEmpty()
    cardTypeId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(99)
    salerProfit: number;
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
