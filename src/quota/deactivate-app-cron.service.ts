// import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { Developer } from 'src/developer/developer.entity';
// import { DeveloperService } from 'src/developer/developer.service';
// import { Application } from 'src/provide/application/application.entity';
// import { ApplicationService } from 'src/provide/application/application.service';
// import { Repository } from 'typeorm';
// import { QuotaService } from './quota.service';

// @Injectable()
// export class DeactivateAppCronService {
//     // 周期事件，自动检查开发者配额，如果缩小了配额，就把超出的应用停用
//     constructor(private applicationService: ApplicationService, private developerService: DeveloperService, private quotaService: QuotaService) {}

//     @Cron(CronExpression.EVERY_DAY_AT_3AM)
//     async handleCron() {
//         const developers = await (this.developerService.getRepo() as Repository<Developer>)
//             .createQueryBuilder('developer')
//             .where(
//                 `(SELECT maxAppCount FROM quota as quotaTable WHERE developer.quota = quotaTable.name) < (SELECT count(*) FROM application WHERE application.developerId = developer.id)`,
//             )
//             .getMany();
//         for (const item of developers) {
//             const apps = await (this.applicationService.getRepo() as Repository<Application>).find({
//                 where: {
//                     developerId: item.id,
//                 },
//                 order: {
//                     createdAt: 'DESC',
//                 },
//             });
//             const maxAppCount = (await this.quotaService.getByName(item.quota)).maxAppCount;
//             for (let i = maxAppCount; i < apps.length; i++) {
//                 this.applicationService.setDeactivated(apps[i].id, true);
//             }
//         }
//     }
// }
