import { Controller, UseGuards } from '@nestjs/common';
import { ApiBaseController } from 'src/api/api-base.controller';
import { ApiAppTypeUserGuard } from '../api-app-type-user.guard';

@UseGuards(ApiAppTypeUserGuard)
@Controller()
export class ApiUserBaseController extends ApiBaseController {}
