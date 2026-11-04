export function enrichSchema(propSchema, propName, parentSchema) {
  return {
    ...propSchema,
    isRequired: parentSchema?.required?.includes(propName) || false,
  };
}

export function getDefaultValue(schema, { arrayItem = false } = {}) {
  if (schema?.default !== undefined) {
    return structuredClone(schema.default);
  }
  switch (schema?.type) {
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'string':
      return arrayItem ? '' : null;
    case 'number':
    case 'integer':
      return arrayItem ? 0 : null;
    default:
      return null;
  }
}

export function buildNestedValidationErrorMap(errors) {
  const result = {};
  if (!errors) {
    return result;
  }
  Object.keys(errors).forEach((key) => {
    const dotIdx = key.indexOf('.');
    if (dotIdx < 0) {
      return;
    }
    const head = key.slice(0, dotIdx);
    const tail = key.slice(dotIdx + 1);
    if (!result[head]) {
      result[head] = {};
    }
    result[head][tail] = errors[key];
  });
  return result;
}

export function registerCustomKeywords(ajv) {
  ajv.addKeyword({
    keyword: 'x-unique-item-properties',
    type: 'array',
    schemaType: 'array',
    errors: true,
    validate: function validate(props, data, _parentSchema, dataCxt) {
      const errors = [];
      props.forEach((prop) => {
        const seen = new Map();
        data.forEach((item, index) => {
          const value = item?.[prop];
          if (value === undefined) return;
          const key = JSON.stringify(value);
          if (!seen.has(key)) {
            seen.set(key, index);
            return;
          }
          [seen.get(key), index].forEach((i) =>
            errors.push({
              keyword: 'x-unique-item-properties',
              instancePath: `${dataCxt.instancePath}/${i}/${prop}`,
              params: { property: prop },
              message: 'must be unique',
            }),
          );
        });
      });
      validate.errors = errors;
      return errors.length === 0;
    },
  });
}
