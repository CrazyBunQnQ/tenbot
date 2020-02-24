import { md5, sha1 } from '@tenbot/utils';

describe('@tenbot/utils > hash', () => {
  describe('md5', () => {
    it('should generate md5 hash correctly', () => {
      expect(md5('foobar')).toBe('3858f62230ac3c915f300c664312c63f');
    });
  });

  describe('sha1', () => {
    it('should generate sha1 hash correctly', () => {
      expect(sha1('foobar')).toBe('8843d7f92416211de9ebb963ff4ce28125932878');
    });
  });
});
