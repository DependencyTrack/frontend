module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Components pull in stylesheets that Jest cannot parse and that say
    // nothing about behaviour.
    '\\.(css|scss|sass)$': '<rootDir>/tests/stubs/styleStub.js',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest',
  },
  collectCoverageFrom: [
    'src/mixins/**/*.js',
    'src/shared/**/*.js',
    'src/views/components/*FilterPill*.vue',
  ],
};
