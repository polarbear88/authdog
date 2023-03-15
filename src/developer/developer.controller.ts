import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BaseController } from 'src/common/controller/base.controller';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { CreateDeveloperDto } from './developer.dto';
import { DeveloperService } from './developer.service';

@Controller({ version: '1', path: 'auth' })
export class DeveloperController extends BaseController {
    constructor(private developerService: DeveloperService) {
        super();
    }

    // 开发者注册
    @Throttle(20, 3600) // 限制一小时内只能请求20次
    @Post('register')
    async register(@Body() createDeveloperDto: CreateDeveloperDto, @RealIP() ip: string) {
        if (await this.developerService.existsByName(createDeveloperDto.name)) {
            throw new NotAcceptableException('用户名已存在');
        }
        if (await this.developerService.existsByMobile(createDeveloperDto.mobile)) {
            throw new NotAcceptableException('手机号已存在');
        }
        const developer = await this.developerService.createDeveloper(createDeveloperDto, ip);
        if (!developer) {
            throw new InternalServerErrorException();
        }
        return this.buildResponse();
    }
}
