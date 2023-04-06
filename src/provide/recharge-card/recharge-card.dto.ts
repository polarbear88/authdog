import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';

export class DeveloperCreateRechargeCardDto {
    @IsNotEmpty({ message: '类型id不能为空' })
    @IsNumber({}, { message: '类型id必须是数字' })
    typeId: number;

    @IsOptional()
    @IsString({ message: '描述必须是字符串' })
    description: string;

    @IsNotEmpty({ message: '数量不能为空' })
    @IsNumber({}, { message: '数量必须是数字' })
    @Max(1000, { message: '数量不能超过1000' })
    @Min(1, { message: '数量不能小于1' })
    count: number;
}

export class GetRechargeCardListDto extends GetPageDto {
    @IsOptional()
    @IsNumber()
    @PaginationWhere('cardTypeId = :cardTypeId')
    cardTypeId?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('card = :card')
    card?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('description = :description')
    description?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('creatorName = :creatorName')
    creatorName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('useTime >= :useTimeStart')
    useTimeStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('useTime <= :useTimeEnd')
    useTimeEnd?: string;

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

    @IsOptional()
    @IsInt()
    @PaginationWhere('appid = :appid')
    appid: number;
}

export class RechargeCardSetStatusDto {
    @IsNotEmpty({ message: '卡id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡id数组不能为空' })
    @ArrayMaxSize(100, { message: '卡id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '状态不能为空' })
    @IsString({ message: '状态必须是字符串' })
    @IsIn(['frozen', 'unused'], { message: '状态只能是frozen或unused' })
    status: string;
}

export class RechargeCardReBuildDto {
    @IsNotEmpty({ message: '卡id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡id数组不能为空' })
    @ArrayMaxSize(100, { message: '卡id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];
}

export class RechargeCardDeleteDto {
    @IsNotEmpty({ message: '卡id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡id数组不能为空' })
    @ArrayMaxSize(100, { message: '卡id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];
}

export class RechargeCardExportDto {
    @IsNotEmpty({ message: '卡id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡id数组不能为空' })
    @ArrayMaxSize(100, { message: '卡id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];
}

export class ExportRechargeCardListDto {
    @IsOptional()
    @IsNumber()
    @PaginationWhere('cardTypeId = :cardTypeId')
    cardTypeId?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('card = :card')
    card?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('description = :description')
    description?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('creatorName = :creatorName')
    creatorName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('useTime >= :useTimeStart')
    useTimeStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('useTime <= :useTimeEnd')
    useTimeEnd?: string;

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

    @IsOptional()
    @IsInt()
    @PaginationWhere('appid = :appid')
    appid: number;
}

export class RechargeCardSetStatusByCardsDto {
    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];

    @IsNotEmpty({ message: '状态不能为空' })
    @IsString({ message: '状态必须是字符串' })
    @IsIn(['frozen', 'unused'], { message: '状态只能是frozen或unused' })
    status: string;
}

export class RechargeCardSetStatusByCardsSalerDto {
    @IsNotEmpty({ message: '应用id不能为空' })
    @IsNumber({}, { message: '应用id必须是数字' })
    appid: number;

    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];

    @IsNotEmpty({ message: '状态不能为空' })
    @IsString({ message: '状态必须是字符串' })
    @IsIn(['frozen', 'unused'], { message: '状态只能是frozen或unused' })
    status: string;
}

export class RechargeCardReBuildByCardsDto {
    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];

    @IsNotEmpty({ message: '描述不能为空' })
    @IsString({ message: '描述必须是字符串' })
    @MaxLength(100, { message: '描述最多100个字符' })
    description: string;
}

export class RechargeCardReBuildByCardsSalerDto {
    @IsNotEmpty({ message: '应用id不能为空' })
    @IsNumber({}, { message: '应用id必须是数字' })
    appid: number;

    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];

    @IsNotEmpty({ message: '描述不能为空' })
    @IsString({ message: '描述必须是字符串' })
    @MaxLength(100, { message: '描述最多100个字符' })
    description: string;
}

export class RechargeCardQueryByCardsSalerDto {
    @IsNotEmpty({ message: '应用id不能为空' })
    @IsNumber({}, { message: '应用id必须是数字' })
    appid: number;

    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];
}

export class RechargeCardDeleteByCardsDto {
    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];
}

export class RechargeCardQueryByCardsDto {
    @IsNotEmpty({ message: '卡数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '卡数组不能为空' })
    @ArrayMaxSize(200, { message: '卡数组最多200个' })
    @IsString({ each: true })
    cards: string[];
}

export class SalerCreateRechargeCardDto {
    @IsNotEmpty({ message: '应用id不能为空' })
    @IsNumber({}, { message: '应用id必须是数字' })
    appid: number;

    @IsNotEmpty({ message: '类型id不能为空' })
    @IsNumber({}, { message: '类型id必须是数字' })
    typeId: number;

    @IsOptional()
    @IsString({ message: '描述必须是字符串' })
    description: string;

    @IsNotEmpty({ message: '数量不能为空' })
    @IsNumber({}, { message: '数量必须是数字' })
    @Max(1000, { message: '数量不能超过1000' })
    @Min(1, { message: '数量不能小于1' })
    count: number;
}
