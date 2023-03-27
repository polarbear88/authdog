import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';
import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class DeviceDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @IsOptional()
    @IsString({ message: '其他信息必须是字符串' })
    otherInfo?: string;
}

export class GetDeviceListDto extends GetPageDto {
    @IsOptional()
    @IsString()
    @PaginationWhere('deviceId like %:deviceId%')
    deviceId?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('otherInfo like %:otherInfo%')
    otherInfo?: string;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance >= :balanceThanOrEq')
    balanceThanOrEq?: number;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance <= :balanceLessOrEq')
    balanceLessOrEq?: number;

    @IsOptional()
    @IsBoolean()
    @PaginationWhere('trialExpiration < NOW()')
    isNotTrial?: boolean;

    @IsOptional()
    @IsBoolean()
    @PaginationWhere('trialExpiration >= NOW()')
    isTrial?: boolean;

    @IsOptional()
    @IsString()
    @PaginationWhere('expirationTime >= :expirationTimeStart')
    expirationTimeStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('expirationTime <= :expirationTimeEnd')
    expirationTimeEnd?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt >= :createdAtStart')
    createdAtStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt <= :createdAtEnd')
    createdAtEnd?: string;
}

export class AddDeviceTimeDto {
    @IsNotEmpty({ message: '设备id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '设备id数组不能为空' })
    @ArrayMaxSize(100, { message: '设备id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '时间不能为空' })
    @IsNumber()
    @Max(5256000, { message: '时间最大值为十年' })
    minutes: number;
}

export class AddDeviceBanlanceDto {
    @IsNotEmpty({ message: '设备id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '设备id数组不能为空' })
    @ArrayMaxSize(100, { message: '设备id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '次数不能为空' })
    @IsNumber()
    money: number;
}

export class SetDeviceStatusDto {
    @IsNotEmpty({ message: '设备id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '设备id数组不能为空' })
    @ArrayMaxSize(100, { message: '设备id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '状态不能为空' })
    @IsString()
    @IsIn(['normal', 'disabled'], { message: '状态只能是normal或disabled' })
    status: string;
}