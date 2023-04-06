import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Saler } from 'src/saler/saler/saler.entity';
import { SalerService } from 'src/saler/saler/saler.service';

@Injectable()
export class ParseSalerPipe implements PipeTransform {
    constructor(private salerService: SalerService) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        return (await this.salerService.findById(value.id)) as Saler;
    }
}
