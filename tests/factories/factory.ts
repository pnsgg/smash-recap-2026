import { faker } from '@faker-js/faker'

type Ctx = { faker: typeof faker }

export class Factory<T, TAttributes extends object> {
  private states = new Map<
    string,
    (attrs: TAttributes, ctx: Ctx) => Partial<TAttributes>
  >()
  private appliedStates: string[] = []
  private overrides: Partial<TAttributes> = {}

  private constructor(
    private attributesFn: (ctx: Ctx) => TAttributes,
    private buildFn: (attrs: TAttributes) => T,
  ) {}

  static define<T, TAttributes extends object>(
    attributesFn: (ctx: Ctx) => TAttributes,
    buildFn: (attrs: TAttributes) => T,
  ) {
    return new Factory<T, TAttributes>(attributesFn, buildFn)
  }

  state(
    name: string,
    fn: (attrs: TAttributes, ctx: Ctx) => Partial<TAttributes>,
  ) {
    this.states.set(name, fn)
    return this
  }

  apply(...names: string[]) {
    const clone = this.clone()
    clone.appliedStates.push(...names)
    return clone
  }

  merge(overrides: Partial<TAttributes>) {
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
    const c = new Factory<T, TAttributes>(this.attributesFn, this.buildFn)
    c.states = this.states
    c.appliedStates = [...this.appliedStates]
    c.overrides = { ...c.overrides }
    return c
  }
}
