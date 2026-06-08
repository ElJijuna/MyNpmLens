import type { Config } from 'jest';
import superJestConfig from 'super-configs/jest';

const config: Config = {
  ...superJestConfig,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^react-i18next$': '<rootDir>/src/__mocks__/react-i18next.ts',
    '^i18next$': '<rootDir>/src/__mocks__/i18next.ts',
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase-app.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase-auth.ts',
    '^firebase/analytics$': '<rootDir>/src/__mocks__/firebase-analytics.ts',
    '^idb$': '<rootDir>/src/__mocks__/idb.ts',
    '^@/modules/auth/proxy/firebase$': '<rootDir>/src/__mocks__/auth-firebase.ts',
    '^@/modules/auth/AuthProvider$': '<rootDir>/src/__mocks__/auth-provider.ts',
    '^@/modules/auth/hooks$': '<rootDir>/src/__mocks__/auth-hooks.ts',
    '^@api-hooks/gh$': '<rootDir>/src/__mocks__/api-hooks-gh.ts',
    '^@api-hooks/npm$': '<rootDir>/src/__mocks__/api-hooks-npm.ts',
    '^@api-hooks/bp$': '<rootDir>/src/__mocks__/api-hooks-bp.ts',
    '^@api-hooks/osv$': '<rootDir>/src/__mocks__/api-hooks-osv.ts',
    '^@gnome-ui/layout/components/Toast$': '<rootDir>/src/__mocks__/gnome-ui-layout-toast.ts',
    '^@gnome-ui/charts$': '<rootDir>/src/__mocks__/gnome-ui-charts.ts',
    '^virtual:pwa-register/react$': '<rootDir>/src/__mocks__/pwa-register.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.app.json' }],
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/routeTree.gen.ts',
    '!src/main.tsx',
  ],
};

export default config;
