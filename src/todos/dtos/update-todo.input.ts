import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateTodoInput {
  @Field(() => String, { nullable: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'Title must not be empty' })
  title?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => Boolean, { nullable: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  completed?: boolean | null;
}
