// tests/factories/factory.ts
import { faker } from '@faker-js/faker'

type Ctx = { faker: typeof faker }

export class Factory<T, A extends object> {
  private states = new Map<string, (attrs: A, ctx: Ctx) => Partial<A>>()
  private appliedStates: string[] = []
  private overrides: Partial<A> = {}

  private constructor(
    private attributesFn: (ctx: Ctx) => A,
    private buildFn: (attrs: A) => T
  ) {}

  static define<T, A extends object>(
    attributesFn: (ctx: Ctx) => A,
    buildFn: (attrs: A) => T
  ) {
    return new Factory<T, A>(attributesFn, buildFn)
  }

  state(name: string, fn: (attrs: A, ctx: Ctx) => Partial<A>) {
    this.states.set(name, fn)
    return this
  }

  apply(...names: string[]) {
    const clone = this.clone()
    clone.appliedStates.push(...names)
    return clone
  }

  merge(overrides: Partial<A>) {
    const clone = this.clone()
    clone.overrides = { ...clone.overrides, ...overrides }
    return clone
  }

  make(): T {
    const ctx: Ctx = { faker }
    let attrs = this.attributesFn(ctx)
    for (const name of this.appliedStates) {
      attrs = { ...attrs, ...this.states.get(name)?.(attrs, ctx) }
    }
    attrs = { ...attrs, ...this.overrides }
    return this.buildFn(attrs)
  }

  makeMany(count: number): T[] {
    return Array.from({ length: count }, () => this.make())
  }

  private clone() {
    const c = new Factory<T, A>(this.attributesFn, this.buildFn)
    c.states = this.states
    c.appliedStates = [...this.appliedStates]
    c.overrides = { ...this.overrides }
    return c
  }
}
