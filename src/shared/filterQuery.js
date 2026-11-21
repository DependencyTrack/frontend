// Converts filter pill values to and from URL query parameters.
//
// Parameter names are the REST API's, so one encoder serves both the address
// bar and the request URL. A filter def is
// `{ name, type, param?, options?, fields?, min?, max? }` where `type` is one of
// 'multiselect', 'boolean', 'text', 'daterange' or 'numrange'. `param` is the
// API's name where it differs from `name`; `text` and ranges add the
// Input/Field and From/To suffixes to it.
//
// Query values are untrusted: decoding drops what a filter could not have
// produced, so the result is at worst a narrower filter than the URL asked for.

const DATE_ONLY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const NUMBER_PATTERN = /^\d+(\.\d+)?$/;

const paramOf = (def) => def.param || def.name;

// Vue Router yields null for a bare `?flag` and an array for a repeated key.
const single = (query, key) => {
  const raw = query[key];
  const value = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  if (value === undefined) return undefined;
  return value === null ? '' : String(value);
};

const splitList = (raw) =>
  (raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

function pickAllowed(raw, allowed) {
  const byLowerCase = new Map(
    allowed.map((value) => [value.toLowerCase(), value]),
  );
  const picked = splitList(raw)
    .map((entry) => byLowerCase.get(entry.toLowerCase()))
    .filter((value) => value !== undefined);
  return [...new Set(picked)];
}

// Rejects impossible dates such as 2024-02-30 by round-tripping through Date.
function parseDate(raw) {
  if (!DATE_ONLY_PATTERN.test(raw || '')) return null;
  const parsed = new Date(`${raw}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === raw
    ? raw
    : null;
}

// Out-of-range bounds are rejected, not clamped: a clamped bound would be a
// filter nobody asked for.
function parseNumber(raw, def) {
  if (!NUMBER_PATTERN.test(raw || '')) return null;
  const parsed = Number(raw);
  if (typeof def.min === 'number' && parsed < def.min) return null;
  if (typeof def.max === 'number' && parsed > def.max) return null;
  return parsed;
}

function rangeCodec(lowKey, highKey, parseBound, rejectInverted) {
  return {
    keys: (def) => [`${paramOf(def)}From`, `${paramOf(def)}To`],
    empty: () => null,
    encode: (def, value) => {
      const encoded = {};
      // `!= null` rather than truthiness, so a bound of 0 survives.
      if (value && value[lowKey] != null)
        encoded[`${paramOf(def)}From`] = String(value[lowKey]);
      if (value && value[highKey] != null)
        encoded[`${paramOf(def)}To`] = String(value[highKey]);
      return encoded;
    },
    decode: (def, query) => {
      const low = parseBound(single(query, `${paramOf(def)}From`), def);
      const high = parseBound(single(query, `${paramOf(def)}To`), def);
      if (low === null && high === null) return null;
      if (rejectInverted && low !== null && high !== null && low > high)
        return null;
      // Both keys always present, as the pills emit them.
      return { [lowKey]: low, [highKey]: high };
    },
  };
}

const CODECS = {
  boolean: {
    keys: (def) => [paramOf(def)],
    empty: () => false,
    encode: (def, value) => (value === true ? { [paramOf(def)]: 'true' } : {}),
    // A bare `?flag` means on, so only an explicit false or 0 means off.
    decode: (def, query) => {
      const value = single(query, paramOf(def));
      return value !== undefined && !/^(false|0)$/i.test(value);
    },
  },
  multiselect: {
    keys: (def) => [paramOf(def)],
    empty: () => [],
    encode: (def, value) =>
      Array.isArray(value) && value.length > 0
        ? { [paramOf(def)]: value.join(',') }
        : {},
    decode: (def, query) =>
      pickAllowed(
        single(query, paramOf(def)),
        (def.options || []).map((option) => option.value),
      ),
  },
  text: {
    keys: (def) => [`${paramOf(def)}Input`, `${paramOf(def)}Field`],
    empty: () => null,
    encode: (def, value) => {
      if (!value || !value.value) return {};
      const encoded = { [`${paramOf(def)}Input`]: value.value };
      if ((value.fields || []).length > 0)
        encoded[`${paramOf(def)}Field`] = value.fields.join(',');
      return encoded;
    },
    decode: (def, query) => {
      const input = (single(query, `${paramOf(def)}Input`) || '').trim();
      if (!input) return null;
      const allowed = (def.fields || []).map((field) => field.value);
      const fields = pickAllowed(
        single(query, `${paramOf(def)}Field`),
        allowed,
      );
      // Like the pill, search every field unless told otherwise.
      return { value: input, fields: fields.length > 0 ? fields : allowed };
    },
  },
  daterange: rangeCodec('since', 'before', parseDate, false),
  numrange: rangeCodec('from', 'to', parseNumber, true),
};

export const emptyFilterValue = (def) => CODECS[def.type].empty();

// Every query parameter the filters may write, for telling them from the rest.
export const filterQueryKeys = (defs) =>
  new Set(defs.flatMap((def) => CODECS[def.type].keys(def)));

// `values` is keyed by def name; the result holds string values only.
export const encodeFilters = (defs, values) =>
  Object.assign(
    {},
    ...defs.map((def) => CODECS[def.type].encode(def, values[def.name])),
  );

// Always yields a value for every def: the empty one where the query has none.
export const decodeFilters = (defs, query) =>
  Object.fromEntries(
    defs.map((def) => [def.name, CODECS[def.type].decode(def, query)]),
  );
