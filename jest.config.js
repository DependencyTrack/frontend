module.exports = {
  testEnvironment: 'jsdom',
  // Pinning the origin keeps getContextPath() and isUrlSaveForRedirect()
  // deterministic instead of depending on Jest's default URL.
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  // src is listed so that files matched by collectCoverageFrom but not reached
  // by any spec are still reported as uncovered rather than omitted entirely.
  // testMatch keeps test discovery itself confined to tests/unit.
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  // Restricted to tests/unit so the mocks, stubs and support helpers can never
  // be picked up as suites.
  testMatch: ['<rootDir>/tests/unit/**/*.spec.js'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    // Must precede the generic '@/' alias below: the real module calls
    // webpack's require.context() and fetches the default locale over HTTP at
    // import time, neither of which works under Jest.
    '^@/i18n$': '<rootDir>/tests/mocks/i18n.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    // The package entrypoint is the runtime-only build, so string templates
    // used by test host components and stubs would not compile.
    '^vue$': '<rootDir>/node_modules/vue/dist/vue.common.js',
    // Components pull in stylesheets that Jest cannot parse and that say
    // nothing about behaviour.
    '\\.(css|less|sass|scss|styl)$': '<rootDir>/tests/stubs/styleStub.js',
    '\\.(png|jpe?g|gif|svg|webp|avif|woff2?|ttf|eot)$':
      '<rootDir>/tests/stubs/fileStub.js',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest',
  },
  // flexver publishes ESM at 'flexver/dist/module' and lodash-es is ESM only;
  // both need transpiling before Jest can require them.
  transformIgnorePatterns: ['/node_modules/(?!(flexver|lodash-es)/)'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/mixins/**/*.js',
    'src/shared/**/*.js',
    'src/views/components/*FilterPill*.vue',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],
  // Jest removes any file matched by a path key from the global bucket, so the
  // carve-outs below are limited to the two files where a silent regression is
  // a security problem: permissions.js gates authorization, and utils.js holds
  // the open-redirect guard.
  //
  // The global figures are the measured values rounded down, covering the rest
  // of collectCoverageFrom - including the mixins and filter pills that have no
  // specs yet, which is what keeps that debt visible.
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 35,
      functions: 35,
      lines: 45,
    },
    'src/shared/permissions.js': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    'src/shared/utils.js': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
};
