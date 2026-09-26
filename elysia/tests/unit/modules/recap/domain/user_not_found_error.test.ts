import { describe, expect, test } from 'bun:test'
import { UserNotFoundError } from '#recap/domain/user_not_found_error'

describe('UserNotFoundError', () => {
  test('carries the slug and a descriptive message', () => {
    const error = new UserNotFoundError('user/does-not-exist')

    expect(error).toBeInstanceOf(Error)
    expect(error.slug).toBe('user/does-not-exist')
    expect(error.message).toBe('No start.gg user found for slug: user/does-not-exist')
    expect(error.name).toBe('UserNotFoundError')
  })
})
