import router from '@adonisjs/core/services/router'

const PlayersSearchController = () =>
  import('#search/infrastructure/primary/players_search_controller')
const PlayerRecapController = () => import('#recap/infrastructure/primary/player_recap_controller')
const TournamentOrganizerRecapController = () =>
  import('#recap/infrastructure/primary/tournament_organizer_recap_controller')

router
  .group(() => {
    router.get('/players/search', [PlayersSearchController, 'handle'])
    router.get('/players/:slug/recap', [PlayerRecapController, 'handle'])
    router.get('/tournament-organizers/:slug/recap', [TournamentOrganizerRecapController, 'handle'])
  })
  .prefix('/api/v1')
