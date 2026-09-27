import { treaty } from '@elysiajs/eden'
import type { App } from '@api'

export type { App }

/**
 * End-to-end typed HTTP client for the recap API (Eden Treaty).
 * Point it at wherever the api app is deployed, e.g. createApiClient('http://localhost:3001').
 */
export const createApiClient = (url: string) => treaty<App>(url)
