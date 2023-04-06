import { Injectable, NotAcceptableException } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { UserData } from './user-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDataDto, GetUserDataListByDeveloperDto } from './user-data.dto';
import { Application } from '../application/application.entity';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';

@Injectable()
export class UserDataService extends BaseService {
    constructor(
        @InjectRepository(UserData)
        private repo: Repository<UserData>,
    ) {
        super(repo);
    }

    async create(dto: CreateUserDataDto, app: Application, userId: number, userName: string) {
        if (!dto.uniqueValue && !dto.value) {
            throw new NotAcceptableException('值和唯一值均为空');
        }
        const data = new UserData();
        data.name = dto.name;
        data.value = dto.value;
        data.uniqueValue = dto.uniqueValue;
        data.developerId = app.developerId;
        data.appid = app.id;
        data.appName = app.name;
        data.userId = userId;
        data.userName = userName;
        return await this.repo.save(data);
    }

    async findByUserIdAndUniqueValue(appid: number, userId: number, uniqueValue: string) {
        return await this.repo.findOne({ where: { appid, userId, uniqueValue } });
    }

    async findByUserIdAndName(appid: number, userId: number, name: string, dto: GetPageDto) {
        const page = dto.page || 1;
        const pageSize = dto.pageSize || 10;
        return await this.repo.find({ where: { appid, userId, name }, skip: (page - 1) * pageSize, take: pageSize });
    }

    async findByUserId(appid: number, userId: number, dto: GetPageDto) {
        const page = dto.page || 1;
        const pageSize = dto.pageSize || 10;
        return await this.repo.find({ where: { appid, userId }, skip: (page - 1) * pageSize, take: pageSize });
    }

    async deleteByUserIdAndId(appid: number, userId: number, id: number | number[]) {
        return await this.repo.delete({ appid, userId, id: Array.isArray(id) ? In(id) : id });
    }

    async updateByUserIdAndId(appid: number, userId: number, id: number, dto: CreateUserDataDto) {
        try {
            if (!dto.uniqueValue && !dto.value) {
                throw new NotAcceptableException('值和唯一值均为空');
            }
            const data = await this.repo.findOne({ where: { appid, userId, id } });
            if (!data) {
                throw new NotAcceptableException('数据不存在');
            }
            data.name = dto.name;
            data.value = dto.value;
            data.uniqueValue = dto.uniqueValue;
            return await this.repo.save(data);
        } catch (error) {
            throw new NotAcceptableException('修改失败，可能唯一值已存在');
        }
    }

    async deleteByAppIdAndId(appid: number, id: number | number[]) {
        return await this.repo.delete({ appid, id: Array.isArray(id) ? In(id) : id });
    }

    async getList(developerId: number, dto: GetUserDataListByDeveloperDto) {
        const data = await super.getPage(
            PaginationUtils.objectToDto(dto, new GetUserDataListByDeveloperDto()),
            [['developerId = :developerId', { developerId }]],
            'id',
            'DESC',
        );
        return {
            total: data[1],
            list: data[0],
        };
    }

    async findByUserIdAndId(appid: number, userId: number, id: number) {
        return await this.repo.findOne({ where: { appid, userId, id } });
    }
}
