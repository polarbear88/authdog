import { IsNotEmpty, IsString } from 'class-validator';

export class GeetestDto {
    @IsString()
    @IsNotEmpty()
    lot_number: string;

    @IsString()
    @IsNotEmpty()
    captcha_output: string;

    @IsString()
    @IsNotEmpty()
    pass_token: string;

    @IsString()
    @IsNotEmpty()
    gen_time: string;
}
