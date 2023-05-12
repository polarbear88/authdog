import { IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class GetRechargeRecordListDto extends GetPageDto {
    @IsOptional()
    @IsNumber()
    @PaginationWhere('appid = :appid')
    appid?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('cardTypeName = :cardTypeName')
    cardTypeName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('cardNumber = :cardNumber')
    cardNumber?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('salerName = :salerName')
    salerName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('userName = :userName')
    userName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt >= :createdAtStart')
    createdAtStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt <= :createdAtEnd')
    createdAtEnd?: string;
}
