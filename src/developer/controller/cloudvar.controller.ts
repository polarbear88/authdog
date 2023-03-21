import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post, Query } from '@nestjs/common';
import { CreateCloudvarDto, UpdateCloudvarDto } from 'src/cloudvar/cloudvar.dto';
import { CloudvarService } from 'src/cloudvar/cloudvar.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'cloudvar' })
export class CloudvarController extends BaseController {
    constructor(private cloudvarService: CloudvarService) {
        super();
    }

    @WriteDeveloperActionLog('创建云变量')
    @Post('create')
    async create(@Body() createCloudvarDto: CreateCloudvarDto, @TakeDeveloper() developer: any) {
        if (await this.cloudvarService.existByName(developer.id, createCloudvarDto.name)) {
            throw new NotAcceptableException('云变量名称已存在');
        }
        const cloudvar = await this.cloudvarService.create(createCloudvarDto, developer.id);
        if (!cloudvar) {
            throw new InternalServerErrorException('创建云变量失败');
        }
        this.setAffected(cloudvar, cloudvar.name);
        return cloudvar;
    }

    @Get('list')
    async list(@TakeDeveloper() developer: any, @Query('word') word: string, @Query('appid') appid: string) {
        return await this.cloudvarService.getList(developer.id, word, parseInt(appid));
    }

    @WriteDeveloperActionLog('删除云变量')
    @Get('delete')
    async delete(@TakeDeveloper() developer: any, @Query('id') id: string) {
        const cvid = parseInt(id);
        if (!cvid || isNaN(cvid)) {
            throw new NotAcceptableException('参数错误');
        }
        const cv = await this.cloudvarService.findByDeveloperIdAndId(developer.id, cvid);
        if (!cv) {
            throw new NotAcceptableException('云变量不存在');
        }
        await this.cloudvarService.delete(developer.id, cvid);
        return this.setAffected({}, cv.name);
    }

    @WriteDeveloperActionLog('更新云变量')
    @Post('update')
    async update(@Body() updateCloudvarDto: UpdateCloudvarDto, @TakeDeveloper() developer: any) {
        let cv = await this.cloudvarService.findByDeveloperIdAndId(developer.id, updateCloudvarDto.id);
        if (!cv) {
            throw new NotAcceptableException('云变量不存在');
        }
        if (cv.name !== updateCloudvarDto.name) {
            if (await this.cloudvarService.existByName(developer.id, updateCloudvarDto.name)) {
                throw new NotAcceptableException('云变量名称已存在');
            }
        }
        cv = await this.cloudvarService.update(developer.id, updateCloudvarDto);
        if (!cv) {
            throw new InternalServerErrorException('更新云变量失败');
        }
        return this.setAffected(cv, cv.name);
    }
}
