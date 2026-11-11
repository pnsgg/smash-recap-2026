import type { PlayerRecapProps } from "@shared";
import type { RecapStats, Settled } from "../api";
import { CharacterSelect } from "../components/CharacterSelect";
import { Hero, type HeroPreview } from "../components/Hero";
import { SiteFooter } from "../components/SiteFooter";

type Props = {
  featured: Promise<Settled<PlayerRecapProps>>[];
  preview: HeroPreview;
  stats: Promise<Settled<RecapStats>>;
};

export const Home = ({ featured, preview, stats }: Props) => (
  <>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <Hero preview={preview} stats={stats} />
    <main id="main">
      <CharacterSelect recaps={featured} />
    </main>
    <SiteFooter />
  </>
);
