import { Body, Controller, Get, NotAcceptableException, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerService } from 'src/saler/saler/saler.service';
import { TakeSaler } from '../take-saler.decorator';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { Saler } from 'src/saler/saler/saler.entity';
import { SetSubordinatePriceDto } from 'src/saler/saler/saler.dto';
import { DeveloperChangePasswordDto } from 'src/developer/dto/developer.dto';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { SalerNoticeService } from 'src/saler/saler-notice/saler-notice.service';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'profile' })
export class ProfileController extends BaseController {
    constructor(private salerService: SalerService, private salerNoticeService: SalerNoticeService) {
        super();
    }

    @Get()
    async getProfile(@TakeSaler(ParseSalerPipe) saler: Saler) {
        return saler;
    }

    @Post('set-subordinate-price')
    async setSubordinatePrice(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: SetSubordinatePriceDto) {
        await this.salerService.setSubordinatePrice(saler, dto);
        return null;
    }

    @Post('change-password')
    async changePassword(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: DeveloperChangePasswordDto) {
        if (!CryptoUtils.validatePassword(dto.oldPassword, saler.salt, saler.password)) {
            throw new NotAcceptableException('旧密码错误');
        }
        await this.salerService.setPassword(saler.id, dto.newPassword);
        return null;
    }

    @Get('get-notices')
    async getNotices(@TakeSaler(ParseSalerPipe) saler: Saler) {
        return {
            developer: await this.salerNoticeService.getNotice(saler.developerId, 0),
            parent: saler.parentId > 0 ? await this.salerNoticeService.getNotice(saler.developerId, saler.parentId) : '',
        };
    }
}
