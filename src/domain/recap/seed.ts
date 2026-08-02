export class Seed {
  constructor(
    public readonly initialSeed: number,
    public readonly finalPlacement: number,
  ) {
    if (initialSeed <= 0) {
      throw new Error(
        `Invalid parameter seed: ${initialSeed}. Value has to be strictly positive.`,
      )
    }
    if (finalPlacement <= 0) {
      throw new Error(
        `Invalid parameter final placement: ${finalPlacement}. Values has to be strictly positive.`,
      )
    }
  }
}
