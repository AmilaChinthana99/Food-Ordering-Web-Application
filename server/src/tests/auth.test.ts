import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken } from '../utils/jwt';

describe('Auth JWT Utility Tests', () => {
  it('should generate and verify a valid access token', () => {
    const payload = { userId: 'user-123', email: 'test@foodie.com', role: 'CUSTOMER' };
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('user-123');
    expect(decoded.email).toBe('test@foodie.com');
    expect(decoded.role).toBe('CUSTOMER');
  });
});
