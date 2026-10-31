import type { PlayerRecapProps } from "@shared";
import { RECAP_YEAR } from "../config";

const nf = new Intl.NumberFormat("en");
export const formatNumber = (n: number) => nf.format(n);
export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;
export const formatSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const displayName = (prefix: string | null | undefined, gamerTag: string) =>
  prefix ? `${prefix} ${gamerTag}` : gamerTag;

/** Short summary sentence for a player, used on the top players screen and the recap page. */
export function playerSummary(recap: PlayerRecapProps) {
  const main = recap.mostPlayedCharacters[0];
  const endSentence = (s: string) => (s.endsWith(".") ? s : `${s}.`);
  const parts = [
    `${formatNumber(recap.totalTournaments)} tournaments and ${formatNumber(recap.totalSets)} sets in ${RECAP_YEAR}.`,
  ];
  if (main) parts.push(endSentence(`Mostly ${main.characterName}`));
  return parts.join(" ");
}
