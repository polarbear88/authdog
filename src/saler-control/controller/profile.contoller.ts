import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerService } from 'src/saler/saler.service';
import { TakeSaler } from '../take-saler.decorator';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { Saler } from 'src/saler/saler.entity';
import { SetSubordinatePriceDto } from 'src/saler/saler.dto';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'profile' })
export class ProfileController extends BaseController {
    constructor(private salerService: SalerService) {
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
}
