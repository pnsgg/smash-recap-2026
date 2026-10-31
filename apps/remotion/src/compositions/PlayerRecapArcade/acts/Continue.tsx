import type { ActProps } from "../../PlayerRecapArcade";
import { Chip, snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, pixelWidth } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { blink, caption, color, display, displayCase, fitDisplay } from "../theme";
import { LENGTH, POWER_OFF } from "../timing";

export const SITE = "recap2026.pns.gg";
const TICK = 26;
const FROM = 5;

type ScoreRow = { label: string; value: number; note?: string };

export const Continue: React.FC<ActProps> = ({ t, data }) => (
  <HiScoreContinue
    t={t}
    length={LENGTH.continue}
    tag={data.tag}
    prefix={data.prefix}
    avatarUrl={data.avatarUrl}
    iconUrl={data.main?.stockIconUrl ?? null}
    slot="1P"
    rows={[
      { label: "TOURNAMENTS", value: data.totalTournaments },
      { label: "SETS", value: data.totalSets },
      { label: "EVENTS", value: data.events.total, note: `${data.events.singles} singles · ${data.events.teams} teams` },
      { label: "DISQUALIFIED", value: data.disqualifications },
    ]}
  />
);

export const HiScoreContinue: React.FC<{
  t: number;
  length: number;
  tag: string;
  prefix: string | null;
  avatarUrl: string | null;
  iconUrl: string | null;
  slot: string;
  rows: ScoreRow[];
}> = ({ t, length, tag, prefix, avatarUrl, iconUrl, slot, rows }) => {
  const zeroAt = length - POWER_OFF - 4;
  const continueAt = zeroAt - FROM * TICK;
  if (t >= continueAt) {
    const since = t - continueAt;
    const count = Math.max(0, FROM - Math.floor(since / TICK));
    return (
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 60, display: "flex", justifyContent: "center" }}>
          <Slam frame={since} at={0} text="CONTINUE?" style={display(64, color.accent)} fill={color.accent} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 156, display: "flex", justifyContent: "center", opacity: snap(since, 4) }}>
          <PixelText text={String(count)} px={22} fill={color.ink} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 344, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Slam frame={since} at={10} text="YOUR TURN!" style={display(32, color.gold)} fill={color.gold} />
          <div style={{ ...display(fitDisplay(SITE, 48, 500)), opacity: snap(since, 16) }}>{SITE}</div>
          <div style={{ ...caption, fontSize: 18, color: blink(since) ? color.ink : color.muted, opacity: snap(since, 22) }}>Look up any start.gg tag</div>
        </div>
      </>
    );
  }

  const name = displayCase(tag);

  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, display: "flex", alignItems: "center", gap: 14 }}>
        <Slam frame={t} at={0} text="SEASON TOTALS" style={display(32, color.gold)} fill={color.gold} />
        <div style={{ ...caption, opacity: snap(t, 4) }}>2026</div>
      </div>

      <div style={{ position: "absolute", left: 44, right: 44, top: 96, display: "flex", alignItems: "center", gap: 18, opacity: snap(t, 6) }}>
        <div style={{ width: 72, height: 72, flex: "none", outline: `4px solid ${color.casingDeep}` }}>
          <PixelImage src={avatarUrl} rows={12} px={6} mode="photo" levels={5} fallback={<Chip text={slot} size={32} />} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {prefix ? <div style={display(16, color.muted)}>{displayCase(prefix)}</div> : null}
          <div style={{ ...display(fitDisplay(name, 48, 330)), marginTop: 6 }}>{name}</div>
        </div>
        <PixelImage src={iconUrl} rows={16} px={4} />
      </div>

      <div style={{ position: "absolute", left: 44, right: 44, top: 204 }}>
        {rows.map((row, i) => {
          const value = String(row.value);
          return (
            <div key={row.label} style={{ height: 78, opacity: t >= 12 + i * 6 ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PixelText text={String(i + 1)} px={3} fill={i === 0 ? color.gold : color.muted} />
                <div style={display(32, i === 0 ? color.gold : color.ink)}>{row.label}</div>
                {/* Dot leaders, the way a score table lines up its numbers */}
                <div style={{ flex: 1, height: 4, marginTop: 14, backgroundImage: `linear-gradient(90deg, ${color.cardMuted} 4px, transparent 4px)`, backgroundSize: "12px 4px" }} />
                <div style={{ width: pixelWidth(value, 5) }}>
                  <PixelText text={value} px={5} fill={i === 0 ? color.gold : color.ink} />
                </div>
              </div>
              {row.note ? <div style={{ ...caption, marginTop: 4, marginLeft: 30 }}>{row.note}</div> : null}
            </div>
          );
        })}
      </div>
    </>
  );
};
