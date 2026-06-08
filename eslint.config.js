import eslintReactTsx from 'super-configs/eslint/react/tsx';

export default [
  { ignores: ['dist', 'docs', 'src/routeTree.gen.ts', 'coverage'] },
  ...eslintReactTsx,
];
