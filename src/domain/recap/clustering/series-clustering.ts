import type { Tournament } from '#/domain/recap/tournament'
import { DisjointSet } from '#/domain/recap/clustering/disjoint-set'

export class ClusteredSeries {
  constructor(
    public readonly seriesName: string,
    public readonly tournaments: Tournament[],
  ) {}

  count(): number {
    return this.tournaments.length
  }
}

/**
 * Groups related tournaments into recurring series.
 */
export class SeriesClustering {
  /**
   * @param threshold - The Cosine Similarity threshold (default: 0.50)
   */
  constructor(private readonly threshold = 0.5) {}

  /**
   * Clusters a list of tournaments into series.
   */
  public cluster(tournaments: Tournament[]): ClusteredSeries[] {
    const n = tournaments.length
    if (n === 0) return []

    // 1. Tokenization to character bigrams
    const tournamentBigrams = tournaments.map((t) => this.tokenize(t))

    // 2. Document Frequency calculation for TF-IDF weighting
    const dfMap = this.computeDocumentFrequency(tournamentBigrams)

    // 3. TF-IDF Vectorization
    const vectors = tournamentBigrams.map((bigrams) =>
      this.vectorize(bigrams, dfMap, n),
    )

    // 4. Graph Partitioning via Connected Components (Union-Find)
    const ds = new DisjointSet(n)

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const similarity = this.cosineSimilarity(vectors[i], vectors[j])
        if (similarity >= this.threshold) {
          ds.union(i, j)
        }
      }
    }

    // 5. Group tournaments by their partition roots
    const groups = new Map<number, Tournament[]>()
    for (let i = 0; i < n; i++) {
      const root = ds.find(i)
      if (!groups.has(root)) {
        groups.set(root, [])
      }
      groups.get(root)!.push(tournaments[i])
    }

    // 6. Map components to ClusteredSeries
    return Array.from(groups.values()).map((group) => {
      const seriesName = this.resolveRepresentativeName(group)
      return new ClusteredSeries(seriesName, group)
    })
  }

  private tokenize(t: Tournament): string[] {
    const combined = this.normalize(t.name) + ' ' + this.normalize(t.slug)
    return this.getCharBigrams(combined)
  }

  private normalize(str: string | null | undefined): string {
    if (!str) return ''
    let clean = str.toLowerCase()
    if (clean.startsWith('tournament/')) {
      clean = clean.substring('tournament/'.length)
    }
    return clean
      .replace(/[_\-\/\\:#]/g, ' ') // Replace special characters with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  private getCharBigrams(str: string): string[] {
    const bigrams: string[] = []
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2))
    }
    return bigrams
  }

  private computeDocumentFrequency(
    tournamentBigrams: string[][],
  ): Map<string, number> {
    const dfMap = new Map<string, number>()
    for (const bigrams of tournamentBigrams) {
      const uniqueBigrams = new Set(bigrams)
      for (const b of uniqueBigrams) {
        dfMap.set(b, (dfMap.get(b) || 0) + 1)
      }
    }
    return dfMap
  }

  private vectorize(
    bigrams: string[],
    dfMap: Map<string, number>,
    totalDocs: number,
  ): Map<string, number> {
    const tfMap = new Map<string, number>()
    for (const b of bigrams) {
      tfMap.set(b, (tfMap.get(b) || 0) + 1)
    }

    const tfIdfMap = new Map<string, number>()
    for (const [term, tf] of tfMap.entries()) {
      const df = dfMap.get(term) || 0
      const idf = Math.log(1 + totalDocs / (1 + df)) + 1
      tfIdfMap.set(term, tf * idf)
    }
    return tfIdfMap
  }

  private cosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>,
  ): number {
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (const [term, val1] of vec1.entries()) {
      norm1 += val1 * val1
      const val2 = vec2.get(term)
      if (val2 !== undefined) {
        dotProduct += val1 * val2
      }
    }

    for (const val2 of vec2.values()) {
      norm2 += val2 * val2
    }

    if (norm1 === 0 || norm2 === 0) return 0
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  private resolveRepresentativeName(group: Tournament[]): string {
    const frequencies = new Map<string, number>()
    for (const t of group) {
      const clean = this.getCleanLabel(t.name)
      frequencies.set(clean, (frequencies.get(clean) || 0) + 1)
    }

    let bestLabel = ''
    let maxFreq = -1
    for (const [label, freq] of frequencies.entries()) {
      if (freq > maxFreq) {
        maxFreq = freq
        bestLabel = label
      } else if (freq === maxFreq && label.length < bestLabel.length) {
        bestLabel = label
      }
    }
    return bestLabel || 'Unknown Series'
  }

  private getCleanLabel(name: string): string {
    return (
      name
        .replace(/\s*[#\-]?\s*(?:\d+|[ivx]+)\s*$/gi, '') // Remove #, -, numbers, and roman numerals at the end of the string
        .trim() || name
    )
  }
}
