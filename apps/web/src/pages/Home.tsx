import type { PlayerRecapProps, TournamentOrganizerRecapProps } from "@shared";
import type { Settled } from "../api";
import { CharacterSelect } from "../components/CharacterSelect";
import { ContinueScreen } from "../components/ContinueScreen";
import { Hero } from "../components/Hero";
import { RecapMenu } from "../components/RecapMenu";
import { SiteFooter } from "../components/SiteFooter";

type Props = {
  featured: Promise<Settled<PlayerRecapProps>>[];
  menu: {
    player: Promise<Settled<PlayerRecapProps>>;
    organizer: Promise<Settled<TournamentOrganizerRecapProps>>;
  };
};

export const Home = ({ featured, menu }: Props) => (
  <>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <Hero />
    <main id="main">
      <RecapMenu player={menu.player} organizer={menu.organizer} />
      <CharacterSelect recaps={featured} />
      <ContinueScreen />
    </main>
    <SiteFooter />
  </>
);
