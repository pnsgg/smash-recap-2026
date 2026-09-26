import { Elysia, t } from 'elysia'
import { env } from '@yolk-oss/elysia-env'

export const envPlugin = new Elysia().use(
  env({
    PORT: t.Numeric({ default: 3001 }),
    RECAP_YEAR: t.Numeric(),
  })
)
