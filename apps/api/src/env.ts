import { Elysia, t, type UnwrapSchema } from 'elysia'
import { ParseError, Value } from 'typebox/value'

const EnvSchema = t.Object({
  PORT: t.Number({ default: 3001, minimum: 0 }),
  RECAP_YEAR: t.Number({ minimum: 0 }),
})

type Env = UnwrapSchema<typeof EnvSchema>

let _env: Env
try {
  const coerced = Value.Convert(EnvSchema, Value.Default(EnvSchema, Value.Clone(Bun.env)))
  _env = Value.Parse(EnvSchema, coerced)
} catch (e) {
  if (e instanceof ParseError) {
    const formatted = e.cause.errors.reduce<Record<string, string>>(
      (acc, err) => ({ ...acc, [err.instancePath.slice(1)]: err.message }),
      {}
    )
    console.error('❌ Invalid environment variables:', formatted)
  }
  process.exit(1)
}

export const env = _env
export const envPlugin = new Elysia({ name: 'env' }).decorate({ env })
