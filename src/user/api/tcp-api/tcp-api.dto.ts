import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TcpApiCommonDto {
    @IsInt()
    @IsNotEmpty()
    appid: number;

    @IsNotEmpty()
    ciphertext: any;

    @IsOptional()
    @IsString()
    key: string;
}
