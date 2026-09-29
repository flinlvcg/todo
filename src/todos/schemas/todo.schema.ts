import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String })
  description!: string | null;

  @Prop({ type: Boolean, default: false })
  completed!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
