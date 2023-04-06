import { Body, Controller, NotAcceptableException, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { ApiUserOrDevicePaidGuard } from '../api-user-or-device-paid.guard';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { BaseController } from 'src/common/controller/base.controller';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';
import {
    CreateUserDataDto,
    UpdateUserDataDto,
    UserDataDeleteByIdsDto,
    UserDataFindByNameDto,
    UserDataFindByUniqueValueDto,
} from 'src/provide/user-data/user-data.dto';
import { ApiTakeUser } from '../decorator/api-take-user.decorator';
import { User } from 'src/user/user/user.entity';
import { Device } from 'src/user/device/device.entity';
import { UserDataService } from 'src/provide/user-data/user-data.service';
import { Application } from 'src/provide/application/application.entity';
import { GetPageDto } from 'src/common/dto/get-page.dto';

@Public()
@UseGuards(ApiUserOrDevicePaidGuard)
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiUserDataController extends BaseController {
    constructor(private userDataService: UserDataService) {
        super();
    }

    @Post('create')
    async create(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: CreateUserDataDto) {
        if (dto.uniqueValue) {
            if (await this.userDataService.findByUserIdAndUniqueValue(app.id, user.id, dto.uniqueValue)) {
                throw new NotAcceptableException('uniqueValue已存在');
            }
        }
        const data = await this.userDataService.create(dto, app, user.id, app.authMode === 'user' ? (user as User).name : (user as Device).deviceId);
        return data.serialization_user();
    }

    @Post('getByUniqueValue')
    async getByUniqueValue(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: UserDataFindByUniqueValueDto) {
        const data = await this.userDataService.findByUserIdAndUniqueValue(app.id, user.id, dto.uniqueValue);
        if (!data) {
            throw new NotAcceptableException('数据不存在');
        }
        return data.serialization_user();
    }

    @Post('getListByName')
    async getListByName(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: UserDataFindByNameDto) {
        const data = await this.userDataService.findByUserIdAndName(app.id, user.id, dto.dataName, dto);
        return data.map((item) => item.serialization_user());
    }

    @Post('getList')
    async getList(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: GetPageDto) {
        const data = await this.userDataService.findByUserId(app.id, user.id, dto);
        return data.map((item) => item.serialization_user());
    }

    @Post('delete')
    async delete(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: UserDataDeleteByIdsDto) {
        await this.userDataService.deleteByUserIdAndId(app.id, user.id, dto.ids);
        return null;
    }

    @Post('update')
    async update(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: UpdateUserDataDto) {
        const data = await this.userDataService.findByUserIdAndId(app.id, user.id, dto.dataId);
        if (!data) {
            throw new NotAcceptableException('数据不存在');
        }
        if (dto.uniqueValue && dto.uniqueValue !== data.uniqueValue) {
            if (await this.userDataService.findByUserIdAndUniqueValue(app.id, user.id, dto.uniqueValue)) {
                throw new NotAcceptableException('uniqueValue已存在');
            }
        }
        const newData = await this.userDataService.updateByUserIdAndId(app.id, user.id, dto.dataId, dto);
        if (!newData) {
            throw new NotAcceptableException('数据不存在');
        }
        return newData.serialization_user();
    }
}
