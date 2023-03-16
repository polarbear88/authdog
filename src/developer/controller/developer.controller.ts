import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { JwtExpiresInConfig } from 'src/common/config/jwt-expiresIn.config';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateDeveloperDto, LoginDeveloperDto } from '../developer.dto';
import { DeveloperService } from '../developer.service';

@Public()
@Controller({ version: '1', path: 'auth' })
export class DeveloperController extends BaseController {
    constructor(private developerService: DeveloperService, private jwtService: JwtService) {
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
        return null;
    }

    // 开发者登录
    @Post('login')
    async login(@Body() loginDeveloperDto: LoginDeveloperDto) {
        // 验证用户
        const developer = await this.developerService.validateUser(loginDeveloperDto);
        if (!developer) {
            throw new NotAcceptableException('用户名或密码错误');
        }
        // 生成token
        const payload = { name: developer.name, id: developer.id, roles: [Role.Developer] };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: JwtExpiresInConfig.developer,
        });
        return { access_token };
    }
}
