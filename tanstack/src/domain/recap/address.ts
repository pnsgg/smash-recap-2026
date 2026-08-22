export type AddressParams = {
  city: string | null
  state: string | null
  countryCode: string | null
  latitude: number | null
  longitude: number | null
}

export class Address {
  public readonly city: string | null
  public readonly state: string | null
  public readonly countryCode: string | null
  public readonly latitude: number | null
  public readonly longitude: number | null

  constructor(params: AddressParams) {
    this.checkPreconditions(params)
    this.city = params.city
    this.state = params.state
    this.countryCode = params.countryCode
    this.latitude = params.latitude
    this.longitude = params.longitude
  }

  private checkPreconditions(params: AddressParams) {
    if (
      params.latitude !== null &&
      (params.latitude < -90 || params.latitude > 90)
    ) {
      throw new Error(
        `Invalid parameter latitude: ${params.latitude}. Value must be between -90 and 90.`,
      )
    }
    if (
      params.longitude !== null &&
      (params.longitude < -180 || params.longitude > 180)
    ) {
      throw new Error(
        `Invalid parameter longitude: ${params.longitude}. Value must be between -180 and 180.`,
      )
    }
  }

  /**
   * Computes the distance between two addresses using the Haversine formula.
   */
  distanceTo(other: Address): number | null {
    if (
      this.latitude === null ||
      this.longitude === null ||
      other.latitude === null ||
      other.longitude === null
    ) {
      return null
    }

    const R = 6371 // Earth's radius in kilometers
    const dLat = ((other.latitude - this.latitude) * Math.PI) / 180
    const dLon = ((other.longitude - this.longitude) * Math.PI) / 180

    const lat1Rad = (this.latitude * Math.PI) / 180
    const lat2Rad = (other.latitude * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}
