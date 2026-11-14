import { describe, expect, it } from 'vitest';
import {
  decodeFilters,
  emptyFilterValue,
  encodeFilters,
  filterQueryKeys,
} from '@/shared/filterQuery';

const severity = {
  name: 'severity',
  type: 'multiselect',
  options: [{ value: 'critical' }, { value: 'high' }, { value: 'low' }],
};
const kev = { name: 'showKevOnly', type: 'boolean', param: 'isKev' };
const inactive = { name: 'showInactive', type: 'boolean' };
const text = {
  name: 'textSearch',
  type: 'text',
  fields: [{ value: 'vulnerability_id' }, { value: 'component_name' }],
};
const ALL_FIELDS = ['vulnerability_id', 'component_name'];
const published = { name: 'publishDate', type: 'daterange' };
const attributed = {
  name: 'attributedOn',
  type: 'daterange',
  param: 'attributedOnDate',
};
const cvss = { name: 'cvssv3', type: 'numrange', min: 0, max: 10 };
const occurrences = { name: 'occurrences', type: 'numrange', min: 0 };
const defs = [
  severity,
  kev,
  inactive,
  text,
  published,
  attributed,
  cvss,
  occurrences,
];
const emptyValues = () =>
  Object.fromEntries(defs.map((def) => [def.name, emptyFilterValue(def)]));

const decode = (query, def) => decodeFilters([def], query)[def.name];
const encode = (def, value) => encodeFilters([def], { [def.name]: value });
// Builds a query from the given keys, leaving out undefined ones.
const queryOf = (entries) =>
  Object.fromEntries(
    Object.entries(entries).filter(([, v]) => v !== undefined),
  );

describe('emptyFilterValue', () => {
  it.each([
    [severity, []],
    [kev, false],
    [text, null],
    [published, null],
    [cvss, null],
  ])('is the neutral value of %j', (def, expected) => {
    expect(emptyFilterValue(def)).toEqual(expected);
  });
});

describe('filterQueryKeys', () => {
  it('lists every parameter the filters own, under the API names', () => {
    expect([...filterQueryKeys(defs)].sort()).toEqual([
      'attributedOnDateFrom',
      'attributedOnDateTo',
      'cvssv3From',
      'cvssv3To',
      'isKev',
      'occurrencesFrom',
      'occurrencesTo',
      'publishDateFrom',
      'publishDateTo',
      'severity',
      'showInactive',
      'textSearchField',
      'textSearchInput',
    ]);
  });
});

describe('encodeFilters', () => {
  it('encodes nothing for empty filters', () => {
    expect(encodeFilters(defs, emptyValues())).toEqual({});
  });

  // [def, value, expected query]
  it.each([
    [severity, ['critical', 'high'], { severity: 'critical,high' }],
    [kev, true, { isKev: 'true' }],
    [kev, false, {}],
    [text, { value: '', fields: ['component_name'] }, {}],
    [cvss, { from: 0, to: 5.5 }, { cvssv3From: '0', cvssv3To: '5.5' }],
    [cvss, { from: null, to: 0 }, { cvssv3To: '0' }],
    [
      published,
      { since: '2024-01-01', before: null },
      { publishDateFrom: '2024-01-01' },
    ],
  ])('encodes %j %j as %j', (def, value, expected) => {
    expect(encode(def, value)).toEqual(expected);
  });

  it('encodes text input and fields', () => {
    expect(encode(text, { value: 'log4j', fields: ALL_FIELDS })).toEqual({
      textSearchInput: 'log4j',
      textSearchField: 'vulnerability_id,component_name',
    });
  });

  it('encodes a date range under its param', () => {
    expect(
      encode(attributed, { since: '2024-01-01', before: '2024-02-01' }),
    ).toEqual({
      attributedOnDateFrom: '2024-01-01',
      attributedOnDateTo: '2024-02-01',
    });
  });
});

describe('decodeFilters', () => {
  it('yields empty values for an empty query', () => {
    expect(decodeFilters(defs, {})).toEqual(emptyValues());
  });

  it('ignores parameters no filter owns', () => {
    expect(decodeFilters([kev], { isKev: 'true', component: 'abc' })).toEqual({
      showKevOnly: true,
    });
  });

  // Unknown options and blanks are dropped, case is ignored, duplicates removed.
  it.each([
    ['critical,high', ['critical', 'high']],
    ['critical,bogus,,high', ['critical', 'high']],
    ['CRITICAL, High', ['critical', 'high']],
    ['low,LOW', ['low']],
    ['bogus', []],
  ])('decodes severity=%j as %j', (raw, expected) => {
    expect(decode({ severity: raw }, severity)).toEqual(expected);
  });

  // A bare flag (null) or any value but false/0 means on; absent means off.
  it.each([
    ['true', true],
    ['1', true],
    ['yes', true],
    ['', true],
    [null, true],
    [['false', 'true'], true],
    ['false', false],
    ['FALSE', false],
    ['0', false],
    [undefined, false],
  ])('decodes isKev=%j as %j', (raw, expected) => {
    expect(decode(queryOf({ isKev: raw }), kev)).toBe(expected);
  });

  // [input, field, expected value, expected fields]: no valid field means all.
  it.each([
    ['log4j', 'component_name', 'log4j', ['component_name']],
    ['x', undefined, 'x', ALL_FIELDS],
    ['x', 'bogus', 'x', ALL_FIELDS],
    ['  ', 'component_name', null],
    [undefined, 'component_name', null],
    [null, 'component_name', null],
  ])('decodes text %j in %j', (input, field, value, fields) => {
    const query = queryOf({ textSearchInput: input, textSearchField: field });
    expect(decode(query, text)).toEqual(value && { value, fields });
  });

  // [from, to, expected since, expected before]: invalid bounds are dropped.
  it.each([
    ['2024-01-01', '2024-02-29', '2024-01-01', '2024-02-29'],
    [undefined, '2024-02-01', null, '2024-02-01'],
    ['2024-02-30', '2024-03-01', null, '2024-03-01'],
    ['2024-02-30', undefined, null, null],
    ['2023-02-29', undefined, null, null],
    ['2024-13-01', undefined, null, null],
    ['2024-00-10', undefined, null, null],
    ['2024-1-1', undefined, null, null],
    ['2024-01-01T00:00:00Z', undefined, null, null],
    ['1704067200000', undefined, null, null],
    ['yesterday', undefined, null, null],
    ['', undefined, null, null],
  ])('decodes publishDate %j..%j', (from, to, since, before) => {
    const query = queryOf({ publishDateFrom: from, publishDateTo: to });
    const expected = since || before ? { since, before } : null;
    expect(decode(query, published)).toEqual(expected);
  });

  it('decodes a date range under its param', () => {
    expect(decode({ attributedOnDateFrom: '2024-05-06' }, attributed)).toEqual({
      since: '2024-05-06',
      before: null,
    });
  });

  // [from, to, expected from, expected to]: plain decimals within 0..10 only,
  // and an inverted range is dropped as a whole.
  it.each([
    ['7', '9.5', 7, 9.5],
    ['0', undefined, 0, null],
    [undefined, '0', null, 0],
    ['5', '5', 5, 5],
    ['99', '4', null, 4],
    ['9', '3', null, null],
    ['-0.1', undefined, null, null],
    ['10.1', undefined, null, null],
    ['11', undefined, null, null],
    ['abc', undefined, null, null],
    ['', undefined, null, null],
    [' ', undefined, null, null],
    ['NaN', undefined, null, null],
    ['Infinity', undefined, null, null],
    ['1e1', undefined, null, null],
    ['0x5', undefined, null, null],
  ])('decodes cvssv3 %j..%j', (rawFrom, rawTo, from, to) => {
    const query = queryOf({ cvssv3From: rawFrom, cvssv3To: rawTo });
    const expected = from !== null || to !== null ? { from, to } : null;
    expect(decode(query, cvss)).toEqual(expected);
  });

  it('applies only the min of a range without a max', () => {
    expect(decode({ occurrencesFrom: '5000' }, occurrences)).toEqual({
      from: 5000,
      to: null,
    });
    expect(decode({ occurrencesFrom: '-1' }, occurrences)).toBeNull();
  });
});

describe('round trip', () => {
  it('restores what was encoded', () => {
    const values = {
      severity: ['high', 'low'],
      showKevOnly: true,
      showInactive: false,
      textSearch: { value: 'a b&c,d', fields: ['component_name'] },
      publishDate: { since: '2024-01-01', before: '2024-12-31' },
      attributedOn: { since: null, before: '2025-01-01' },
      cvssv3: { from: 0, to: 9.9 },
      occurrences: { from: 2, to: null },
    };
    expect(decodeFilters(defs, encodeFilters(defs, values))).toEqual(values);
  });

  it('survives a trip through a URL query string', () => {
    const values = {
      severity: ['high'],
      textSearch: { value: 'a b&c,d=é', fields: ['component_name'] },
    };
    const encoded = encodeFilters([severity, text], values);
    const search = new URLSearchParams(encoded).toString();
    const query = Object.fromEntries(new URLSearchParams(search));
    expect(decodeFilters([severity, text], query)).toEqual(values);
  });
});
