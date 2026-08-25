import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNodeLabel } from '../src/shared/nodeLabel.js';

test('decodes percent-encoded purlCoordinates for display', () => {
  assert.equal(
    createNodeLabel({
      objectType: 'COMPONENT',
      purlCoordinates: 'pkg:npm/%40dnd-kit/core@6.3.1',
    }),
    'pkg:npm/@dnd-kit/core@6.3.1',
  );
});

test('falls back to purl when purlCoordinates is absent', () => {
  assert.equal(
    createNodeLabel({
      objectType: 'COMPONENT',
      purl: 'pkg:npm/%40floating-ui/react@0.27.20',
    }),
    'pkg:npm/@floating-ui/react@0.27.20',
  );
});

test('returns the raw purl when it is not decodable', () => {
  for (const purl of ['pkg:generic/100%pure@1', 'pkg:generic/bad%zz@1']) {
    assert.equal(createNodeLabel({ objectType: 'COMPONENT', purl }), purl);
  }
});

test('composes groupId, name and version when no purl is present', () => {
  assert.equal(
    createNodeLabel({
      objectType: 'COMPONENT',
      groupId: 'org.acme',
      name: 'lib',
      version: '1.0',
    }),
    'org.acme lib 1.0',
  );
});

test('projects never use the purl, even when they have one', () => {
  assert.equal(
    createNodeLabel({ name: 'proj', version: '2', purl: 'pkg:npm/%40x/y@1' }),
    'proj 2',
  );
});
