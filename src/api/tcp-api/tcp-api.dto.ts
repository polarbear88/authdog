import { Optional } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class TcpApiCommonDto {
    @IsInt()
    @IsNotEmpty()
    appid: number;

    @IsNotEmpty()
    ciphertext: any;

    @Optional()
    @IsString()
    key: string;
}
