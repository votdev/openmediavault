// https://thymikee.github.io/jest-preset-angular/docs
const esModules = [
  '@codemirror/legacy-modes',
  '@jsverse',
  'ansi-regex',
  'rxjs',
  'strip-ansi',
  'marked'
];
module.exports = {
  testTimeout: 10000,
  moduleNameMapper: {
    // The package exports `marker` for ESM only.
    '^@jsverse/transloco-keys-manager/marker$':
      '<rootDir>/node_modules/@jsverse/transloco-keys-manager/marker.js',
    '~/(.*)$': '<rootDir>/src/$1'
  },
  preset: 'jest-preset-angular',
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|'.concat(esModules.join('|'), ')')]
};
