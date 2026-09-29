require('reflect-metadata');

const assert = require('node:assert/strict');
const { ValidationPipe } = require('@nestjs/common');
const { GraphQLSchemaHost } = require('@nestjs/graphql');
const { getConnectionToken } = require('@nestjs/mongoose');
const { Test } = require('@nestjs/testing');
const { graphql } = require('graphql');
const mongoose = require('mongoose');
const { AppModule } = require('../dist/app.module');
const { TodosService } = require('../dist/todos/todos.service');

const id = '507f1f77bcf86cd799439011';
const todo = {
  id,
  title: 'Write tests',
  description: '',
  completed: false,
  completedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

async function main() {
  process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/todo-test';
  const updateCalls = [];
  const service = {
    findAll: async () => [todo],
    findOne: async () => todo,
    create: async () => todo,
    update: async (updatedId, input) => {
      updateCalls.push({ updatedId, input });
      return { ...todo, completed: true, completedAt: new Date() };
    },
    delete: async () => todo,
  };

  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(getConnectionToken())
    .useValue(mongoose.createConnection())
    .overrideProvider(TodosService)
    .useValue(service)
    .compile();
  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  try {
    await app.init();
    const schema = app.get(GraphQLSchemaHost).schema;
    const list = await graphql({
      schema,
      source: '{ todos { id title completed completedAt } }',
    });
    assert.equal(list.errors, undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(list.data.todos)), [
      { id, title: 'Write tests', completed: false, completedAt: null },
    ]);

    const completed = await graphql({
      schema,
      source:
        'mutation($id: ID!, $input: UpdateTodoInput!) { updateTodo(id: $id, input: $input) { completed completedAt } }',
      variableValues: { id, input: { completed: true } },
    });
    assert.equal(completed.errors, undefined);
    assert.equal(completed.data.updateTodo.completed, true);
    assert.ok(completed.data.updateTodo.completedAt);
    assert.equal(updateCalls.length, 1);
    assert.equal(updateCalls[0].updatedId, id);
    assert.equal(updateCalls[0].input.completed, true);

    const invalid = await graphql({
      schema,
      source:
        'mutation($id: ID!, $input: UpdateTodoInput!) { updateTodo(id: $id, input: $input) { id } }',
      variableValues: { id, input: { title: null } },
    });
    assert.equal(invalid.errors.length, 1);
    assert.equal(updateCalls.length, 1);
    process.stdout.write('GraphQL schema and validation smoke test passed.\n');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
