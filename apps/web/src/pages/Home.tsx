import type { PlayerRecapProps } from "@shared";
import type { Settled } from "../api";
import { CharacterSelect } from "../components/CharacterSelect";
import { Hero } from "../components/Hero";
import { SiteFooter } from "../components/SiteFooter";

type Props = {
  featured: Promise<Settled<PlayerRecapProps>>[];
};

export const Home = ({ featured }: Props) => (
  <>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <Hero />
    <main id="main">
      <CharacterSelect recaps={featured} />
    </main>
    <SiteFooter />
  </>
);
