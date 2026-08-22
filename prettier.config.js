import adonisPrettierConfig from '@adonisjs/prettier-config'

export default {
  ...adonisPrettierConfig,
  plugins: [...(adonisPrettierConfig.plugins || []), '@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^node:',
    '<THIRD_PARTY_MODULES>',
    '^@adonisjs/(.*)$',
    '^#app/(.*)$',
    '^#recap/(.*)$',
    '^#search/(.*)$',
    '^#shared/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
}
