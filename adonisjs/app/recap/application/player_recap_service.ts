import { inject } from '@adonisjs/core'
import type { Player } from '#recap/domain/player'
import { type UserSlug, type VideogameId } from '#shared/domain/ids'
import { StartggPlayerRepository } from '#shared/infrastructure/secondary/startgg/player_repository'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

@inject()
export default class PlayerRecapService {
  constructor(private client: StartggClient) {}

  async getRecap(slug: UserSlug, year: Date, videogameId: VideogameId): Promise<Player> {
    const repository = new StartggPlayerRepository(this.client, {})
    return repository.getPlayerRecap(slug, year, videogameId)
  }
}
