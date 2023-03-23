import { IsNumber, IsOptional, Max } from 'class-validator';
import { PaginationPage, PaginationPageSize } from '../pagination/pagination.decorator';

export class GetPageDto {
    @PaginationPage()
    @IsNumber()
    @IsOptional()
    page?: number;

    @PaginationPageSize()
    @IsOptional()
    @IsNumber()
    @Max(100)
    pageSize?: number;
}
