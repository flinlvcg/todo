import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import type { CreateTodoInput } from './dtos/create-todo.input';
import type { UpdateTodoInput } from './dtos/update-todo.input';
import { Todo, type TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name)
    private readonly todoModel: Model<Todo>,
  ) {}

  public async create(data: CreateTodoInput): Promise<TodoDocument> {
    return this.todoModel.create({
      title: data.title,
      description: data.description,
    });
  }

  public async findAll(): Promise<TodoDocument[]> {
    return this.todoModel.find().sort({ createdAt: -1, _id: -1 }).exec();
  }

  public async findOne(id: string): Promise<TodoDocument> {
    this.assertValidId(id);

    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  public async update(
    id: string,
    data: UpdateTodoInput,
  ): Promise<TodoDocument> {
    this.assertValidId(id);

    const changes: Partial<
      Pick<Todo, 'title' | 'description' | 'completed' | 'completedAt'>
    > = {};

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || !data.title.trim()) {
        throw new BadRequestException('Title must not be empty');
      }
      changes.title = data.title.trim();
    }

    if (data.description !== undefined) {
      changes.description = data.description;
    }

    if (data.completed !== undefined) {
      if (typeof data.completed !== 'boolean') {
        throw new BadRequestException('Completed must be a boolean');
      }
      changes.completed = data.completed;
      changes.completedAt = data.completed ? new Date() : null;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const todo = await this.todoModel
      .findByIdAndUpdate(
        id,
        { $set: changes },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  public async delete(id: string): Promise<TodoDocument> {
    this.assertValidId(id);

    const todo = await this.todoModel.findByIdAndDelete(id).exec();
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  private assertValidId(id: string): void {
    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException('Invalid todo ID');
    }
  }
}
