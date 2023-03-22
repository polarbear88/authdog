import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { ApiAppStatusCheckGuard } from './api-app-status-check.guard';
import { ApiEncryptInterceptor } from './api-encrypt.interceptor';
import { ApiUserDeviceInterceptor } from './api-user-device.interceptor';

@Controller()
@UseGuards(ApiAppStatusCheckGuard)
@UseInterceptors(ApiUserDeviceInterceptor, ApiEncryptInterceptor)
export class ApiBaseController extends BaseController {}
