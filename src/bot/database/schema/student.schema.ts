import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type StudentDocument = Student & Document;

@Schema()
export class Student {
  static updateOne(arg0: { _id: any }, arg1: { $set: { chatId: number } }) {
    throw new Error("Method not implemented");
  }
  @Prop({ required: true, unique: true })
  chatId: number;
  @Prop({ required: true })
  name: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student)