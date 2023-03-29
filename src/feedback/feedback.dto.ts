import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';
import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class CreateFeedbackDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @IsNotEmpty({ message: '用户名不能为空' })
    @IsString({ message: '用户名必须是字符串' })
    @MaxLength(50, { message: '用户名长度不能超过50' })
    userName: string;

    @IsNotEmpty({ message: '内容不能为空' })
    @IsString()
    @MaxLength(1000, { message: '内容长度不能超过1000' })
    content: string;
}

export class GetFeedbackListDto extends GetPageDto {
    @IsOptional()
    @IsNumber()
    @PaginationWhere('appid = :appid')
    appid?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('appVersion = :appVersion')
    appVersion?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('userName = :userName')
    userName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;
}

export class SetFeedbackStatusDto {
    @IsNotEmpty({ message: 'id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: 'id数组不能为空' })
    @ArrayMaxSize(100, { message: 'id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '状态不能为空' })
    @IsString()
    @IsIn(['resolved', 'rejected'], { message: '状态只能是resolved或rejected' })
    status: string;
}
