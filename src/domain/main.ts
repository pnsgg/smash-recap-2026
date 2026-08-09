import { Address } from './recap/address'
import { Event } from './recap/event'
import { Participant } from './recap/participant'
import { Player } from './recap/player'
import { Seed } from './recap/seed'
import { Tournament } from './recap/tournament'
import { Videogame } from './recap/videogame'
import { BracketType } from './recap/bracket-type'
import { Character } from './recap/character'
import { Stage } from './recap/stage'
import { Set, SetPlayer } from './recap/set'
import { Game, GameSelection } from './recap/game'
import {
  asEventId,
  asParticipantId,
  asPlayerId,
  asTournamentId,
  asVideogameId,
  asCharacterId,
  asStageId,
  asSetId,
  asGameId,
} from './shared-kernel/ids'

// Game Characters
const sora = new Character(asCharacterId('1897'), 'Sora')
const ike = new Character(asCharacterId('1291'), 'Ike')
const littleMac = new Character(asCharacterId('1297'), 'Little Mac')
const chrom = new Character(asCharacterId('1409'), 'Chrom')
const kingDedede = new Character(asCharacterId('1294'), 'King Dedede')
const steve = new Character(asCharacterId('1766'), 'Steve')
const diddyKong = new Character(asCharacterId('1279'), 'Diddy Kong')
const cloud = new Character(asCharacterId('1275'), 'Cloud')
const ness = new Character(asCharacterId('1313'), 'Ness')
const randomChar = new Character(asCharacterId('1746'), 'Random Character')
const joker = new Character(asCharacterId('1453'), 'Joker')
const drMario = new Character(asCharacterId('1282'), 'Dr. Mario')
const bowser = new Character(asCharacterId('1273'), 'Bowser')
const kingKRool = new Character(asCharacterId('1407'), 'King K. Rool')
const incineroar = new Character(asCharacterId('1406'), 'Incineroar')
const kirby = new Character(asCharacterId('1295'), 'Kirby')
const ken = new Character(asCharacterId('1410'), 'Ken')
const pichu = new Character(asCharacterId('1318'), 'Pichu')
const olimar = new Character(asCharacterId('1314'), 'Olimar')
const greninja = new Character(asCharacterId('1289'), 'Greninja')
const miiBrawler = new Character(asCharacterId('1311'), 'Mii Brawler')
const robin = new Character(asCharacterId('1324'), 'Robin')
const ridley = new Character(asCharacterId('1319'), 'Ridley')
const darkPit = new Character(asCharacterId('1283'), 'Dark Pit')

// Game Stages
const peachsCastle = new Stage(asStageId('372'), "Peach's Castle")
const battlefield = new Stage(asStageId('311'), 'Battlefield')
const townAndCity = new Stage(asStageId('397'), 'Town and City')
const marioGalaxy = new Stage(asStageId('357'), 'Mario Galaxy')
const smallBattlefield = new Stage(asStageId('484'), 'Small Battlefield')
const hollowBastion = new Stage(asStageId('513'), 'Hollow Bastion')
const hyruleCastle = new Stage(asStageId('346'), 'Hyrule Castle')
const bigBattlefield = new Stage(asStageId('312'), 'Big Battlefield')

// 3. Player IDs & Seeds
const licaneId = asPlayerId('24227269')
const potichatId = asPlayerId('23931943')
const clementId = asPlayerId('24199546')
const mayouId = asPlayerId('24227275')
const gastonId = asPlayerId('23931950')
const rouxchovId = asPlayerId('23931942')
const pridenessId = asPlayerId('23931951')
const frederikeId = asPlayerId('23932445')
const cel1Id = asPlayerId('23931949')
const saturneId = asPlayerId('24235873')

const licaneSeed = new Seed(1, 1)
const potichatSeed = new Seed(2, 2)
const clementSeed = new Seed(3, 3)
const mayouSeed = new Seed(6, 4)
const gastonSeed = new Seed(9, 5)
const rouxchovSeed = new Seed(4, 5)
const pridenessSeed = new Seed(7, 7)
const frederikeSeed = new Seed(5, 7)
const cel1Seed = new Seed(8, 9)
const saturneSeed = new Seed(10, 9)

// Sets
// Set 1: Grand Final (105853061): PotiChat (3) vs Licane (2)
const set1Licane = new SetPlayer({
  playerId: licaneId,
  seed: licaneSeed,
  score: 2,
  isDisqualified: false,
})
const set1Potichat = new SetPlayer({
  playerId: potichatId,
  seed: potichatSeed,
  score: 3,
  isDisqualified: false,
})
const set1 = new Set({
  id: asSetId('105853061'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [licaneId, set1Licane],
    [potichatId, set1Potichat],
  ]),
  winnerId: potichatId,
  round: 5,
  fullRoundText: 'Grand Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785276620 * 1000),
  games: [
    new Game({
      id: asGameId('105853061-g1'),
      orderNum: 1,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853061-g2'),
      orderNum: 2,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853061-g3'),
      orderNum: 3,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, cloud),
      ],
    }),
    new Game({
      id: asGameId('105853061-g4'),
      orderNum: 4,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, cloud),
      ],
    }),
    new Game({
      id: asGameId('105853061-g5'),
      orderNum: 5,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, cloud),
      ],
    }),
  ],
})

// Set 2: Grand Final Reset (105853062): Licane (3) vs PotiChat (1)
const set2Potichat = new SetPlayer({
  playerId: potichatId,
  seed: potichatSeed,
  score: 1,
  isDisqualified: false,
})
const set2Licane = new SetPlayer({
  playerId: licaneId,
  seed: licaneSeed,
  score: 3,
  isDisqualified: false,
})
const set2 = new Set({
  id: asSetId('105853062'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [potichatId, set2Potichat],
    [licaneId, set2Licane],
  ]),
  winnerId: licaneId,
  round: 5,
  fullRoundText: 'Grand Final Reset',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785328357 * 1000),
  games: [
    new Game({
      id: asGameId('105853062-g1'),
      orderNum: 1,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(licaneId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853062-g2'),
      orderNum: 2,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(licaneId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853062-g3'),
      orderNum: 3,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(licaneId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853062-g4'),
      orderNum: 4,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(licaneId, diddyKong),
      ],
    }),
  ],
})

// Set 3: Winners Final (105853060): Licane (3) vs PotiChat (1)
const set3Licane = new SetPlayer({
  playerId: licaneId,
  seed: licaneSeed,
  score: 3,
  isDisqualified: false,
})
const set3Potichat = new SetPlayer({
  playerId: potichatId,
  seed: potichatSeed,
  score: 1,
  isDisqualified: false,
})
const set3 = new Set({
  id: asSetId('105853060'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [licaneId, set3Licane],
    [potichatId, set3Potichat],
  ]),
  winnerId: licaneId,
  round: 4,
  fullRoundText: 'Winners Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785272995 * 1000),
  games: [
    new Game({
      id: asGameId('105853060-g1'),
      orderNum: 1,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(licaneId, steve),
        new GameSelection(potichatId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853060-g2'),
      orderNum: 2,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(licaneId, ness),
        new GameSelection(potichatId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853060-g3'),
      orderNum: 3,
      winnerId: licaneId,
      stage: null,
      selections: [
        new GameSelection(licaneId, ness),
        new GameSelection(potichatId, diddyKong),
      ],
    }),
    new Game({
      id: asGameId('105853060-g4'),
      orderNum: 4,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(licaneId, randomChar),
        new GameSelection(potichatId, randomChar),
      ],
    }),
  ],
})

// Set 4: Losers Final (105853092): PotiChat (3) vs Clément (0)
const set4Potichat = new SetPlayer({
  playerId: potichatId,
  seed: potichatSeed,
  score: 3,
  isDisqualified: false,
})
const set4Clement = new SetPlayer({
  playerId: clementId,
  seed: clementSeed,
  score: 0,
  isDisqualified: false,
})
const set4 = new Set({
  id: asSetId('105853092'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [potichatId, set4Potichat],
    [clementId, set4Clement],
  ]),
  winnerId: potichatId,
  round: -8,
  fullRoundText: 'Losers Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785274976 * 1000),
  games: [
    new Game({
      id: asGameId('105853092-g1'),
      orderNum: 1,
      winnerId: potichatId,
      stage: peachsCastle,
      selections: [
        new GameSelection(potichatId, joker),
        new GameSelection(clementId, drMario),
      ],
    }),
    new Game({
      id: asGameId('105853092-g2'),
      orderNum: 2,
      winnerId: potichatId,
      stage: battlefield,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(clementId, bowser),
      ],
    }),
    new Game({
      id: asGameId('105853092-g3'),
      orderNum: 3,
      winnerId: potichatId,
      stage: townAndCity,
      selections: [
        new GameSelection(potichatId, diddyKong),
        new GameSelection(clementId, bowser),
      ],
    }),
  ],
})

// Set 5: Losers Semi-Final (105853091): Clément (3) vs Mayou (0)
const set5Mayou = new SetPlayer({
  playerId: mayouId,
  seed: mayouSeed,
  score: 0,
  isDisqualified: false,
})
const set5Clement = new SetPlayer({
  playerId: clementId,
  seed: clementSeed,
  score: 3,
  isDisqualified: false,
})
const set5 = new Set({
  id: asSetId('105853091'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [mayouId, set5Mayou],
    [clementId, set5Clement],
  ]),
  winnerId: clementId,
  round: -7,
  fullRoundText: 'Losers Semi-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785273925 * 1000),
  games: [
    new Game({
      id: asGameId('105853091-g1'),
      orderNum: 1,
      winnerId: clementId,
      stage: marioGalaxy,
      selections: [
        new GameSelection(mayouId, kingKRool),
        new GameSelection(clementId, bowser),
      ],
    }),
    new Game({
      id: asGameId('105853091-g2'),
      orderNum: 2,
      winnerId: clementId,
      stage: smallBattlefield,
      selections: [
        new GameSelection(mayouId, incineroar),
        new GameSelection(clementId, bowser),
      ],
    }),
    new Game({
      id: asGameId('105853091-g3'),
      orderNum: 3,
      winnerId: clementId,
      stage: hollowBastion,
      selections: [
        new GameSelection(mayouId, kirby),
        new GameSelection(clementId, bowser),
      ],
    }),
  ],
})

// Set 6: Winners Semi-Final (105853058): Licane (3) vs RouxChov (2)
const set6Licane = new SetPlayer({
  playerId: licaneId,
  seed: licaneSeed,
  score: 3,
  isDisqualified: false,
})
const set6Rouxchov = new SetPlayer({
  playerId: rouxchovId,
  seed: rouxchovSeed,
  score: 2,
  isDisqualified: false,
})
const set6 = new Set({
  id: asSetId('105853058'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [licaneId, set6Licane],
    [rouxchovId, set6Rouxchov],
  ]),
  winnerId: licaneId,
  round: 3,
  fullRoundText: 'Winners Semi-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785271323 * 1000),
  games: [
    new Game({
      id: asGameId('105853058-g1'),
      orderNum: 1,
      winnerId: licaneId,
      stage: hyruleCastle,
      selections: [
        new GameSelection(licaneId, littleMac),
        new GameSelection(rouxchovId, sora),
      ],
    }),
    new Game({
      id: asGameId('105853058-g2'),
      orderNum: 2,
      winnerId: rouxchovId,
      stage: bigBattlefield,
      selections: [
        new GameSelection(licaneId, littleMac),
        new GameSelection(rouxchovId, sora),
      ],
    }),
    new Game({
      id: asGameId('105853058-g3'),
      orderNum: 3,
      winnerId: licaneId,
      stage: smallBattlefield,
      selections: [
        new GameSelection(licaneId, chrom),
        new GameSelection(rouxchovId, sora),
      ],
    }),
    new Game({
      id: asGameId('105853058-g4'),
      orderNum: 4,
      winnerId: rouxchovId,
      stage: smallBattlefield,
      selections: [
        new GameSelection(licaneId, kingDedede),
        new GameSelection(rouxchovId, sora),
      ],
    }),
    new Game({
      id: asGameId('105853058-g5'),
      orderNum: 5,
      winnerId: licaneId,
      stage: smallBattlefield,
      selections: [
        new GameSelection(licaneId, ike),
        new GameSelection(rouxchovId, sora),
      ],
    }),
  ],
})

// Set 7: Winners Semi-Final (105853059): PotiChat (3) vs Clément (0)
const set7Potichat = new SetPlayer({
  playerId: potichatId,
  seed: potichatSeed,
  score: 3,
  isDisqualified: false,
})
const set7Clement = new SetPlayer({
  playerId: clementId,
  seed: clementSeed,
  score: 0,
  isDisqualified: false,
})
const set7 = new Set({
  id: asSetId('105853059'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [potichatId, set7Potichat],
    [clementId, set7Clement],
  ]),
  winnerId: potichatId,
  round: 3,
  fullRoundText: 'Winners Semi-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785269410 * 1000),
  games: [
    new Game({
      id: asGameId('105853059-g1'),
      orderNum: 1,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(potichatId, joker),
        new GameSelection(clementId, bowser),
      ],
    }),
    new Game({
      id: asGameId('105853059-g2'),
      orderNum: 2,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(potichatId, joker),
        new GameSelection(clementId, bowser),
      ],
    }),
    new Game({
      id: asGameId('105853059-g3'),
      orderNum: 3,
      winnerId: potichatId,
      stage: null,
      selections: [
        new GameSelection(potichatId, joker),
        new GameSelection(clementId, drMario),
      ],
    }),
  ],
})

// Set 8: Losers Quarter-Final (105853089): Mayou (W) vs RouxChov (DQ)
const set8Rouxchov = new SetPlayer({
  playerId: rouxchovId,
  seed: rouxchovSeed,
  score: 0,
  isDisqualified: true,
})
const set8Mayou = new SetPlayer({
  playerId: mayouId,
  seed: mayouSeed,
  score: 0,
  isDisqualified: false,
})
const set8 = new Set({
  id: asSetId('105853089'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [rouxchovId, set8Rouxchov],
    [mayouId, set8Mayou],
  ]),
  winnerId: mayouId,
  round: -6,
  fullRoundText: 'Losers Quarter-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785271725 * 1000),
  games: [],
})

// Set 9: Losers Quarter-Final (105853090): Clément (3) vs Gaston (2)
const set9Clement = new SetPlayer({
  playerId: clementId,
  seed: clementSeed,
  score: 3,
  isDisqualified: false,
})
const set9Gaston = new SetPlayer({
  playerId: gastonId,
  seed: gastonSeed,
  score: 2,
  isDisqualified: false,
})
const set9 = new Set({
  id: asSetId('105853090'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [clementId, set9Clement],
    [gastonId, set9Gaston],
  ]),
  winnerId: clementId,
  round: -6,
  fullRoundText: 'Losers Quarter-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785272920 * 1000),
  games: [
    new Game({
      id: asGameId('105853090-g1'),
      orderNum: 1,
      winnerId: clementId,
      stage: null,
      selections: [
        new GameSelection(clementId, ken),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853090-g2'),
      orderNum: 2,
      winnerId: gastonId,
      stage: null,
      selections: [
        new GameSelection(clementId, pichu),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853090-g3'),
      orderNum: 3,
      winnerId: clementId,
      stage: null,
      selections: [
        new GameSelection(clementId, pichu),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853090-g4'),
      orderNum: 4,
      winnerId: gastonId,
      stage: null,
      selections: [
        new GameSelection(clementId, pichu),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853090-g5'),
      orderNum: 5,
      winnerId: clementId,
      stage: null,
      selections: [
        new GameSelection(clementId, olimar),
        new GameSelection(gastonId, greninja),
      ],
    }),
  ],
})

// Set 10: Losers Round 2 (105853087): Mayou (3) vs Prideness (0)
const set10Mayou = new SetPlayer({
  playerId: mayouId,
  seed: mayouSeed,
  score: 3,
  isDisqualified: false,
})
const set10Prideness = new SetPlayer({
  playerId: pridenessId,
  seed: pridenessSeed,
  score: 0,
  isDisqualified: false,
})
const set10 = new Set({
  id: asSetId('105853087'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [mayouId, set10Mayou],
    [pridenessId, set10Prideness],
  ]),
  winnerId: mayouId,
  round: -5,
  fullRoundText: 'Losers Round 2',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785271655 * 1000),
  games: [
    new Game({
      id: asGameId('105853087-g1'),
      orderNum: 1,
      winnerId: mayouId,
      stage: null,
      selections: [
        new GameSelection(mayouId, kirby),
        new GameSelection(pridenessId, ness),
      ],
    }),
    new Game({
      id: asGameId('105853087-g2'),
      orderNum: 2,
      winnerId: mayouId,
      stage: null,
      selections: [
        new GameSelection(mayouId, kirby),
        new GameSelection(pridenessId, ness),
      ],
    }),
    new Game({
      id: asGameId('105853087-g3'),
      orderNum: 3,
      winnerId: mayouId,
      stage: null,
      selections: [
        new GameSelection(mayouId, kirby),
        new GameSelection(pridenessId, ness),
      ],
    }),
  ],
})

// Set 11: Losers Round 2 (105853088): Gaston (3) vs FrederIke (1)
const set11Frederike = new SetPlayer({
  playerId: frederikeId,
  seed: frederikeSeed,
  score: 1,
  isDisqualified: false,
})
const set11Gaston = new SetPlayer({
  playerId: gastonId,
  seed: gastonSeed,
  score: 3,
  isDisqualified: false,
})
const set11 = new Set({
  id: asSetId('105853088'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [frederikeId, set11Frederike],
    [gastonId, set11Gaston],
  ]),
  winnerId: gastonId,
  round: -5,
  fullRoundText: 'Losers Round 2',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785270904 * 1000),
  games: [
    new Game({
      id: asGameId('105853088-g1'),
      orderNum: 1,
      winnerId: gastonId,
      stage: null,
      selections: [
        new GameSelection(frederikeId, ike),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853088-g2'),
      orderNum: 2,
      winnerId: gastonId,
      stage: null,
      selections: [
        new GameSelection(frederikeId, ike),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853088-g3'),
      orderNum: 3,
      winnerId: frederikeId,
      stage: null,
      selections: [
        new GameSelection(frederikeId, ike),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853088-g4'),
      orderNum: 4,
      winnerId: gastonId,
      stage: null,
      selections: [
        new GameSelection(frederikeId, ike),
        new GameSelection(gastonId, greninja),
      ],
    }),
  ],
})

// Set 12: Winners Quarter-Final (105853054): Licane (3) vs Gaston (0)
const set12Licane = new SetPlayer({
  playerId: licaneId,
  seed: licaneSeed,
  score: 3,
  isDisqualified: false,
})
const set12Gaston = new SetPlayer({
  playerId: gastonId,
  seed: gastonSeed,
  score: 0,
  isDisqualified: false,
})
const set12 = new Set({
  id: asSetId('105853054'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [licaneId, set12Licane],
    [gastonId, set12Gaston],
  ]),
  winnerId: licaneId,
  round: 2,
  fullRoundText: 'Winners Quarter-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785269387 * 1000),
  games: [
    new Game({
      id: asGameId('105853054-g1'),
      orderNum: 1,
      winnerId: licaneId,
      stage: battlefield,
      selections: [
        new GameSelection(licaneId, miiBrawler),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853054-g2'),
      orderNum: 2,
      winnerId: licaneId,
      stage: battlefield,
      selections: [
        new GameSelection(licaneId, ike),
        new GameSelection(gastonId, greninja),
      ],
    }),
    new Game({
      id: asGameId('105853054-g3'),
      orderNum: 3,
      winnerId: licaneId,
      stage: battlefield,
      selections: [
        new GameSelection(licaneId, robin),
        new GameSelection(gastonId, greninja),
      ],
    }),
  ],
})

// Set 13: Winners Quarter-Final (105853055): RouxChov (3) vs FrederIke (1)
const set13Rouxchov = new SetPlayer({
  playerId: rouxchovId,
  seed: rouxchovSeed,
  score: 3,
  isDisqualified: false,
})
const set13Frederike = new SetPlayer({
  playerId: frederikeId,
  seed: frederikeSeed,
  score: 0,
  isDisqualified: false,
})
const set13 = new Set({
  id: asSetId('105853055'),
  eventId: asEventId('1654375'),
  competitors: new Map([
    [rouxchovId, set13Rouxchov],
    [frederikeId, set13Frederike],
  ]),
  winnerId: rouxchovId,
  round: 2,
  fullRoundText: 'Winners Quarter-Final',
  bracketType: BracketType.DOUBLE_ELIMINATION,
  completedAt: new Date(1785267304 * 1000),
  games: [
    new Game({
      id: asGameId('105853055-g1'),
      orderNum: 1,
      winnerId: rouxchovId,
      stage: null,
      selections: [
        new GameSelection(rouxchovId, sora),
        new GameSelection(frederikeId, ike),
      ],
    }),
    new Game({
      id: asGameId('105853055-g2'),
      orderNum: 2,
      winnerId: rouxchovId,
      stage: null,
      selections: [
        new GameSelection(rouxchovId, ridley),
        new GameSelection(frederikeId, ike),
      ],
    }),
    new Game({
      id: asGameId('105853055-g3'),
      orderNum: 3,
      winnerId: rouxchovId,
      stage: null,
      selections: [
        new GameSelection(rouxchovId, darkPit),
        new GameSelection(frederikeId, ike),
      ],
    }),
  ],
})

// Licane
const player = new Player({
  id: licaneId,
  gamerTag: 'Licane',
  prefix: 'ARK',
  tournaments: [
    new Tournament({
      id: asTournamentId('926257'),
      name: 'KiLyAN #2 - Kilya x PNS',
      address: new Address({
        city: 'Ramonville-Saint-Agne',
        state: 'Occitanie',
        countryCode: 'FR',
        longitude: 1.4784139,
        latitude: 43.543794,
      }),
      startDate: new Date(1785258000 * 1000),
      events: [
        new Event({
          id: asEventId('1654375'),
          name: 'Super Smash Bros. Ultimate',
          videogame: new Videogame(
            asVideogameId('123'),
            'Super Smash Bros. Ultimate',
          ),
          isOnline: false,
          bracketType: BracketType.DOUBLE_ELIMINATION,
          participants: [
            new Participant({
              id: asParticipantId('participant-licane'),
              playerId: licaneId,
              name: 'Licane',
              seed: licaneSeed,
            }),
            new Participant({
              id: asParticipantId('participant-potichat'),
              playerId: potichatId,
              name: 'PotiChat',
              seed: potichatSeed,
            }),
            new Participant({
              id: asParticipantId('participant-clement'),
              playerId: clementId,
              name: 'Clément',
              seed: clementSeed,
            }),
            new Participant({
              id: asParticipantId('participant-mayou'),
              playerId: mayouId,
              name: 'Mayou',
              seed: mayouSeed,
            }),
            new Participant({
              id: asParticipantId('participant-gaston'),
              playerId: gastonId,
              name: 'Gaston',
              seed: gastonSeed,
            }),
            new Participant({
              id: asParticipantId('participant-rouxchov'),
              playerId: rouxchovId,
              name: 'RouxChov',
              seed: rouxchovSeed,
            }),
            new Participant({
              id: asParticipantId('participant-prideness'),
              playerId: pridenessId,
              name: 'Prideness',
              seed: pridenessSeed,
            }),
            new Participant({
              id: asParticipantId('participant-frederike'),
              playerId: frederikeId,
              name: 'FrederIke',
              seed: frederikeSeed,
            }),
            new Participant({
              id: asParticipantId('participant-cel1'),
              playerId: cel1Id,
              name: 'Cél1',
              seed: cel1Seed,
            }),
            new Participant({
              id: asParticipantId('participant-saturne'),
              playerId: saturneId,
              name: 'Mr_Saturne',
              seed: saturneSeed,
            }),
          ],
          sets: [
            set1,
            set2,
            set3,
            set4,
            set5,
            set6,
            set7,
            set8,
            set9,
            set10,
            set11,
            set12,
            set13,
          ],
        }),
      ],
    }),
  ],
})

console.log('--- PLAYER CHARACTER METRICS ---')
const characterMetrics = player.mostPlayedCharacters(3)
characterMetrics.forEach((metric, idx) => {
  console.log(
    `${idx + 1}. Character: ${metric.character.name} | Games Played: ${metric.count}`,
  )
})

console.log('\n--- STAGE WIN RATE METRICS ---')
const stageMetrics = player.stageActivity()
stageMetrics.forEach((metric) => {
  console.log(
    `Stage: ${metric.stage.name} | Plays: ${metric.count} | Win Rate: ${(metric.winRate * 100).toFixed(1)}%`,
  )
})

console.log('\n--- TOURNAMENT SEED PERFORMANCE ---')
player.tournaments.forEach((tournament) => {
  console.log(`Tournament: ${tournament.name}`)
  const spr = tournament.getPlayerSPR(player.id)
  console.log(
    `  Seeding Performance Rating (SPR): ${spr !== null ? (spr >= 0 ? '+' : '') + spr : 'N/A'}`,
  )
})

console.log('\n--- MATCH UPSETS IN BRACKET ---')
const event = player.tournaments[0].events[0]
event.sets.forEach((set) => {
  if (set.competitors.has(player.id)) {
    const upset = set.isUpset()
    const factor = set.upsetFactor()
    console.log(
      `Match: ${set.fullRoundText} | Upset: ${upset} | Upset Factor: ${factor !== null ? (factor >= 0 ? '+' : '') + factor : 'N/A'}`,
    )
  }
})

console.log('\n--- ENCOUNTERED OPPONENT CHARACTERS ---')
const opponents = player.encounteredCharacters()
console.log(
  `Unique characters played against: ${Array.from(opponents)
    .map((c) => c.name)
    .join(', ')}`,
)

console.log('\n--- DQ STATISTICS ---')
console.log(
  `DQ Sets Count (${player.gamerTag}): ${player.totalDisqualifications()}`,
)

console.log('\n--- SEASON OVERVIEW ---')
console.log(`Total Sets Played: ${player.totalSets()}`)
console.log(`Clean Sweeps (3-0 or 2-0): ${player.cleanSweeps()}`)
console.log(
  'Reverse Sweeps Played Won:',
  player.reverseSweeps().won,
  'Lost:',
  player.reverseSweeps().lost,
)
console.log(`Unique Opponents Faced: ${player.uniqueOpponentsFaced().size}`)
const deciding = player.decidingGameSets()
console.log(
  `Deciding Game Sets (3-2 or 2-1): ${deciding.count} (Wins: ${deciding.winCount}, Win Rate: ${(deciding.winRate * 100).toFixed(1)}%)`,
)

console.log('\n--- WORST MATCHUPS ---')
const worst = player.worstMatchups(3)
worst.forEach((metric, idx) => {
  console.log(
    `${idx + 1}. Opponent Character: ${metric.character.name} | Games Lost: ${metric.lossCount} | Loss Rate: ${(metric.looseRate * 100).toFixed(1)}%`,
  )
})

console.log('\n--- HIGHEST UPSET ---')
const upset = player.highestUpset()
if (upset) {
  console.log(
    `Highest Upset: ${upset.set.fullRoundText} | Upset Factor: +${upset.factor}`,
  )
} else {
  console.log('Highest Upset: None')
}

console.log('\n--- ACTIVITY METRICS ---')
console.log('Activity by Day of Week:')
player.dayOfWeekActivity().forEach((act) => {
  if (act.count > 0) {
    console.log(`  ${act.day}: ${act.count} tournament(s)`)
  }
})
console.log('Activity by Month:')
player.tournamentsByMonth().forEach((act) => {
  if (act.count > 0) {
    console.log(`  ${act.month}: ${act.count} tournament(s)`)
  }
})
