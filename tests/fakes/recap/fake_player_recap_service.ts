import { PlayerFactory } from '#tests/factories/player_factory'
import PlayerRecapService from '#recap/application/player_recap_service'
import type { Player } from '#recap/domain/player'
import { type UserSlug, type VideogameId, asPlayerId } from '#shared/domain/ids'

export const LICANE_DATA = {
  id: asPlayerId('1960701'),
  prefix: 'ARK',
  gamerTag: 'Licane',
}

export const ROUXCHOV_DATA = {
  id: asPlayerId('4460045'),
  prefix: 'PNS',
  gamerTag: 'RouxChov',
}

export class FakePlayerRecapService extends PlayerRecapService {
  public lastVideogameId?: VideogameId

  constructor() {
    super(null as unknown as any)
  }

  async getRecap(slug: UserSlug, _year: Date, videogameId: VideogameId): Promise<Player> {
    this.lastVideogameId = videogameId

    let data = LICANE_DATA
    if (slug.includes('89723908')) {
      data = ROUXCHOV_DATA
    } else if (slug.includes('541f04fd')) {
      data = LICANE_DATA
    } else {
      data = { ...LICANE_DATA, id: asPlayerId(slug) }
    }

    return PlayerFactory.build({
      id: data.id,
      prefix: data.prefix,
      gamerTag: data.gamerTag,
    })
  }
}
