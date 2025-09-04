import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsonc from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';

// 基础配置
const jsConfig = pluginJs.configs.recommended;

// 普通TypeScript文件配置
const tsConfig = {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
    },
    globals: {
      ...globals.browser,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};

// 服务器端代码配置
const serverConfig = {
  files: ['server/**/*.ts', 'server/**/*.js'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './server/tsconfig.json',
    },
    globals: {
      ...globals.node,
    },
  },
  rules: {
    'no-undef': 'off',
  },
};

// 配置文件特殊处理
const configFilesConfig = {
  files: ['**/vite.config.ts', '**/*.config.ts'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: null,
    },
    globals: {
      ...globals.node,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};

// React配置
const reactConfig = {
  files: ['**/*.jsx', '**/*.tsx'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: {
    react: pluginReact,
    'react-hooks': pluginReactHooks,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

// 忽略配置
const ignoreConfig = {
  ignores: [
    'node_modules/',
    'dist/',
    'server/dist/',
    'build/',
    '.env*',
    'logs',
    '*.log',
    'pids',
    '*.pid',
    '*.seed',
    '*.pid.lock',
    'coverage/',
    '*.lcov',
    '.nyc_output',
    '.DS_Store',
    'Thumbs.db',
    '.idea',
    '.vscode',
  ],
};

// 配置文件支持
const configFileSupport = {
  files: ['.eslintrc.js', '.prettierrc.js', 'vite.config.js'],
  languageOptions: {
    globals: {
      ...globals.node,
    },
    sourceType: 'commonjs',
  },
  rules: {
    'no-undef': 'off',
  },
};

// JSON文件配置
const jsonConfig = {
  files: ['**/*.json'],
  languageOptions: {
    parser: jsoncParser,
  },
  plugins: {
    'jsonc': pluginJsonc,
  },
  rules: {
    'jsonc/indent': ['error', 2],
    'jsonc/sort-keys': 'off',
    'jsonc/array-bracket-spacing': ['error', 'never'],
    'jsonc/comma-dangle': ['error', 'never'],
    'jsonc/object-curly-spacing': ['error', 'always'],
  },
};

export default [
  ignoreConfig,
  jsConfig,
  tsConfig,
  serverConfig,
  configFilesConfig,
  configFileSupport,
  reactConfig,
  jsonConfig,
];