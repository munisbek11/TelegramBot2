import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './database/schema/student.schema';

@Module({
  imports: [MongooseModule.forFeature([{name:Student.name, schema: StudentSchema}])],
  providers: [BotService],
})
export class BotModule {}
