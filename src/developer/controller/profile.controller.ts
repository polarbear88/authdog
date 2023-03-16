import { Controller, Get } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { Developer } from '../developer.entity';
import { DeveloperService } from '../developer.service';
import { ParseDeveloperPipe } from '../pipe/parse-developer.pipe';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'profile' })
export class ProfileController extends BaseController {
    constructor(private developerService: DeveloperService) {
        super();
    }

    @Get()
    async getProfile(@TakeDeveloper(ParseDeveloperPipe) developer: Developer) {
        return developer;
    }
}
