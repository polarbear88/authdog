import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { JwtExpiresInConfig } from 'src/common/config/jwt-expiresIn.config';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { Role } from 'src/common/enums/role.enum';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { CreateDeveloperDto, LoginDeveloperDto } from '../dto/developer.dto';
import { DeveloperService } from '../developer.service';
import { ManMachineInspect } from 'src/man-machine-inspect/man-machine-inspect.decorator';
import { ManMachineInspectEnum } from 'src/man-machine-inspect/man-machine-inspect.enum';
import { ConfigService } from '@nestjs/config';
// import ivm from 'isolated-vm';

@Public()
@Controller({ version: '1', path: 'auth' })
export class DeveloperController extends BaseController {
    constructor(private developerService: DeveloperService, private jwtService: JwtService, private configService: ConfigService) {
        super();
    }

    // 开发者注册
    @ManMachineInspect(ManMachineInspectEnum.REGISTER)
    @Throttle(20, 3600) // 限制一小时内只能请求20次
    @Post('register')
    async register(@Body() createDeveloperDto: CreateDeveloperDto, @RealIP() ip: string) {
        if (this.configService.get('DISABLE_DEVELOPER_REGISTER') === 'true') {
            throw new NotAcceptableException('不允许注册');
        }
        if (await this.developerService.existsByName(createDeveloperDto.username)) {
            throw new NotAcceptableException('用户名已存在');
        }
        if (await this.developerService.existsByMobile(createDeveloperDto.mobile)) {
            throw new NotAcceptableException('手机号已存在');
        }
        const developer = await this.developerService.createDeveloper(createDeveloperDto, ip);
        if (!developer) {
            throw new InternalServerErrorException('注册失败');
        }
        return null;
    }

    // 开发者登录
    @ManMachineInspect(ManMachineInspectEnum.LOGIN)
    @WriteDeveloperActionLog('登录')
    @Post('login')
    async login(@Body() loginDeveloperDto: LoginDeveloperDto, @Request() req: any) {
        // 验证用户
        const developer = await this.developerService.validateUser(loginDeveloperDto);
        // 生成token
        const payload = { username: developer.name, id: developer.id, roles: [Role.Developer] };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: JwtExpiresInConfig.developer,
        });
        req.user = developer;
        (developer as any).access_token = access_token;
        return developer;
    }

    // @Post('test')
    // async test(@Request() req: any) {
    //     const isolate = new ivm.Isolate({ memoryLimit: 128 });
    //     const context = isolate.createContextSync();
    //     const jail = context.global;
    //     jail.setSync('global', jail.derefInto());
    //     jail.setSync('log', (...args) => {
    //         console.log(req.ip);
    //         console.log(...args);
    //     });
    //     jail.setSync('getPm', (...args) => {
    //         return { a: 'wdw' };
    //     });
    //     console.log(context.evalClosureSync('log($0); log(getPm()); log($1);return {a: "ecec"}', ['wdw', 1]));
    // }
}
