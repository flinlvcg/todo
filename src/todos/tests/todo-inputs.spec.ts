import { plainToInstance } from 'class-transformer';
import { CreateTodoInput } from '../dtos/create-todo.input';
import { validate } from 'class-validator';
import { UpdateTodoInput } from '../dtos/update-todo.input';

describe('CreateTodoDto', () => {
  it('accepts a title without a description', async () => {
    const dto = plainToInstance(CreateTodoInput, {
      title: 'create a ToDo application',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it.each(['', '  '])('rejects a blanc title: %j', async (title) => {
    const dto = plainToInstance(CreateTodoInput, { title });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('title');
  });
});

describe('UpdateTodoDto', () => {
  it('accepts false and null description with an omitted title', async () => {
    const dto = plainToInstance(UpdateTodoInput, {
      completed: false,
      description: null,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a null title', async () => {
    const dto = plainToInstance(UpdateTodoInput, {
      title: null,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('title');
  });

  it('rejects a null completed value', async () => {
    const dto = plainToInstance(UpdateTodoInput, {
      completed: null,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('completed');
  });
});
