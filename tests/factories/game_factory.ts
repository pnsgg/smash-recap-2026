import { CharacterFactory } from '#tests/factories/character_factory'
import { StageFactory } from '#tests/factories/stage_factory'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Game, GameSelection } from '#recap/domain/game'
import type { Stage } from '#recap/domain/stage'
import { asGameId, asPlayerId } from '#shared/domain/ids'
import type { GameId, PlayerId } from '#shared/domain/ids'

type GameOverrides = {
  id?: GameId
  orderNum?: number
  winnerId?: PlayerId | null
  stage?: Stage | null
  selections?: GameSelection[]
}

export const GameFactory = Factory.define<Game, any, Game, GameOverrides>(
  ({ sequence, params }) => {
    const id = params.id ?? asGameId(sequence.toString())
    const orderNum = params.orderNum ?? faker.number.int({ min: 1, max: 5 })
    const stage = params.stage === undefined ? StageFactory.build() : params.stage

    let selections = params.selections
    if (selections === undefined) {
      const p1Id = asPlayerId(faker.number.int().toString())
      const p2Id = asPlayerId(faker.number.int().toString())
      const p1Char = CharacterFactory.build()
      const p2Char = CharacterFactory.build()
      selections = [new GameSelection(p1Id, p1Char), new GameSelection(p2Id, p2Char)]
    }

    let winnerId = params.winnerId
    if (winnerId === undefined) {
      const playerIds = selections.map((s) => s.playerId)
      winnerId = faker.helpers.arrayElement([...playerIds, null])
    }

    return new Game({
      id,
      orderNum,
      winnerId,
      stage,
      selections,
    })
  }
)
