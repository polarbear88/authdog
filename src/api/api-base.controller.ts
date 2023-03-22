import { Controller, UseInterceptors } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { ApiEncryptInterceptor } from './api-encrypt.interceptor';

@Controller()
@UseInterceptors(ApiEncryptInterceptor)
export class ApiBaseController extends BaseController {}
