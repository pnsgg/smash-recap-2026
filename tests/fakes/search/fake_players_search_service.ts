import PlayersSearchService from '#search/application/players_search_service'
import { SearchPlayerResult } from '#search/domain/player_search_result'
import { asPlayerId, asUserSlug } from '#shared/domain/ids'

export class FakePlayersSearchService extends PlayersSearchService {
  constructor() {
    super(null as any) // fake client
  }

  async searchPlayerByGamerTag(gamertag: string): Promise<SearchPlayerResult[]> {
    const data = [
      new SearchPlayerResult({
        id: asPlayerId('1960701'),
        slug: asUserSlug('user/541f04fd'),
        prefix: 'ARK',
        gamerTag: 'Licane',
        country: 'France',
        profilePictureUrl:
          'https://images.start.gg/images/user/1243541/image-ccedb2932d54b57e6c08aef92f7302c5.png',
        nbEvents: 397,
      }),
      new SearchPlayerResult({
        id: asPlayerId('278884'),
        slug: asUserSlug('user/496f990a'),
        prefix: null,
        gamerTag: 'Licane',
        country: 'Portugal',
        profilePictureUrl:
          'https://images.start.gg/images/user/180949/image-89f71ba6686c3e72b6882caab0f514d9.jpg?ehk=wlBrKSlS7GK2MCxpKqg1tgCSHNFCTRtMk2Uk6h0xakY%3D&ehkOptimized=9vqT03ddOH7imOlWZC9GxxipDb4Lr6KiUo7N71sGDrY%3D',
        nbEvents: 4,
      }),
    ]

    return data.filter((player) => player.gamerTag.toLowerCase().includes(gamertag.toLowerCase()))
  }
}
