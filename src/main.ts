import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TcpApiModule } from './api/tcp-api/tcp-api.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    app.use(express.json({ limit: '2mb' }));
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

    // const config = new DocumentBuilder().setTitle('Cats example').setDescription('The cats API description').setVersion('1.0').addTag('cats').build();
    // const document = SwaggerModule.createDocument(app, config, {
    //     ignoreGlobalPrefix: true,
    // });
    // SwaggerModule.setup('api', app, document);

    if (configService.get('TRUST_PROXY') === 'true') {
        (app.getHttpAdapter() as any).instance.set('trust proxy', true);
    }

    await app.listen(+configService.get('APP_PORT'));

    // TCP API
    const tcpApiApp = await NestFactory.createMicroservice<MicroserviceOptions>(TcpApiModule, {
        transport: Transport.TCP,
        options: {
            port: +configService.get('TCP_API_PORT'),
            host: '0.0.0.0',
        },
    });
    tcpApiApp.listen();
}
bootstrap();
