export class UserNotFoundError extends Error {
  constructor(public readonly slug: string) {
    super(`No start.gg user found for slug: ${slug}`)
    this.name = 'UserNotFoundError'
  }
}
