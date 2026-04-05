import { describe, it, expect, beforeEach } from 'vitest';
import authentification from '../../../middlewares/auth.js';
import jwt from 'jsonwebtoken';
import {
  createTestUser,
  generateAuthToken,
  createMockExpressObjects
} from '../../helpers/testHelpers.js';

describe('Auth Middleware', () => {
  let req, res, next, testUser;

  beforeEach(async () => {
    const mocks = createMockExpressObjects();
    req = mocks.req;
    res = mocks.res;
    next = mocks.next;
    
    testUser = await createTestUser();
  });

  it('should authenticate user with valid token', async () => {
    const token = generateAuthToken(testUser._id);
    req.cookies.token = token;

    await authentification(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(testUser._id.toString());
  });

  it('should reject request without token', async () => {
    await authentification(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});