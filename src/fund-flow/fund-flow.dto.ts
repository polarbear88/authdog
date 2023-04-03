import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class FundFlowGetListDto extends GetPageDto {
    @IsOptional()
    @IsIn(['developer', 'saler'])
    @PaginationWhere('roleType = :roleType')
    roleType: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('salerName = :salerName')
    salerName: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('direction = :direction')
    direction: string;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('amount >= :amountThanOrEq')
    amountThanOrEq?: number;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('amount <= :amountLessOrEq')
    amountLessOrEq?: number;

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
