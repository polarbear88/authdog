import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PaginationPage, PaginationPageSize } from '../pagination/pagination.decorator';

export class GetPageDto {
    @PaginationPage()
    @IsNumber()
    @IsOptional()
    @Min(1)
    page?: number;

    @PaginationPageSize()
    @IsOptional()
    @IsNumber()
    @Max(100)
    @Min(1)
    pageSize?: number;
}
