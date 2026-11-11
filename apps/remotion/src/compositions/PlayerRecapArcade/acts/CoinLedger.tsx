import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import { dayName, type ArcadeData } from "../data";
import { snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { COIN_STACKED, CROWN, GOLD } from "../components/sprites";
import { caption, color, display, displayCase, fitDisplay } from "../theme";

// Months fill up, their coins drop out of the bottom, then the weekdays fill up the same way.
const DROP_AT = 120;
const DAYS_AT = 140;
const LANDED = 70;
const SERIES_AT = 280;
const BASE = 466;
const CHART = { left: 44, width: 512, height: 280 } as const;
const COIN_W = 10;

type Column = { label: string; count: number };

const slots = (columns: Column[]) => columns.flatMap((c, col) => Array.from({ length: c.count }, (_, row) => ({ col, row })));

const layout = (columns: Column[], px: number) => {
  const pitch = CHART.width / columns.length;
  const max = Math.max(1, ...columns.map((c) => c.count));
  // Coins sit a hair apart when there's room, and overlap into a tight stack when there isn't.
  const step = Math.min(px * 4.5, (CHART.height - px * 4) / max);
  return {
    pitch,
    step,
    x: (col: number) => CHART.left + col * pitch + (pitch - COIN_W * px) / 2,
    y: (row: number) => BASE - px * 4 - row * step,
  };
};

const Labels: React.FC<{ columns: Column[]; t: number; highlight: number; size: number }> = ({ columns, t, highlight, size }) => {
  const pitch = CHART.width / columns.length;
  return (
    <>
      {columns.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: CHART.left + i * pitch, width: pitch, top: BASE + 12, textAlign: "center", opacity: snap(t, i * 2) }}>
          <div style={display(16, i === highlight ? color.gold : c.count > 0 ? color.ink : color.cardMuted)}>{c.label}</div>
          {size > 0 ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <PixelText text={String(c.count)} px={size} fill={i === highlight ? color.gold : color.muted} />
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
};

export type LedgerData = Pick<ArcadeData, "months" | "days" | "busiestMonth" | "busiestDay" | "series">;

const Series: React.FC<{ t: number; data: LedgerData }> = ({ t, data }) => (
  <>
    <div style={{ position: "absolute", left: 44, top: 44 }}>
      <Slam frame={t} at={0} text="YOUR SERIES" style={display(32, color.gold)} fill={color.gold} />
      <div style={{ ...caption, marginTop: 12, opacity: snap(t, 6) }}>Series you entered most</div>
    </div>
    {data.series.map((s, i) => {
      const name = displayCase(s.name);
      return (
        <div
          key={s.name}
          style={{
            position: "absolute",
            left: 44,
            top: 132 + i * 150,
            display: "flex",
            alignItems: "center",
            gap: 24,
            transform: `translateX(${interpolate(snap(t, 6 + i * 10), [0, 1], [-560, 0])}px)`,
          }}
        >
          <div style={{ width: 112, height: 112, flex: "none", outline: `5px solid ${i === 0 ? color.gold : color.casingDeep}`, backgroundColor: color.raised2 }}>
            <PixelImage src={s.imageUrl} rows={28} px={4} mode="photo" levels={5} fallback={<Sprite rows={COIN_STACKED} palette={GOLD} px={10} />} />
          </div>
          <div>
            <div style={display(fitDisplay(name, 48, 360), i === 0 ? color.ink : color.muted)}>{name}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
              <PixelText text={String(s.count)} px={6} fill={i === 0 ? color.gold : color.muted} />
              <div style={{ ...caption, lineHeight: 1 }}>tournaments</div>
            </div>
          </div>
        </div>
      );
    })}
  </>
);

/** One coin per tournament falling onto its column, in order; all are down by frame 66 whatever their number. */
const Rain: React.FC<{ t: number; columns: Column[]; px: number; dropAt?: number }> = ({ t, columns, px, dropAt = Infinity }) => {
  const grid = layout(columns, px);
  const all = slots(columns);
  const landAt = (k: number) => 6 + (k * 50) / Math.max(1, all.length);
  return (
    <>
      {all.map((slot, k) => {
        const fall = interpolate(t, [landAt(k), landAt(k) + 10], [0, 1], { ...clamp, easing: (x) => x * x });
        if (fall <= 0) return null;
        const home = grid.y(slot.row);
        // Dropping out: the bottom of each stack goes first, the whole chart is gone in 16 frames.
        const gone = Math.max(0, t - dropAt - (slot.row / Math.max(1, columns[slot.col]!.count)) * 6);
        const y = home - (1 - fall) * (home + 40) + gone * gone * 3;
        return (
          <div key={k} style={{ position: "absolute", left: grid.x(slot.col), top: y }}>
            <Sprite rows={COIN_STACKED} palette={GOLD} px={px} />
          </div>
        );
      })}
    </>
  );
};

const landedCount = (columns: Column[], t: number) => {
  const total = slots(columns).length;
  return Array.from({ length: total }, (_, k) => 6 + (k * 50) / Math.max(1, total)).filter((at) => t >= at + 10).length;
};

const Crown: React.FC<{ columns: Column[]; px: number; index: number }> = ({ columns, px, index }) => {
  const grid = layout(columns, px);
  return (
    <div style={{ position: "absolute", left: grid.x(index) + (COIN_W * px - 44) / 2, top: grid.y(columns[index]!.count - 1) - 44 }}>
      <Sprite rows={CROWN} palette={GOLD} px={4} />
    </div>
  );
};

const Count: React.FC<{ t: number; columns: Column[]; by: string }> = ({ t, columns, by }) => (
  <>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
      <PixelText text={String(landedCount(columns, t))} px={8} fill={color.gold} />
      <div style={{ ...display(32), marginBottom: -2 }}>TOURNAMENTS</div>
    </div>
    <div style={{ ...caption, marginTop: 12, opacity: snap(t, 4) }}>One coin per tournament, by {by}</div>
  </>
);

export const CoinLedger: React.FC<{ t: number; data: LedgerData }> = ({ t, data }) => {
  if (t >= SERIES_AT && data.series.length > 0) return <Series t={t - SERIES_AT} data={data} />;

  const months: Column[] = data.months.map((m) => ({ label: m.month.slice(0, 1).toUpperCase(), count: m.count }));
  const days: Column[] = data.days.map((d) => ({ label: d.day.slice(0, 3).toUpperCase(), count: d.count }));
  const busiestMonth = data.busiestMonth ? data.months.indexOf(data.busiestMonth) : -1;
  const busiestDay = data.busiestDay ? data.days.indexOf(data.busiestDay) : -1;
  const toDays = t >= DAYS_AT;
  const d = t - DAYS_AT;

  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, height: 80 }}>
        {!toDays ? (
          <div style={{ opacity: t < DROP_AT ? 1 : 0 }}>
            <Count t={t} columns={months} by="month" />
          </div>
        ) : d < LANDED || !data.busiestDay ? (
          <Count t={d} columns={days} by="weekday" />
        ) : (
          <>
            <Slam frame={d} at={LANDED} text={dayName(data.busiestDay.day)} style={display(48, color.gold)} fill={color.gold} />
            <div style={{ ...caption, fontSize: 18, marginTop: 12, opacity: snap(d, LANDED + 6) }}>
              Busiest day · {data.busiestDay.count} tournaments
            </div>
          </>
        )}
      </div>

      {!toDays ? <Rain t={t} columns={months} px={4} dropAt={DROP_AT} /> : <Rain t={d} columns={days} px={5} />}
      {!toDays && busiestMonth >= 0 && t >= LANDED && t < DROP_AT ? <Crown columns={months} px={4} index={busiestMonth} /> : null}
      {toDays && busiestDay >= 0 && d >= LANDED ? <Crown columns={days} px={5} index={busiestDay} /> : null}

      <div style={{ position: "absolute", left: CHART.left, width: CHART.width, top: BASE, height: 4, backgroundColor: color.casingDeep }} />
      {!toDays ? (
        <div style={{ opacity: t < DROP_AT ? 1 : 0 }}>
          <Labels columns={months} t={t} highlight={busiestMonth} size={t >= LANDED ? 3 : 0} />
        </div>
      ) : (
        <Labels columns={days} t={d} highlight={busiestDay} size={d >= LANDED ? 3 : 0} />
      )}
    </>
  );
};
