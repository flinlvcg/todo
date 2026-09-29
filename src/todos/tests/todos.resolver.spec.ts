import { TodosResolver } from '../todos.resolver';
import { TodosService } from '../todos.service';
import { Test } from '@nestjs/testing';

describe('TodosResolver', () => {
  let resolver: TodosResolver;

  const todosService = {
    create: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: TodosService,
          useValue: todosService,
        },
        {
          provide: TodosResolver,
          useFactory: (service: TodosService) => new TodosResolver(service),
          inject: [TodosService],
        },
      ],
    }).compile();

    resolver = module.get(TodosResolver);
  });

  describe('createTodo', () => {
    it('passes input unchanged to the service', async () => {
      const input = { title: 'write tests', description: null };
      const createdTodo = { title: input.title, description: '' };
      todosService.create.mockResolvedValue(createdTodo);

      const result = await resolver.createTodo(input);

      expect(todosService.create).toHaveBeenCalledWith(input);
      expect(todosService.create.mock.calls[0][0]).toBe(input);
      expect(input.description).toBeNull();
      expect(result).toBe(createdTodo);
    });
  });
});
