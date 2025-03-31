// src/hooks/useSerializeUser.test.js
import { renderHook } from '@testing-library/react';
import useSerializeUser from './useSerializeUser';

describe('useSerializeUser', () => {
  it('should serialize a Firebase user object', () => {
    const firebaseUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      photoURL: 'http://example.com/photo.jpg',
    };

    const { result } = renderHook(() => useSerializeUser());
    const { serializeUser } = result.current;
    const serializedUser = serializeUser(firebaseUser);

    expect(serializedUser).toEqual({
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      photoURL: 'http://example.com/photo.jpg',
    });
  });

  it('should return null if no Firebase user is provided', () => {
    const { result } = renderHook(() => useSerializeUser());
    const { serializeUser } = result.current;
    const serializedUser = serializeUser(null);

    expect(serializedUser).toBeNull();
  });
});
