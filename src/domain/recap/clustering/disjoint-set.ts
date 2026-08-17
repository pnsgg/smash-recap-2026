export class DisjointSet {
  private readonly parent: number[]

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
  }

  public find(i: number): number {
    if (this.parent[i] === i) return i

    const root = this.find(this.parent[i])
    this.parent[i] = root

    return root
  }

  public union(i: number, j: number): void {
    const rootI = this.find(i)
    const rootJ = this.find(j)

    if (rootI !== rootJ) this.parent[rootI] = rootJ
  }
}
