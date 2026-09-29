import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class CreateTodoInput {
  @Field(() => String)
  @IsString()
  @Matches(/\S/, { message: 'Title must not be empty' })
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
