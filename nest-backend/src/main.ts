import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestJS backend running on http://localhost:${port}`);
}
bootstrap();
