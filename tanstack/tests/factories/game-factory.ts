import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Game, GameSelection } from '#/domain/recap/game'
import type { Stage } from '#/domain/recap/stage'
import { asGameId, asPlayerId } from '#/domain/shared-kernel/ids'
import type { GameId, PlayerId } from '#/domain/shared-kernel/ids'
import { CharacterFactory } from './character-factory'
import { StageFactory } from './stage-factory'

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
    const stage =
      params.stage === undefined ? StageFactory.build() : params.stage

    let selections = params.selections
    if (selections === undefined) {
      const p1Id = asPlayerId(faker.number.int().toString())
      const p2Id = asPlayerId(faker.number.int().toString())
      const p1Char = CharacterFactory.build()
      const p2Char = CharacterFactory.build()
      selections = [
        new GameSelection(p1Id, p1Char),
        new GameSelection(p2Id, p2Char),
      ]
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
  },
)
