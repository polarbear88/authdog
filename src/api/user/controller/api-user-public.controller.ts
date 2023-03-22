import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTakeApp } from 'src/api/decorator/api-take-app.decorator';
import { Application } from 'src/application/application.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { StringUtils } from 'src/common/utils/string.utils';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { ApiUserBaseController } from './api-user-base.controller';

@Public()
@Controller({ version: '1', path: 'public' })
export class ApiUserPublicController extends ApiUserBaseController {
    constructor(private userService: UserService) {
        super();
    }

    @Throttle(20, 3600)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto, @RealIP() ip: string, @ApiTakeApp() app: Application) {
        if (await this.userService.existsByName(app.id, createUserDto.name)) {
            throw new NotAcceptableException('用户名已存在');
        }
        if (!StringUtils.isEmpty(createUserDto.mobile) && (await this.userService.existsByMobile(app.id, createUserDto.mobile))) {
            // 由于mobile可由开发者自行保存任何联系方式内容，所以这里提示联系方式已存在
            throw new NotAcceptableException('联系方式已存在');
        }
        const user = await this.userService.create(createUserDto, app, ip);
        if (!user) {
            throw new InternalServerErrorException('注册失败');
        }
        return user;
    }
}
