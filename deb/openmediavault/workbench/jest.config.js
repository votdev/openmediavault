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
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        // `@angular-builders/jest` sets the deprecated ts-jest option
        // `isolatedModules: true`. Reset it here, the effective value is
        // taken from `tsconfig.spec.json`.
        isolatedModules: false
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|'.concat(esModules.join('|'), ')')]
};
