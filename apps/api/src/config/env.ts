import { Elysia } from 'elysia'

function parseEnv() {
  const portStr = Bun.env.PORT
  const yearStr = Bun.env.RECAP_YEAR

  const PORT = portStr !== undefined ? parseInt(portStr, 10) : 3001
  const RECAP_YEAR = yearStr !== undefined ? parseInt(yearStr, 10) : NaN

  const errors: Record<string, string> = {}

  if (!yearStr) {
    errors['RECAP_YEAR'] = 'Required'
  } else if (isNaN(RECAP_YEAR)) {
    errors['RECAP_YEAR'] = 'Must be a numeric year'
  }

  if (portStr !== undefined && isNaN(PORT)) {
    errors['PORT'] = 'Must be a numeric port'
  }

  if (Object.keys(errors).length > 0) {
    console.error('❌ Invalid environment variables:', errors)
    process.exit(1)
  }

  return { PORT, RECAP_YEAR: RECAP_YEAR as number }
}

export const env = parseEnv()

export const envPlugin = new Elysia({ name: 'env' }).decorate({ env })
