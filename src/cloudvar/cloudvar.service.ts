import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { BaseService } from 'src/common/service/base.service';
import { Like, Repository } from 'typeorm';
import { CreateCloudvarDto, UpdateCloudvarDto } from './cloudvar.dto';
import { Cloudvar } from './cloudvar.entity';

@Injectable()
export class CloudvarService extends BaseService {
    constructor(
        @InjectRepository(Cloudvar)
        private cloudvarRepository: Repository<Cloudvar>,
        private applicationService: ApplicationService,
    ) {
        super(cloudvarRepository);
    }

    async create(cloudvar: CreateCloudvarDto, developerId: number): Promise<Cloudvar> {
        const cv = new Cloudvar();
        cv.name = cloudvar.name;
        if (cloudvar.description) {
            cv.description = cloudvar.description + '';
        }
        cv.value = cloudvar.value;
        cv.isPublic = cloudvar.isPublic;
        cv.isGlobal = cloudvar.isGlobal;
        if (cloudvar.applicationId && !cloudvar.isGlobal) {
            const app = (await this.applicationService.findById(cloudvar.applicationId)) as Application;
            if (!app || app.developerId !== developerId) {
                throw new NotAcceptableException('应用不存在');
            }
            cv.applicationId = parseInt(cloudvar.applicationId + '');
            cv.applicationName = app.name;
        }
        cv.developerId = developerId;
        return await this.cloudvarRepository.save(cv);
    }

    async getList(developerId: number, word?: string, appid?: number): Promise<Cloudvar[]> {
        const where = {
            developerId,
        };
        if (word) {
            where['name'] = Like(`%${word}%`);
        }
        if (appid) {
            where['applicationId'] = appid;
        }
        return await this.cloudvarRepository.find({
            where,
            order: {
                id: 'DESC',
            },
        });
    }

    async delete(developerId: number, id: number): Promise<void> {
        await this.cloudvarRepository.delete({
            developerId,
            id,
        });
    }

    async findByName(developerId: number, name: string): Promise<Cloudvar> {
        return await this.cloudvarRepository.findOne({
            where: {
                developerId,
                name,
            },
        });
    }

    async findByDeveloperIdAndId(developerId: number, id: number): Promise<Cloudvar> {
        return await this.cloudvarRepository.findOne({
            where: {
                developerId,
                id,
            },
        });
    }

    async existByName(developerId: number, name: string): Promise<boolean> {
        return await this.cloudvarRepository.exist({
            where: {
                developerId,
                name,
            },
        });
    }

    async update(developerId: number, cloudvar: UpdateCloudvarDto): Promise<Cloudvar> {
        const cv = await this.cloudvarRepository.findOne({
            where: {
                developerId,
                id: cloudvar.id,
            },
        });
        if (!cv) {
            throw new NotAcceptableException('变量不存在');
        }
        cv.name = cloudvar.name;
        if (cloudvar.description) {
            cv.description = cloudvar.description + '';
        }
        cv.value = cloudvar.value;
        cv.isPublic = cloudvar.isPublic;
        cv.isGlobal = cloudvar.isGlobal;
        if (cloudvar.applicationId && !cloudvar.isGlobal) {
            const app = (await this.applicationService.findById(cloudvar.applicationId)) as Application;
            if (!app || app.developerId !== developerId) {
                throw new NotAcceptableException('应用不存在');
            }
            cv.applicationId = parseInt(cloudvar.applicationId + '');
            cv.applicationName = app.name;
        }
        return await this.cloudvarRepository.save(cv);
    }
}
