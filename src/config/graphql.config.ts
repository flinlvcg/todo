import type { ApolloDriverConfig } from '@nestjs/apollo';
import { registerAs } from '@nestjs/config';

export default registerAs('graphql', (): ApolloDriverConfig => ({
  autoSchemaFile: true,
  graphiql: true,
  includeStacktraceInErrorResponses: false,
  formatError: (error) => {
    if (error.extensions?.status === 404) {
      return {
        ...error,
        extensions: {
          ...error.extensions,
          code: 'NOT_FOUND',
        },
      };
    }
    return error;
  },
}));
