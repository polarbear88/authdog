import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Developer } from '../developer.entity';
import { DeveloperService } from '../developer.service';

@Injectable()
export class ParseDeveloperPipe implements PipeTransform {
    constructor(private developerService: DeveloperService) {}

    // 同于从req.user中解析开发者账号
    async transform(value: any, metadata: ArgumentMetadata) {
        return (await this.developerService.findById(value.id)) as Developer;
    }
}
