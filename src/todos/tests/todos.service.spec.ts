import { Test } from '@nestjs/testing';
import { TodosService } from '../todos.service';
import { getModelToken } from '@nestjs/mongoose';
import { Todo } from '../schemas/todo.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;

  const todoModel = {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  };

  const id = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    vi.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: todoModel,
        },
      ],
    }).compile();

    service = module.get(TodosService);
  });

  describe('create', () => {
    it.each([
      { description: undefined, expected: '' },
      { description: null, expected: '' },
      { description: 'write tests', expected: 'write tests' },
    ])(
      'stores description $description as "$expected"',
      async ({ description, expected }) => {
        const input = { title: 'write tests', description };
        const createdTodo = {
          _id: id,
          title: input.title,
          description: expected,
        };
        todoModel.create.mockResolvedValue(createdTodo);

        const result = await service.create(input);

        expect(todoModel.create).toHaveBeenCalledWith({
          title: input.title,
          description: expected,
        });
        expect(input.description).toBe(description);
        expect(result).toBe(createdTodo);
      },
    );
  });

  describe('findOne', () => {
    it('returns an existing todo', async () => {
      const todo = { _id: id, title: 'create a ToDo application' };

      todoModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(todo),
      });

      const result = await service.findOne(id);

      expect(result).toEqual(todo);
      expect(todoModel.findById).toHaveBeenCalledWith(id);
    });

    it('rejects an invalid ID without querying the database', async () => {
      await expect(service.findOne('abc')).rejects.toThrow(BadRequestException);

      expect(todoModel.findById).not.toHaveBeenCalled();
    });

    it('rejects an ID that does not match a todo', async () => {
      todoModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('passes false to the database as an update', async () => {
      const updatedTodo = {
        _id: id,
        title: 'create a ToDo application',
        completed: false,
      };

      todoModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue(updatedTodo),
      });

      const result = await service.update(id, { completed: false });

      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { completed: false, completedAt: null } },
        expect.objectContaining({
          returnDocument: 'after',
          runValidators: true,
        }),
      );
      expect(result).toEqual(updatedTodo);
    });

    it('rejects an empty update without querying the database', async () => {
      await expect(service.update(id, {})).rejects.toThrow(
        'At least one field must be provided',
      );

      expect(todoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('converts a null description to an empty string', async () => {
      const updatedTodo = {
        _id: id,
        title: 'create a ToDo application',
        description: '',
      };

      todoModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue(updatedTodo),
      });

      await service.update(id, { description: null });

      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        {
          $set: { description: '' },
        },
        expect.any(Object),
      );
    });

    it('trims the title before updating', async () => {
      todoModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: id,
          title: 'create a ToDo application',
        }),
      });

      await service.update(id, { title: '   create a ToDo application  ' });

      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        {
          $set: { title: 'create a ToDo application' },
        },
        expect.any(Object),
      );
    });

    it('records when a todo is completed', async () => {
      todoModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: id, completed: true }),
      });

      await service.update(id, { completed: true });

      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { completed: true, completedAt: expect.any(Date) } },
        expect.any(Object),
      );
    });

    it('rejects null for title and completed even when called directly', async () => {
      await expect(service.update(id, { title: null })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(id, { completed: null })).rejects.toThrow(
        BadRequestException,
      );
      expect(todoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects an update when the todo does not exist', async () => {
      todoModel.findByIdAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, { completed: true })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('returns the deleted todo', async () => {
      const todo = {
        _id: id,
        title: 'create a ToDo application',
      };

      todoModel.findByIdAndDelete.mockReturnValue({
        exec: vi.fn().mockResolvedValue(todo),
      });

      const result = await service.delete(id);

      expect(result).toEqual(todo);
      expect(todoModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('rejects an invalid ID without querying the database', async () => {
      await expect(service.delete('abc')).rejects.toThrow(BadRequestException);

      expect(todoModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('rejects an ID that does not match a todo', async () => {
      todoModel.findByIdAndDelete.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    });
  });
});
