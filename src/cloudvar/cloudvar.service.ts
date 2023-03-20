import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Like, Repository } from 'typeorm';
import { CreateCloudvarDto, UpdateCloudvarDto } from './cloudvar.dto';
import { Cloudvar } from './cloudvar.entity';

@Injectable()
export class CloudvarService extends BaseService {
    constructor(
        @InjectRepository(Cloudvar)
        private cloudvarRepository: Repository<Cloudvar>,
    ) {
        super(cloudvarRepository);
    }

    async create(cloudvar: CreateCloudvarDto, developerId: number): Promise<Cloudvar> {
        const cv = new Cloudvar();
        cv.name = cloudvar.name;
        if (cloudvar.desc) {
            cv.desc = cloudvar.desc + '';
        }
        cv.value = cloudvar.value;
        cv.isPublic = cloudvar.isPublic;
        cv.isGlobal = cloudvar.isGlobal;
        if (cloudvar.applicationId && !cloudvar.isGlobal) {
            cv.applicationId = parseInt(cloudvar.applicationId + '');
        }
        cv.developerId = developerId;
        return await this.cloudvarRepository.save(cv);
    }

    async getList(developerId: number, word?: string): Promise<Cloudvar[]> {
        const where = {
            developerId,
        };
        if (word) {
            where['name'] = Like(`%${word}%`);
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
        if (cloudvar.desc) {
            cv.desc = cloudvar.desc + '';
        }
        cv.value = cloudvar.value;
        cv.isPublic = cloudvar.isPublic;
        cv.isGlobal = cloudvar.isGlobal;
        if (cloudvar.applicationId && !cloudvar.isGlobal) {
            cv.applicationId = parseInt(cloudvar.applicationId + '');
        }
        return await this.cloudvarRepository.save(cv);
    }
}
