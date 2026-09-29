import { registerAs } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

export default registerAs('mongoose', (): MongooseModuleOptions => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new TypeError('Configuration key "MONGODB_URI" does not exist');
  }

  return { uri };
});
