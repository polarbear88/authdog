import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post, Query } from '@nestjs/common';
import { CloudfunRuner } from 'src/provide/cloudfun/cloudfun-runer';
import { CreateCloudfunDto, TryRunCloudfunDto, UpdateCloudfunDto } from 'src/provide/cloudfun/cloudfun.dto';
import { CloudfunService } from 'src/provide/cloudfun/cloudfun.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'cloudfun' })
export class CloudfunController extends BaseController {
    constructor(private cloudfunService: CloudfunService) {
        super();
    }

    @WriteDeveloperActionLog('创建云函数')
    @Post('create')
    async create(@Body() createCloudfunDto: CreateCloudfunDto, @TakeDeveloper() developer: any) {
        if (await this.cloudfunService.existByName(developer.id, createCloudfunDto.name)) {
            throw new NotAcceptableException('云函数名称已存在');
        }
        const Cloudfun = await this.cloudfunService.create(createCloudfunDto, developer.id);
        if (!Cloudfun) {
            throw new InternalServerErrorException('创建云函数失败');
        }
        this.setAffected(Cloudfun, Cloudfun.name);
        return Cloudfun._serializationThis();
    }

    @Get('list')
    async list(@TakeDeveloper() developer: any, @Query('word') word: string, @Query('appid') appid: string) {
        if (!appid || isNaN(parseInt(appid))) {
            throw new NotAcceptableException('参数错误');
        }
        return await this.cloudfunService.getList(developer.id, word, parseInt(appid));
    }

    @WriteDeveloperActionLog('删除云函数')
    @Get('delete')
    async delete(@TakeDeveloper() developer: any, @Query('id') id: string) {
        const cfid = parseInt(id);
        if (!cfid || isNaN(cfid)) {
            throw new NotAcceptableException('参数错误');
        }
        const cf = await this.cloudfunService.findByDeveloperIdAndId(developer.id, cfid);
        if (!cf) {
            throw new NotAcceptableException('云函数不存在');
        }
        await this.cloudfunService.delete(developer.id, cfid);
        return this.setAffected({}, cf.name);
    }

    @WriteDeveloperActionLog('更新云函数')
    @Post('update')
    async update(@Body() updateCloudfunDto: UpdateCloudfunDto, @TakeDeveloper() developer: any) {
        let cv = await this.cloudfunService.findByDeveloperIdAndId(developer.id, updateCloudfunDto.id);
        if (!cv) {
            throw new NotAcceptableException('云函数不存在');
        }
        if (cv.name !== updateCloudfunDto.name) {
            if (await this.cloudfunService.existByName(developer.id, updateCloudfunDto.name)) {
                throw new NotAcceptableException('云函数名称已存在');
            }
        }
        cv = await this.cloudfunService.update(updateCloudfunDto, developer.id);
        if (!cv) {
            throw new InternalServerErrorException('更新云函数失败');
        }
        return this.setAffected(cv, cv.name);
    }

    @Get('get-script')
    async getScript(@TakeDeveloper() developer: any, @Query('id') id: string) {
        const cfid = parseInt(id);
        if (!cfid || isNaN(cfid)) {
            throw new NotAcceptableException('参数错误');
        }
        const cf = await this.cloudfunService.findByDeveloperIdAndId(developer.id, cfid);
        if (!cf) {
            throw new NotAcceptableException('云函数不存在');
        }
        return {
            script: cf.script,
        };
    }

    @Post('run')
    async run(@TakeDeveloper() developer: any, @Body() dto: TryRunCloudfunDto) {
        const cf = await this.cloudfunService.findByDeveloperIdAndId(developer.id, dto.id);
        if (!cf) {
            throw new NotAcceptableException('云函数不存在');
        }
        const args = dto.args || [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const result = await new CloudfunRuner({}, cf.script, (balance: number, reason: string) => {}).run(args);
            return {
                result,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
