import { faker } from '@faker-js/faker';
import User from '../../src/models/User.js';

export const createTestUser = async (overrides = {}) => {
  const userData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'Test123!',
    ...overrides
  };
  
  const user = await User.create(userData);
  return user;
};

export const createTestUsers = async (count = 5) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await createTestUser());
  }
  return users;
};