import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class CreateUserDataDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    value: string;

    @IsOptional()
    @IsString()
    uniqueValue: string;
}

export class UpdateUserDataDto extends CreateUserDataDto {
    @IsNotEmpty()
    @IsInt()
    dataId: number;
}

export class UserDataFindByUniqueValueDto {
    @IsNotEmpty()
    @IsString()
    uniqueValue: string;
}

export class UserDataFindByNameDto extends GetPageDto {
    @IsNotEmpty()
    @IsString()
    dataName: string;
}

export class UserDataDeleteByIdsDto {
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    @ArrayMaxSize(100)
    @ArrayMinSize(1)
    ids: number[];
}

export class GetUserDataListByDeveloperDto extends GetPageDto {
    @IsOptional()
    @IsInt()
    @PaginationWhere('appid = :appid')
    appid: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('userName = :userName')
    userName: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('name = :name')
    name: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('uniqueValue = :uniqueValue')
    uniqueValue: string;
}
