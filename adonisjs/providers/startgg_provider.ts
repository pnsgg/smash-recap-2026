import type { ApplicationService } from '@adonisjs/core/types'
import { StartggClient } from '#shared/infrastructure/secondary/startgg/startgg_client'

export default class StartggProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(StartggClient, () => {
      return new StartggClient()
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
