module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Tests cover plain-JS modules, so only those count towards coverage.
  collectCoverageFrom: ['src/mixins/**/*.js', 'src/shared/**/*.js'],
};
