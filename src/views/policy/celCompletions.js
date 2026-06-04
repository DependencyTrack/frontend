import { snippetCompletion } from '@codemirror/autocomplete';

function nullaryFunc(label, returnType) {
  return snippetCompletion(`${label}()`, {
    label,
    detail: `() \u2192 ${returnType}`,
    type: 'function',
  });
}

function unaryFunc(label, param, returnType) {
  return snippetCompletion(`${label}(\${1:${param}})`, {
    label,
    detail: `(${param}) \u2192 ${returnType}`,
    type: 'function',
  });
}

function binaryFunc(label, params, returnType) {
  const args = params.map((p, i) => `\${${i + 1}:${p}}`).join(', ');
  return snippetCompletion(`${label}(${args})`, {
    label,
    detail: `(${params.join(', ')}) \u2192 ${returnType}`,
    type: 'function',
  });
}

const TYPES = {
  Component: {
    uuid: 'string',
    group: 'string',
    name: 'string',
    version: 'string',
    classifier: 'string',
    cpe: 'string',
    purl: 'string',
    swid_tag_id: 'string',
    is_internal: 'bool',
    md5: 'string',
    sha1: 'string',
    sha256: 'string',
    sha384: 'string',
    sha512: 'string',
    sha3_256: 'string',
    sha3_384: 'string',
    sha3_512: 'string',
    blake2b_256: 'string',
    blake2b_384: 'string',
    blake2b_512: 'string',
    blake3: 'string',
    license_name: 'string',
    license_expression: 'string',
    resolved_license: 'License',
    published_at: 'Timestamp',
    latest_version: 'string',
    latest_version_published_at: 'Timestamp',
    package_artifact_md5: 'string',
    package_artifact_sha1: 'string',
    package_artifact_sha256: 'string',
    package_artifact_sha512: 'string',
  },
  License: {
    uuid: 'string',
    id: 'string',
    name: 'string',
    groups: 'repeated License.Group',
    is_osi_approved: 'bool',
    is_fsf_libre: 'bool',
    is_deprecated_id: 'bool',
    is_custom: 'bool',
  },
  'License.Group': {
    uuid: 'string',
    name: 'string',
  },
  Project: {
    uuid: 'string',
    group: 'string',
    name: 'string',
    version: 'string',
    classifier: 'string',
    is_active: 'bool',
    tags: 'repeated string',
    properties: 'repeated Project.Property',
    cpe: 'string',
    purl: 'string',
    swid_tag_id: 'string',
    last_bom_import: 'Timestamp',
    metadata: 'Project.Metadata',
  },
  'Project.Metadata': {
    tools: 'Tools',
    bom_generated: 'Timestamp',
  },
  'Project.Property': {
    group: 'string',
    name: 'string',
    value: 'string',
    type: 'string',
  },
  Tools: {
    components: 'repeated Component',
  },
  Vulnerability: {
    uuid: 'string',
    id: 'string',
    source: 'string',
    aliases: 'repeated Vulnerability.Alias',
    cwes: 'repeated int',
    created: 'Timestamp',
    published: 'Timestamp',
    updated: 'Timestamp',
    severity: 'string',
    cvssv2_base_score: 'double',
    cvssv2_impact_subscore: 'double',
    cvssv2_exploitability_subscore: 'double',
    cvssv2_vector: 'string',
    cvssv3_base_score: 'double',
    cvssv3_impact_subscore: 'double',
    cvssv3_exploitability_subscore: 'double',
    cvssv3_vector: 'string',
    owasp_rr_likelihood_score: 'double',
    owasp_rr_technical_impact_score: 'double',
    owasp_rr_business_impact_score: 'double',
    owasp_rr_vector: 'string',
    epss_score: 'double',
    epss_percentile: 'double',
    cvssv4_vector: 'string',
    cvssv4_score: 'double',
  },
  'Vulnerability.Alias': {
    id: 'string',
    source: 'string',
  },
  Timestamp: {
    seconds: 'int',
    nanos: 'int',
  },
};

const TOP_LEVEL = {
  component: 'Component',
  project: 'Project',
  vulns: 'repeated Vulnerability',
  now: 'Timestamp',
};

const PRIMITIVES = ['string', 'bool', 'int', 'double', 'float', 'uint'];

const STRING_METHODS = [
  unaryFunc('contains', 'substr', 'bool'),
  unaryFunc('endsWith', 'suffix', 'bool'),
  unaryFunc('matches', 'regex', 'bool'),
  unaryFunc('startsWith', 'prefix', 'bool'),
  nullaryFunc('size', 'int'),
];

const LIST_METHODS = [
  binaryFunc('all', ['x', 'predicate'], 'bool'),
  binaryFunc('exists', ['x', 'predicate'], 'bool'),
  binaryFunc('exists_one', ['x', 'predicate'], 'bool'),
  binaryFunc('filter', ['x', 'predicate'], 'list'),
  binaryFunc('map', ['x', 'expr'], 'list'),
  nullaryFunc('size', 'int'),
];

const TIMESTAMP_METHODS = [
  nullaryFunc('getDate', 'int'),
  nullaryFunc('getDayOfMonth', 'int'),
  nullaryFunc('getDayOfWeek', 'int'),
  nullaryFunc('getDayOfYear', 'int'),
  nullaryFunc('getFullYear', 'int'),
  nullaryFunc('getHours', 'int'),
  nullaryFunc('getMilliseconds', 'int'),
  nullaryFunc('getMinutes', 'int'),
  nullaryFunc('getMonth', 'int'),
  nullaryFunc('getSeconds', 'int'),
];

const TYPE_METHODS = {
  Component: [
    nullaryFunc('has_package_artifact_hash_mismatch', 'bool'),
    unaryFunc('is_dependency_of', 'v1.Component{}', 'bool'),
    unaryFunc('is_direct_dependency_of', 'v1.Component{}', 'bool'),
    unaryFunc('is_exclusive_dependency_of', 'v1.Component{}', 'bool'),
    unaryFunc('matches_range', 'vers_range', 'bool'),
    binaryFunc(
      'version_distance',
      ['operator', 'v1.VersionDistance{}'],
      'bool',
    ),
  ],
  Project: [
    unaryFunc('depends_on', 'v1.Component{}', 'bool'),
    unaryFunc('matches_range', 'vers_range', 'bool'),
  ],
};

const CEL_GLOBALS = [
  unaryFunc('has', 'field', 'bool'),
  unaryFunc('size', 'value', 'int'),
  unaryFunc('int', 'value', 'int'),
  unaryFunc('uint', 'value', 'uint'),
  unaryFunc('double', 'value', 'double'),
  unaryFunc('string', 'value', 'string'),
  unaryFunc('timestamp', 'string', 'Timestamp'),
  unaryFunc('duration', 'string', 'Duration'),
  binaryFunc('spdx_expr_allows', ['expression', 'ids'], 'bool'),
  binaryFunc('spdx_expr_requires_any', ['expression', 'ids'], 'bool'),
  { label: 'true', type: 'keyword' },
  { label: 'false', type: 'keyword' },
  { label: 'null', type: 'keyword' },
  { label: 'in', type: 'keyword', detail: 'membership test' },
];

// Scans text for macro bindings like `vulns.exists(v,` and returns a map of
// identifier name -> element type (e.g. { v: 'Vulnerability' }).
// Relies on left-to-right regex matching so outer bindings are resolved
// before inner ones (e.g. `v` is known when resolving `v.aliases.exists(a,`).
function findMacroBindings(text, topLevel) {
  const bindings = {};
  const re =
    /(\w+(?:\.\w+)*)\.(exists_one|exists|all|filter|map)\(\s*(\w+)\s*,/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const listPath = m[1];
    const varName = m[3];
    const rawType = resolveFieldType(listPath, bindings, topLevel);
    if (rawType && rawType.startsWith('repeated ')) {
      bindings[varName] = rawType.replace(/^repeated\s+/, '');
    }
  }
  return bindings;
}

// Returns the raw type string (e.g. "string", "repeated Vulnerability", "License").
// When traversing intermediate path segments, repeated types are only resolved
// if the variable comes from a macro binding (i.e. iterating over the list).
function resolveFieldType(path, macroBindings, topLevel) {
  const parts = path.split('.');
  let rawType = topLevel[parts[0]];
  if (!rawType && macroBindings && macroBindings[parts[0]]) {
    rawType = macroBindings[parts[0]];
  }
  if (!rawType) {
    return null;
  }

  for (let i = 1; i < parts.length; i++) {
    if (rawType.startsWith('repeated ')) {
      return null;
    }
    const fields = TYPES[rawType];
    if (!fields || !fields[parts[i]]) {
      return null;
    }
    rawType = fields[parts[i]];
  }
  return rawType;
}

function methodsForType(rawType) {
  if (!rawType) {
    return [];
  }
  const isRepeated = rawType.startsWith('repeated ');
  if (isRepeated) {
    return LIST_METHODS;
  }
  if (rawType === 'string') {
    return STRING_METHODS;
  }
  if (rawType === 'Timestamp') {
    return TIMESTAMP_METHODS;
  }
  return TYPE_METHODS[rawType] || [];
}

export function createCelCompletionSource(topLevelOverrides) {
  const mergedTopLevel = Object.fromEntries(
    Object.entries({ ...TOP_LEVEL, ...topLevelOverrides }).filter(
      ([, v]) => v !== undefined,
    ),
  );

  return function (context) {
    const beforeCursor = context.state.doc.sliceString(0, context.pos);

    const macroBindings = findMacroBindings(beforeCursor, mergedTopLevel);

    const dotMatch = beforeCursor.match(/(\w+(?:\.\w+)*)\.(\w*)$/);
    if (dotMatch) {
      const path = dotMatch[1];
      const partial = dotMatch[2];
      const rawType = resolveFieldType(path, macroBindings, mergedTopLevel);
      if (!rawType) {
        return null;
      }

      const isRepeated = rawType.startsWith('repeated ');
      const baseType = rawType.replace(/^repeated\s+/, '');
      const fields =
        !isRepeated && !PRIMITIVES.includes(baseType) ? TYPES[baseType] : null;
      const fieldOptions = fields
        ? Object.entries(fields).map(([field, fieldType]) => ({
            label: field,
            type: 'property',
            detail: fieldType,
          }))
        : [];
      const methods = methodsForType(rawType);

      if (fieldOptions.length === 0 && methods.length === 0) {
        return null;
      }

      return {
        from: context.pos - partial.length,
        options: [...fieldOptions, ...methods],
        validFor: /^\w*$/,
      };
    }

    const word = context.matchBefore(/\w+/);
    if (!word && !context.explicit) {
      return null;
    }

    const topLevelOptions = Object.keys(mergedTopLevel).map((name) => ({
      label: name,
      type: 'variable',
      detail: mergedTopLevel[name],
    }));

    return {
      from: word ? word.from : context.pos,
      options: [...topLevelOptions, ...CEL_GLOBALS],
      validFor: /^\w*$/,
    };
  };
}

export const celCompletionSource = createCelCompletionSource({});
