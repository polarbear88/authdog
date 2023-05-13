import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class GetOnlineUserListDto extends GetPageDto {
    @IsOptional()
    @IsInt()
    @PaginationWhere('appid = :appid')
    appid?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('userName = :userName')
    userName?: string;
}

export class KickOnlineUserDto {
    @IsNotEmpty({ message: 'id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡d数组不能为空' })
    @ArrayMaxSize(100, { message: 'id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];
}
