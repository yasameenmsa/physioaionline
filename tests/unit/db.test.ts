import { describe, it, expect } from 'vitest';

describe('Database Connection', () => {
  it('has MONGODB_URI defined in environment', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toMatch(/^mongodb(\+srv)?:\/\//);
  });

  it('has a valid connection string format', () => {
    const uri = process.env.MONGODB_URI!;
    expect(() => new URL(uri)).not.toThrow();
  });
});
