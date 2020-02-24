import * as crypto from 'crypto';

/**
 * Generate md5 hash
 */
export function md5(str: crypto.BinaryLike): string {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}

/**
 * Generate sha1 hash
 */
export function sha1(str: crypto.BinaryLike): string {
  return crypto
    .createHash('sha1')
    .update(str)
    .digest('hex');
}
