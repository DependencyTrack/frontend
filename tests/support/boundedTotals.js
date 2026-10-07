/**
 * Helpers for the X-Total-Count / X-Total-Count-Type protocol behind the
 * bounded row counts in the findings views.
 */

export function rows(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

function xhrWith(headers) {
  return {
    getResponseHeader: (name) =>
      Object.prototype.hasOwnProperty.call(headers, name)
        ? headers[name]
        : null,
  };
}

export function exactXhr(total) {
  return xhrWith({ 'X-Total-Count': total });
}

export function boundedXhr(total) {
  return xhrWith({
    'X-Total-Count': total,
    'X-Total-Count-Type': 'AT_LEAST',
  });
}

/**
 * Builds a view's bootstrap-table options without mounting it. data() only
 * needs $t, the api base and the handful of methods it calls while assembling
 * the column and option definitions.
 */
export function tableOptionsOf(component, overrides = {}) {
  return component.data.call({
    $t: (key) => key,
    $api: { BASE_URL: '/api/v1', URL_FINDING: 'finding' },
    apiUrl: () => '/api/v1/finding',
    vueFormatter: () => '',
    ...overrides,
  }).options;
}
