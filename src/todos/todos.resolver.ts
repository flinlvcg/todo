import { Resolver, Query, ID, Mutation, Args } from '@nestjs/graphql';
import { TodoModel } from './models/todo.model';
import { TodosService } from './todos.service';
import type { TodoDocument } from './schemas/todo.schema';
import { CreateTodoInput } from './dtos/create-todo.input';
import { UpdateTodoInput } from './dtos/update-todo.input';

@Resolver(() => TodoModel)
export class TodosResolver {
  constructor(private readonly todosService: TodosService) {}

  @Query(() => [TodoModel], { name: 'todos' })
  public async findAll(): Promise<TodoDocument[]> {
    return this.todosService.findAll();
  }

  @Query(() => TodoModel, { name: 'todo' })
  public async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TodoDocument> {
    return this.todosService.findOne(id);
  }

  @Mutation(() => TodoModel)
  public async createTodo(
    @Args('input') input: CreateTodoInput,
  ): Promise<TodoDocument> {
    return this.todosService.create(input);
  }

  @Mutation(() => TodoModel)
  public async updateTodo(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTodoInput,
  ): Promise<TodoDocument> {
    return this.todosService.update(id, input);
  }

  @Mutation(() => TodoModel)
  public async deleteTodo(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TodoDocument> {
    return this.todosService.delete(id);
  }
}
