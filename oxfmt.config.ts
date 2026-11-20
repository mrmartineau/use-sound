import kit from '@mrmartineau/kit/oxfmt' with { type: 'json' }

export default {
  ...kit,
  ignorePatterns: ['**/*.md', '**/*.mdx', '**/*.yml', '**/*.yaml', '**/*.html'],
}
