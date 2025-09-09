import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsonc from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';
import eslintGlobals from 'globals';

// 尝试直接导入Airbnb规则配置
import airbnbBaseRules from 'eslint-config-airbnb-base/rules/style';

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
      ...eslintGlobals.browser,
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
      ...eslintGlobals.node,
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
    jsonc: pluginJsonc,
  },
  rules: {
    'jsonc/indent': ['error', 2],
    'jsonc/sort-keys': 'off',
    'jsonc/array-bracket-spacing': ['error', 'never'],
    'jsonc/comma-dangle': ['error', 'never'],
    'jsonc/object-curly-spacing': ['error', 'always'],
  },
};

// 创建包含Airbnb风格规则的配置对象，分两部分配置
// 1. TypeScript文件配置
const airbnbTsConfig = {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
    },
    globals: {
      ...eslintGlobals.browser,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
    react: pluginReact,
    'react-hooks': pluginReactHooks,
  },
  rules: {
    // 应用Airbnb基础风格规则（如果成功导入）
    ...(typeof airbnbBaseRules !== 'undefined' && airbnbBaseRules.rules ? airbnbBaseRules.rules : {}),

    // 手动配置一些常见的Airbnb规则
    // 风格指南 - 缩进
    indent: ['error', 2, { SwitchCase: 1 }],
    // 风格指南 - 引号
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    // 风格指南 - 分号
    semi: ['error', 'always'],
    // 风格指南 - 空格
    'space-before-function-paren': ['error', 'never'],
    // 风格指南 - 花括号
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],

    // 禁用行尾字符检查（Windows使用CRLF，而Airbnb规则期望LF）
    'linebreak-style': 'off',

    // 保持一些现有规则的覆盖
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

// 2. JavaScript文件配置
const airbnbJsConfig = {
  files: ['**/*.js', '**/*.jsx'],
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    globals: {
      ...eslintGlobals.browser,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
    react: pluginReact,
    'react-hooks': pluginReactHooks,
  },
  rules: {
    // 应用Airbnb基础风格规则（如果成功导入）
    ...(typeof airbnbBaseRules !== 'undefined' && airbnbBaseRules.rules ? airbnbBaseRules.rules : {}),

    // 手动配置一些常见的Airbnb规则
    // 风格指南 - 缩进
    indent: ['error', 2, { SwitchCase: 1 }],
    // 风格指南 - 引号
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    // 风格指南 - 分号
    semi: ['error', 'always'],
    // 风格指南 - 空格
    'space-before-function-paren': ['error', 'never'],
    // 风格指南 - 花括号
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],

    // 禁用行尾字符检查（Windows使用CRLF，而Airbnb规则期望LF）
    'linebreak-style': 'off',

    // 保持一些现有规则的覆盖
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

export default [
  ignoreConfig,
  jsConfig,
  airbnbTsConfig,
  airbnbJsConfig,
  serverConfig,
  configFilesConfig,
  configFileSupport,
  jsonConfig,
];
