import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Player } from '#recap/domain/player'

export default class PlayerRecapTransformer extends BaseTransformer<Player> {
  toObject() {
    return {
      id: this.resource.id,
      prefix: this.resource.prefix,
      gamerTag: this.resource.gamerTag,
      totalTournaments: this.resource.tournaments.length,
      totalSets: this.resource.totalSets(),
      dayOfWeekActivity: this.resource.dayOfWeekActivity(),
      tournamentsByMonth: this.resource.tournamentsByMonth(),
      cleanSweeps: this.resource.cleanSweeps(),
      reverseSweeps: this.resource.reverseSweeps(),
      decidingGameSets: this.resource.decidingGameSets(),
      totalDisqualifications: this.resource.totalDisqualifications(),
      bestPerformances: this.resource.bestPerformances(5).map((perf) => ({
        tournamentName: perf.tournament.name,
        spr: perf.spr,
      })),
      worstPerformance: (() => {
        const perf = this.resource.worstPerformance()
        return perf ? { tournamentName: perf.tournament.name, spr: perf.spr } : null
      })(),
      mostPlayedCharacters: this.resource.mostPlayedCharacters(5).map((char) => ({
        characterId: char.character.id,
        characterName: char.character.name,
        count: char.count,
      })),
      highestUpset: (() => {
        const upset = this.resource.highestUpset()
        return upset
          ? {
              tournamentName: upset.tournament.name,
              eventName: upset.event.name,
              factor: upset.factor,
            }
          : null
      })(),
      stageActivity: this.resource.stageActivity().map((stat) => ({
        stageId: stat.stage.id,
        stageName: stat.stage.name,
        count: stat.count,
        winRate: stat.winRate,
      })),
      worstMatchups: this.resource.worstMatchups(5).map((matchup) => ({
        characterId: matchup.character.id,
        characterName: matchup.character.name,
        count: matchup.count,
        lossCount: matchup.lossCount,
        looseRate: matchup.looseRate,
      })),
      nemesis: this.resource.nemesis(3),
      eventTypeBreakdown: this.resource.eventTypeBreakdown(),
    }
  }
}
