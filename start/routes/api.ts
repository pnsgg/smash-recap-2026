import router from '@adonisjs/core/services/router'

const PlayersSearchController = () =>
  import('#search/infrastructure/primary/players_search_controller')

router
  .group(() => {
    router.get('/players/search', [PlayersSearchController, 'handle'])
  })
  .prefix('/api/v1')
