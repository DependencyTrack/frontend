import {
  HASH_ALGORITHMS,
  computeHashVerificationStatus,
  getHashVerificationStatusInfo,
  hashStatusLabel,
  normalizeHashes,
} from '@/shared/hashVerificationStatus';
import { createTranslateStub } from '../../support/i18n';

describe('shared/hashVerificationStatus', () => {
  describe('HASH_ALGORITHMS', () => {
    it('lists the supported algorithms', () => {
      expect(HASH_ALGORITHMS).toEqual(['md5', 'sha1', 'sha256', 'sha512']);
    });
  });

  describe('getHashVerificationStatusInfo', () => {
    it.each([
      ['PASSED', 'fa-check-circle', 'status-passed'],
      ['FAILED', 'fa-times-circle', 'status-failed'],
      ['UNKNOWN', 'fa-question-circle', 'status-warning'],
      ['NO_COMPONENT_HASH', 'fa-minus-circle', 'text-muted'],
      ['NO_REPOSITORY_HASH', 'fa-question-circle-o', 'text-muted'],
    ])('maps %s to its icon and colour', (status, icon, color) => {
      expect(getHashVerificationStatusInfo(status)).toEqual({ icon, color });
    });

    it('falls back for an unrecognized status', () => {
      expect(getHashVerificationStatusInfo('NOPE')).toEqual({
        icon: 'fa-circle-o',
        color: 'text-muted',
      });
    });

    it('falls back for an undefined status', () => {
      expect(getHashVerificationStatusInfo(undefined)).toEqual({
        icon: 'fa-circle-o',
        color: 'text-muted',
      });
    });
  });

  describe('hashStatusLabel', () => {
    let $t;

    beforeEach(() => {
      $t = createTranslateStub();
    });

    it.each([
      ['PASSED', 'message.hash_verification.status.passed'],
      ['FAILED', 'message.hash_verification.status.failed'],
      ['UNKNOWN', 'message.hash_verification.status.unknown'],
      [
        'NO_COMPONENT_HASH',
        'message.hash_verification.status.no_component_hash',
      ],
      [
        'NO_REPOSITORY_HASH',
        'message.hash_verification.status.no_repository_hash',
      ],
    ])('translates %s', (status, key) => {
      expect(hashStatusLabel($t, status)).toBe(key);
    });

    it('returns an empty string for an unrecognized status', () => {
      expect(hashStatusLabel($t, 'NOPE')).toBe('');
      expect($t).not.toHaveBeenCalled();
    });

    it('returns an empty string for an undefined status', () => {
      expect(hashStatusLabel($t, undefined)).toBe('');
    });
  });

  describe('normalizeHashes', () => {
    it('returns an empty object for null', () => {
      expect(normalizeHashes(null)).toEqual({});
    });

    it('returns an empty object for undefined', () => {
      expect(normalizeHashes(undefined)).toEqual({});
    });

    it('trims and lowercases the hash values', () => {
      expect(normalizeHashes({ sha1: '  ABCDEF  ' })).toEqual({
        sha1: 'abcdef',
      });
    });

    it('skips values that are not strings', () => {
      expect(normalizeHashes({ md5: 1234, sha1: null, sha256: {} })).toEqual(
        {},
      );
    });

    it('skips blank and whitespace-only values', () => {
      expect(normalizeHashes({ md5: '', sha1: '   ' })).toEqual({});
    });

    it('ignores keys outside the supported algorithms', () => {
      expect(normalizeHashes({ sha384: 'abc', sha1: 'def' })).toEqual({
        sha1: 'def',
      });
    });
  });

  describe('computeHashVerificationStatus', () => {
    it('reports a missing repository hash before looking at the component', () => {
      expect(computeHashVerificationStatus({ sha1: 'abc' }, null)).toBe(
        'NO_REPOSITORY_HASH',
      );
      expect(computeHashVerificationStatus(null, null)).toBe(
        'NO_REPOSITORY_HASH',
      );
    });

    it('treats whitespace-only repository hashes as missing', () => {
      expect(
        computeHashVerificationStatus({ sha1: 'abc' }, { sha1: '   ' }),
      ).toBe('NO_REPOSITORY_HASH');
    });

    it('reports a missing component hash when the repository has one', () => {
      expect(computeHashVerificationStatus(null, { sha1: 'abc' })).toBe(
        'NO_COMPONENT_HASH',
      );
    });

    it('reports UNKNOWN when the two sides share no algorithm', () => {
      expect(
        computeHashVerificationStatus({ sha1: 'abc' }, { md5: 'def' }),
      ).toBe('UNKNOWN');
    });

    it('reports FAILED when a shared algorithm disagrees', () => {
      expect(
        computeHashVerificationStatus({ sha1: 'abc' }, { sha1: 'def' }),
      ).toBe('FAILED');
    });

    it('reports PASSED when a shared algorithm agrees', () => {
      expect(
        computeHashVerificationStatus({ sha1: 'abc' }, { sha1: 'abc' }),
      ).toBe('PASSED');
    });

    it('reports FAILED when any shared algorithm disagrees', () => {
      expect(
        computeHashVerificationStatus(
          { md5: 'aaa', sha1: 'abc' },
          { md5: 'aaa', sha1: 'def' },
        ),
      ).toBe('FAILED');
    });

    it('normalizes both sides before comparing', () => {
      expect(
        computeHashVerificationStatus({ sha1: '  ABC  ' }, { sha1: 'abc' }),
      ).toBe('PASSED');
    });

    it('ignores algorithms that only one side provides', () => {
      expect(
        computeHashVerificationStatus(
          { md5: 'aaa', sha1: 'abc' },
          { sha1: 'abc' },
        ),
      ).toBe('PASSED');
    });
  });
});
