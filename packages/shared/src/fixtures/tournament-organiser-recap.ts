import { asUserSlug, asVideogameId } from "@api/modules/shared/ids";
import { TournamentOrganizerRecapProps } from "@shared/recap-types";

export const licaneTournamentOrganiserRecap: TournamentOrganizerRecapProps = {
  id: asUserSlug("541f04fd"),
  gamerTag: "Licane",
  totalTournaments: 101,
  biggestTournaments: [
    {
      tournamentName: "Le Parthenon #6",
      attendees: 189
    },
    {
      tournamentName: "F'Air-Play #3 - TLS x AMOS Toulouse",
      attendees: 131
    },
    {
      tournamentName: "ChandeLAN 3 - 2026",
      attendees: 123
    },
    {
      tournamentName: "F'Air-Play #2 - TLS x AMOS Toulouse",
      attendees: 109
    },
    {
      tournamentName: "Ledgetrompe #31",
      attendees: 68
    }
  ],
  gamesOrganized: [
    {
      videogameId: asVideogameId("1386"),
      videogameName: "Super Smash Bros. Ultimate",
      count: 145
    },
    {
      videogameId: asVideogameId("1"),
      videogameName: "Super Smash Bros. Melee",
      count: 26
    },
    {
      videogameId: asVideogameId("53945"),
      videogameName: "Rivals of Aether II",
      count: 17
    },
    {
      videogameId: asVideogameId("5724"),
      videogameName: "Mario Kart 7",
      count: 3
    },
    {
      videogameId: asVideogameId("43868"),
      videogameName: "Street Fighter 6",
      count: 2
    },
    {
      videogameId: asVideogameId("102537"),
      videogameName: "Mario Kart World",
      count: 2
    },
    {
      videogameId: asVideogameId("114810"),
      videogameName: "Pokémon Champions",
      count: 1
    },
    {
      videogameId: asVideogameId("3"),
      videogameName: "Super Smash Bros. for Wii U",
      count: 1
    },
    {
      videogameId: asVideogameId("29"),
      videogameName: "Super Smash Bros. for 3DS",
      count: 1
    },
    {
      videogameId: asVideogameId("24"),
      videogameName: "Rivals of Aether",
      count: 1
    },
    {
      videogameId: asVideogameId("2165"),
      videogameName: "Mario Kart 8 Deluxe",
      count: 1
    },
    {
      videogameId: asVideogameId("48707"),
      videogameName: "Other",
      count: 1
    },
    {
      videogameId: asVideogameId("64423"),
      videogameName: "2XKO",
      count: 1
    },
    {
      videogameId: asVideogameId("73221"),
      videogameName: "Fatal Fury: City of the Wolves",
      count: 1
    },
    {
      videogameId: asVideogameId("11936"),
      videogameName: "The King of Fighters '98",
      count: 1
    },
    {
      videogameId: asVideogameId("36963"),
      videogameName: "The King of Fighters XV",
      count: 1
    },
    {
      videogameId: asVideogameId("33921"),
      videogameName: "Garfield Kart: Furious Racing",
      count: 1
    },
    {
      videogameId: asVideogameId("54347"),
      videogameName: "Pokémon Showdown",
      count: 1
    },
    {
      videogameId: asVideogameId("25"),
      videogameName: "Clash Royale",
      count: 1
    },
    {
      videogameId: asVideogameId("33945"),
      videogameName: "Guilty Gear: Strive",
      count: 1
    },
    {
      videogameId: asVideogameId("49783"),
      videogameName: "TEKKEN 8",
      count: 1
    }
  ],
  dayOfWeekActivity: [
    {
      day: "Sun",
      count: 0
    },
    {
      day: "Mon",
      count: 0
    },
    {
      day: "Tue",
      count: 0
    },
    {
      day: "Wed",
      count: 0
    },
    {
      day: "Thu",
      count: 0
    },
    {
      day: "Fri",
      count: 0
    },
    {
      day: "Sat",
      count: 101
    }
  ],
  tournamentsByMonth: [
    {
      month: "Jan",
      count: 0
    },
    {
      month: "Feb",
      count: 0
    },
    {
      month: "Mar",
      count: 0
    },
    {
      month: "Apr",
      count: 0
    },
    {
      month: "May",
      count: 0
    },
    {
      month: "Jun",
      count: 0
    },
    {
      month: "Jul",
      count: 0
    },
    {
      month: "Aug",
      count: 0
    },
    {
      month: "Sep",
      count: 101
    },
    {
      month: "Oct",
      count: 0
    },
    {
      month: "Nov",
      count: 0
    },
    {
      month: "Dec",
      count: 0
    }
  ],
  eventTypeBreakdown: [
    {
      type: 1,
      count: 201
    },
    {
      type: 5,
      count: 9
    }
  ]
}
