import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { Developer } from '../developer.entity';
import { DeveloperService } from '../developer.service';
import { ParseDeveloperPipe } from '../pipe/parse-developer.pipe';
import { DeveloperChangePasswordDto } from '../dto/developer.dto';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Quota } from 'src/quota/quota.entity';
import { QuotaCardService } from 'src/quota/card/quota-card.service';
import { Throttle } from '@nestjs/throttler';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'profile' })
export class ProfileController extends BaseController {
    constructor(private developerService: DeveloperService, private jwtService: JwtService, private quotaCardService: QuotaCardService) {
        super();
    }

    @Get()
    async getProfile(@TakeDeveloper(ParseDeveloperPipe) developer: Developer) {
        (developer as any).quota = await (this.developerService.getRepo() as Repository<Developer>).manager.getRepository(Quota).findOne({
            where: { name: developer.quota },
        });
        return developer;
    }

    @Post('change-password')
    async changePassword(@TakeDeveloper(ParseDeveloperPipe) developer: Developer, @Body() dto: DeveloperChangePasswordDto) {
        if (!CryptoUtils.validatePassword(dto.oldPassword, developer.salt, developer.password)) {
            throw new NotAcceptableException('旧密码错误');
        }
        await this.developerService.setPassword(developer.id, dto.newPassword);
        return null;
    }

    @Get('sign-jwt-token')
    async signJwtToken(@TakeDeveloper(ParseDeveloperPipe) developer: Developer) {
        const payload = { username: developer.name, id: developer.id, roles: [Role.Developer], isApi: true };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: '3650d',
        });
        (developer as any).access_token = access_token;
        return {
            access_token,
        };
    }

    @Throttle(60, 600)
    @Get('recharge')
    async recharge(@TakeDeveloper(ParseDeveloperPipe) developer: Developer, @Query('card') card: string) {
        await this.quotaCardService.recharge(developer, card);
        return null;
    }
}
