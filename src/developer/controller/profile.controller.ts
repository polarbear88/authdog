import { Body, Controller, Get, NotAcceptableException, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { Developer } from '../developer.entity';
import { DeveloperService } from '../developer.service';
import { ParseDeveloperPipe } from '../pipe/parse-developer.pipe';
import { DeveloperChangePasswordDto } from '../dto/developer.dto';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'profile' })
export class ProfileController extends BaseController {
    constructor(private developerService: DeveloperService) {
        super();
    }

    @Get()
    async getProfile(@TakeDeveloper(ParseDeveloperPipe) developer: Developer) {
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
}
