import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try{
    const app = await NestFactory.create(AppModule);
    const PORT = process.env.PORT || 4000
  await app.listen(PORT, () => {
    console.log(`Server is running: http://localhost:${PORT}`);
    
  });

  } catch(err) {
    throw new Error(err.message)
  }
}
bootstrap();
