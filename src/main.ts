import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    app.useGlobalPipes(
        new ValidationPipe({
            // disableErrorMessages: true,
        }),
    );
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });
    app.setGlobalPrefix('api');
    await app.listen(+configService.get('APP_PORT'));
}
bootstrap();
