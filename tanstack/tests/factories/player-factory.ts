import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Player } from '#/domain/recap/player'
import type { Tournament } from '#/domain/recap/tournament'
import { asPlayerId } from '#/domain/shared-kernel/ids'
import type { PlayerId } from '#/domain/shared-kernel/ids'

type PlayerOverrides = {
  id?: PlayerId
  prefix?: string | null
  gamerTag?: string
  tournaments?: Tournament[]
}

export const PlayerFactory = Factory.define<
  Player,
  any,
  Player,
  PlayerOverrides
>(({ sequence, params }) => {
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
})
