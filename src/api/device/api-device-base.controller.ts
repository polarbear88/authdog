import { Controller, UseGuards } from '@nestjs/common';
import { ApiBaseController } from 'src/api/api-base.controller';
import { ApiDeviceGuard } from './api-device.guard';

@UseGuards(ApiDeviceGuard)
@Controller()
export class ApiDeviceBaseController extends ApiBaseController {}
