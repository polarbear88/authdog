import { Body, Controller, NotAcceptableException, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerService } from 'src/saler/saler/saler.service';
import { TakeSaler } from '../take-saler.decorator';
import { CreateSalerByDevloperDto, FundTransferDto, GetSalerListDto } from 'src/saler/saler/saler.dto';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { Saler } from 'src/saler/saler/saler.entity';
import { ChangeUserPwdByDevDto, SetUserStatusDto } from 'src/user/user/user.dto';
import { SalerStatus } from 'src/saler/saler/saler.type';
import { UpdateQueryBuilder } from 'typeorm';
import { Developer } from 'src/developer/developer.entity';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'subordinate' })
export class SubordinateController extends BaseController {
    constructor(private salerService: SalerService) {
        super();
    }

    @Post('list')
    async list(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: GetSalerListDto) {
        return this.salerService.getList(saler.developerId, dto, saler.id);
    }

    @Post('create')
    async create(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: CreateSalerByDevloperDto) {
        if (await this.salerService.existByName(saler.developerId, dto.name)) {
            throw new NotAcceptableException('该代理名称已存在');
        }
        if (await this.salerService.existByMobile(saler.developerId, dto.mobile)) {
            throw new NotAcceptableException('该代理名称已存在');
        }
        await this.salerService.createBySaler(saler, dto);
        return null;
    }

    @Post('change-password')
    async changePassword(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: ChangeUserPwdByDevDto) {
        await this.salerService.changePassword(saler.developerId, dto, saler.id);
        return null;
    }

    @Post('set-status')
    async setStatus(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: SetUserStatusDto) {
        await this.salerService.setStatusByIds(dto.ids, dto.status as SalerStatus, (query: UpdateQueryBuilder<Saler>) => {
            query.andWhere('developerId = :developerId', { developerId: saler.developerId });
            query.andWhere('parentId = :parentId', { parentId: saler.id });
        });
        return null;
    }

    @Post('fund-transfer')
    async fundTransfer(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: FundTransferDto) {
        const toSaler = await this.salerService.findByIdAndDeveloperId(saler.developerId, dto.id);
        const developer = (await this.salerService.findById(saler.developerId)) as Developer;
        await this.salerService.fundTransfer(developer, saler, toSaler, dto.amount);
        return null;
    }
}
