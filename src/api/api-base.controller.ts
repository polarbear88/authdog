import { Controller, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { ApiAppStatusCheckGuard } from './api-app-status-check.guard';
import { ApiUserDeviceInterceptor } from './api-user-device.interceptor';

@Controller()
@UseGuards(ApiAppStatusCheckGuard)
@UseInterceptors(ApiUserDeviceInterceptor)
export class ApiBaseController extends BaseController {}
