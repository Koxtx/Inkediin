import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Import du modèle avec gestion du cache
let User;
try {
  User = mongoose.model('User');
} catch {
  User = require('../../models/user.model.js');
}

export const createTestUser = async (overrides = {}) => {
  const defaultData = {
    email: faker.internet.email().toLowerCase(),
    password: await bcrypt.hash('Test123!', 10),
    userType: 'client',
    isProfileCompleted: true,
    nom: faker.person.fullName(),
    localisation: faker.location.city(),
    ville: faker.location.city(),
  };

  const userData = { ...defaultData, ...overrides };
  const user = await User.create(userData);
  return user;
};

export const createTestTattooer = async (overrides = {}) => {
  return createTestUser({
    userType: 'tatoueur',
    bio: faker.lorem.paragraph(),
    styles: 'Japonais, Traditionnel',
    ...overrides,
  });
};

export const createTestUsers = async (count = 5, overrides = {}) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await createTestUser(overrides));
  }
  return users;
};

export const createTestTattooers = async (count = 5, overrides = {}) => {
  const tattooers = [];
  for (let i = 0; i < count; i++) {
    tattooers.push(await createTestTattooer(overrides));
  }
  return tattooers;
};

export const generateAuthToken = (userId) => {
  return jwt.sign({}, process.env.SECRET_KEY, {
    subject: userId.toString(),
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

export const createAuthCookie = (userId) => {
  const token = generateAuthToken(userId);
  return `token=${token}`;
};

export const createMockExpressObjects = () => {
  const req = {
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    user: null,
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  return { req, res, next };
};