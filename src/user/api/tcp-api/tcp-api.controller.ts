import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TcpApiCommonDto } from './tcp-api.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApplicationService } from 'src/provide/application/application.service';
import { Application } from 'src/provide/application/application.entity';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { DeviceService } from 'src/user/device/device.service';
import { UserService } from 'src/user/user/user.service';
import { LoginUserDto } from 'src/user/user/user.dto';

@Controller()
export class TcpApiController {
    constructor(private applicationService: ApplicationService, private deviceService: DeviceService, private userService: UserService) {}

    async validateTcpApiCommonDto(dto: any) {
        const clDto = plainToInstance(TcpApiCommonDto, dto);
        const errors = await validate(clDto);
        if (errors.length > 0) {
            throw new BadRequestException(errors[0].toString());
        }
        return clDto;
    }

    async getApp(appid: number) {
        const app = (await this.applicationService.findById(appid)) as Application;
        if (!app) {
            throw new BadRequestException('应用不存在');
        }
        return app;
    }

    decryptBody(data: any, app: Application, pbkey: string) {
        let aesKey = '';
        if (app.cryptoMode === 'none') {
            if (typeof data !== 'object') {
                throw new BadRequestException('错误的请求');
            }
            return {
                data,
                aesKey,
            };
        }
        if (typeof data !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'aes') {
            aesKey = app.cryptoSecret;
            return {
                data: CryptoUtils.decryptAESJSON(data, app.cryptoSecret),
                aesKey,
            };
        }
        if (!pbkey || typeof pbkey !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'rsa') {
            return CryptoUtils.decryptRSAJSON(data, pbkey, app.cryptoSecret);
        }
        if (app.cryptoMode === 'ecdh') {
            return CryptoUtils.decryptECDHJSON(data, pbkey, app.cryptoSecret);
        }
        throw new BadRequestException('错误的请求');
    }

    encryptBody(data: any, aesKey: string) {
        if (!aesKey) {
            return data;
        }
        return CryptoUtils.aesCBCEncrypt(Buffer.from(JSON.stringify(data)), aesKey, 'aes-256-cbc', '0000000000000000', true).toString('base64');
    }

    // 验证设备授权
    @MessagePattern('001')
    async deviceAuth(data: string) {
        try {
            const dto = await this.validateTcpApiCommonDto(JSON.parse(data));
            const app = await this.getApp(dto.appid);
            const { data: body, aesKey } = this.decryptBody(dto.ciphertext, app, dto.key);
            if (!body.deviceId || typeof body.deviceId !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            const device = await this.deviceService.findByAppidAndDeviceId(app.id, body.deviceId);
            if (!device) {
                throw new BadRequestException('设备不存在');
            }
            const authResult = this.deviceService.validateUserAuth(app, device);
            const retData = JSON.stringify({
                code: 200,
                msg: 'OK',
                data: this.encryptBody(
                    {
                        device: device._serialization(),
                        auth: {
                            result: authResult.result,
                            message: authResult.msg,
                            expire: device.expirationTime.getTime(),
                            balance: device.balance,
                        },
                    },
                    aesKey,
                ),
            });
            return retData;
        } catch (error) {
            return JSON.stringify({ code: 400, msg: error.message });
        }
    }

    // 验证用户授权
    @MessagePattern('002')
    async userAuth(data: string) {
        try {
            const dto = await this.validateTcpApiCommonDto(JSON.parse(data));
            const app = await this.getApp(dto.appid);
            const { data: body, aesKey } = this.decryptBody(dto.ciphertext, app, dto.key);
            if (!body.name || typeof body.name !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            if (!body.password || typeof body.password !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            const user = await this.userService.validateUser(
                plainToClass(LoginUserDto, {
                    appid: app.id,
                    name: body.name,
                    password: body.password,
                }),
            );
            const authResult = this.userService.validateUserAuth(user, app, user.currentDeviceId);
            const retData = JSON.stringify({
                code: 200,
                msg: 'OK',
                data: this.encryptBody(
                    {
                        user: user._serialization(),
                        auth: {
                            result: authResult.result,
                            message: authResult.msg,
                            expire: user.expirationTime.getTime(),
                            balance: user.balance,
                        },
                    },
                    aesKey,
                ),
            });
            return retData;
        } catch (error) {
            return JSON.stringify({ code: 400, msg: error.message });
        }
    }
}
