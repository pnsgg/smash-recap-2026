import { Player } from "#/domain/recap/player";
import type { Tournament } from "#/domain/recap/tournament";
import { asPlayerId } from "#/domain/shared-kernel/ids";
import { Factory } from "./factory";

export const PlayerFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    prefix: faker.string.alpha({ casing: "upper", length: 3 }),
    gamerTag: faker.internet.username(),
    tournaments: [] as Tournament[]
  }), ({ id, prefix, gamerTag, tournaments }) => new Player({
    id: asPlayerId(id),
    prefix,
    gamerTag,
    tournaments
  }))
