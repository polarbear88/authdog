import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class UserFinancialGetListDto extends GetPageDto {
    @IsOptional()
    @IsIn(['deviceid', 'user'])
    @PaginationWhere('userType = :userType')
    userType: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('name = :name')
    name: string;

    @IsOptional()
    @IsIn(['time', 'balance'])
    @PaginationWhere('type = :type')
    type: string;

    @IsOptional()
    @IsInt()
    @PaginationWhere('appid = :appid')
    appid: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('direction = :direction')
    direction: string;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('value >= :valueThanOrEq')
    valueThanOrEq?: number;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('value <= :valueLessOrEq')
    valueLessOrEq?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('reason = :reason')
    reason: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt >= :createdAtStart')
    createdAtStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt <= :createdAtEnd')
    createdAtEnd?: string;
}
