import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ApiParseUserPipe implements PipeTransform {
    constructor(private userService: UserService) {}

    // 同于从req.user中解析账号
    async transform(value: any, metadata: ArgumentMetadata) {
        return (await this.userService.findById(value.id)) as User;
    }
}
