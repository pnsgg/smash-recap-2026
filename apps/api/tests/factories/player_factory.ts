import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Player } from '#recap/domain/player'
import type { Tournament } from '#recap/domain/tournament'
import { asPlayerId } from '#shared/ids'
import type { PlayerId } from '#shared/ids'

type PlayerOverrides = {
  id?: PlayerId
  prefix?: string | null
  gamerTag?: string
  tournaments?: Tournament[]
}

export const PlayerFactory = Factory.define<Player, any, Player, PlayerOverrides>(
  ({ sequence, params }) => {
    const id = params.id ?? asPlayerId(sequence.toString())
    const prefix =
      params.prefix === undefined
        ? faker.string.alpha({ casing: 'upper', length: 3 })
        : params.prefix
    const gamerTag = params.gamerTag ?? faker.internet.username()
    const tournaments = params.tournaments ?? ([] as Tournament[])

    return new Player({
      id,
      prefix,
      gamerTag,
      tournaments,
    })
  }
)
