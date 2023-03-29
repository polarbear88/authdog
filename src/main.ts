import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

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

    await app.listen(+configService.get('APP_PORT'));
}
bootstrap();
