import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post, Query, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { JwtExpiresInConfig } from 'src/common/config/jwt-expiresIn.config';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Developer } from 'src/developer/developer.entity';
import { DeveloperService } from 'src/developer/developer.service';
import { SalerEntryLinkService } from '../../saler/entry-link/entry-link.service';
import { RegisterSalerDto, SalerLoginDto } from '../../saler/saler.dto';
import { SalerService } from '../../saler/saler.service';
import { ManMachineInspect } from 'src/man-machine-inspect/man-machine-inspect.decorator';
import { ManMachineInspectEnum } from 'src/man-machine-inspect/man-machine-inspect.enum';

@Public()
@Controller({ version: '1', path: 'auth' })
export class SalerController extends BaseController {
    constructor(
        private salerService: SalerService,
        private jwtService: JwtService,
        private developerService: DeveloperService,
        private enteyService: SalerEntryLinkService,
    ) {
        super();
    }

    @Get('verify-entry-token')
    async verifyEnteyToken(@Query('token') token: string) {
        if (!token) {
            throw new NotAcceptableException('token无效');
        }
        const entryToken = await this.enteyService.findByToken(token);
        if (!entryToken) {
            throw new NotAcceptableException('token无效');
        }
        return { type: entryToken.type };
    }

    // 代理注册
    @ManMachineInspect(ManMachineInspectEnum.REGISTER)
    @Throttle(20, 3600) // 限制一小时内只能请求20次
    @Post('register')
    async register(@Body() dto: RegisterSalerDto, @RealIP() ip: string) {
        const entryLink = await this.enteyService.findByToken(dto.token);
        if (!entryLink || entryLink.type !== 'register') {
            throw new NotAcceptableException('入口链接不存在');
        }
        const developer = (await this.developerService.findById(entryLink.developerId)) as Developer;
        if (!developer || developer.status !== 'normal') {
            throw new NotAcceptableException('开发者不存在或被禁止');
        }
        if (await this.salerService.existByName(developer.id, dto.name)) {
            throw new NotAcceptableException('用户名已存在');
        }
        if (await this.salerService.existByMobile(developer.id, dto.mobile)) {
            throw new NotAcceptableException('手机号已存在');
        }
        const saler = await this.salerService.create(entryLink, dto, ip);
        if (!saler) {
            throw new InternalServerErrorException('注册失败');
        }
        return null;
    }

    // 代理登录
    @ManMachineInspect(ManMachineInspectEnum.LOGIN)
    @Post('login')
    async login(@Body() dto: SalerLoginDto, @Request() req: any) {
        const entryLink = await this.enteyService.findByToken(dto.token);
        if (!entryLink) {
            throw new NotAcceptableException('入口链接不存在');
        }
        const developer = (await this.developerService.findById(entryLink.developerId)) as Developer;
        if (!developer || developer.status !== 'normal') {
            throw new NotAcceptableException('开发者不存在或被禁止');
        }
        // 验证用户
        const saler = await this.salerService.validateSaler(developer, dto);
        // 生成token
        const payload = { username: saler.name, id: saler.id, developerId: developer.id, parentId: saler.parentId, roles: [Role.Saler] };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: JwtExpiresInConfig.saler,
        });
        req.user = saler;
        (saler as any).access_token = access_token;
        return saler;
    }
}
