import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { BaseService } from 'src/common/service/base.service';
import { Like, Repository } from 'typeorm';
import { CreateCloudfunDto, UpdateCloudfunDto } from './cloudfun.dto';
import { Cloudfun } from './cloudfun.entity';

@Injectable()
export class CloudfunService extends BaseService {
    constructor(
        @InjectRepository(Cloudfun)
        private repo: Repository<Cloudfun>,
        private applicationService: ApplicationService,
    ) {
        super(repo);
    }

    async create(cloudfun: CreateCloudfunDto, developerId: number): Promise<Cloudfun> {
        const cf = new Cloudfun();
        cf.name = cloudfun.name;
        if (cloudfun.description) {
            cf.description = cloudfun.description + '';
        }
        cf.script = cloudfun.script;
        cf.isGlobal = cloudfun.isGlobal;
        if (cloudfun.applicationId && !cloudfun.isGlobal) {
            const app = (await this.applicationService.findById(cloudfun.applicationId)) as Application;
            if (!app || app.developerId !== developerId) {
                throw new NotAcceptableException('应用不存在');
            }
            cf.applicationId = parseInt(cloudfun.applicationId + '');
            cf.applicationName = app.name;
        }
        cf.developerId = developerId;
        return await this.repo.save(cf);
    }

    async getList(developerId: number, word?: string, appid?: number): Promise<Cloudfun[]> {
        const where = {
            developerId,
        };
        if (word) {
            where['name'] = Like(`%${word}%`);
        }
        if (appid) {
            where['applicationId'] = appid;
        }
        return await this.repo.find({
            select: ['id', 'name', 'description', 'isGlobal', 'applicationId', 'applicationName'],
            where,
            order: {
                id: 'DESC',
            },
        });
    }

    async delete(developerId: number, id: number): Promise<void> {
        await this.repo.delete({
            developerId,
            id,
        });
    }

    async findByName(developerId: number, name: string): Promise<Cloudfun> {
        return await this.repo.findOne({
            where: {
                developerId,
                name,
            },
        });
    }

    async findByDeveloperIdAndId(developerId: number, id: number): Promise<Cloudfun> {
        return await this.repo.findOne({
            where: {
                developerId,
                id,
            },
        });
    }

    async existByName(developerId: number, name: string): Promise<boolean> {
        return await this.repo.exist({
            where: {
                developerId,
                name,
            },
        });
    }

    async update(cloudfun: UpdateCloudfunDto, developerId: number): Promise<Cloudfun> {
        const cf = await this.repo.findOne({
            where: {
                developerId,
                id: cloudfun.id,
            },
        });
        if (!cf) {
            throw new NotAcceptableException('函数不存在');
        }
        cf.name = cloudfun.name;
        if (cloudfun.description) {
            cf.description = cloudfun.description + '';
        }
        cf.script = cloudfun.script;
        cf.isGlobal = cloudfun.isGlobal;
        if (cloudfun.applicationId && !cloudfun.isGlobal) {
            const app = (await this.applicationService.findById(cloudfun.applicationId)) as Application;
            if (!app || app.developerId !== developerId) {
                throw new NotAcceptableException('应用不存在');
            }
            cf.applicationId = parseInt(cloudfun.applicationId + '');
            cf.applicationName = app.name;
        }
        return await this.repo.save(cf);
    }
}
