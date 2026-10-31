import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import { dayName, type ArcadeData } from "../data";
import { snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { COIN_STACKED, CROWN, GOLD } from "../components/sprites";
import { caption, color, display, displayCase, fitDisplay } from "../theme";

const DAYS_AT = 130;
const SERIES_AT = 210;
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

export const CoinLedger: React.FC<{ t: number; data: LedgerData }> = ({ t, data }) => {
  if (t >= SERIES_AT && data.series.length > 0) return <Series t={t - SERIES_AT} data={data} />;

  const months: Column[] = data.months.map((m) => ({ label: m.month.slice(0, 1).toUpperCase(), count: m.count }));
  const days: Column[] = data.days.map((d) => ({ label: d.day.slice(0, 3).toUpperCase(), count: d.count }));
  const monthSlots = slots(months);
  const daySlots = slots(days);
  const monthGrid = layout(months, 4);
  const dayGrid = layout(days, 5);
  const total = monthSlots.length;
  // All coins are down by frame 66, whatever their number.
  const landAt = (k: number) => 6 + (k * 50) / Math.max(1, total);
  const landed = monthSlots.filter((_, k) => t >= landAt(k) + 10).length;
  const busiestMonth = data.busiestMonth ? data.months.indexOf(data.busiestMonth) : -1;
  const busiestDay = data.busiestDay ? data.days.indexOf(data.busiestDay) : -1;
  const toDays = t >= DAYS_AT;

  return (
    <>
      {/* Header: the running count, then the busiest weekday */}
      <div style={{ position: "absolute", left: 44, top: 40, height: 80 }}>
        {!toDays ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <PixelText text={String(landed)} px={8} fill={color.gold} />
            <div style={{ ...display(32), marginBottom: -2 }}>TOURNAMENTS</div>
          </div>
        ) : data.busiestDay ? (
          <>
            <Slam frame={t} at={DAYS_AT + 16} text={dayName(data.busiestDay.day)} style={display(48, color.gold)} fill={color.gold} />
            <div style={{ ...caption, fontSize: 18, marginTop: 12, opacity: snap(t, DAYS_AT + 22) }}>
              Busiest day · {data.busiestDay.count} tournaments
            </div>
          </>
        ) : null}
        {!toDays ? <div style={{ ...caption, marginTop: 12, opacity: snap(t, 4) }}>One coin per tournament, by month</div> : null}
      </div>

      {monthSlots.map((slot, k) => {
        const day = daySlots[k];
        const fall = interpolate(t, [landAt(k), landAt(k) + 10], [0, 1], { ...clamp, easing: (x) => x * x });
        const from = { x: monthGrid.x(slot.col), y: monthGrid.y(slot.row) };
        const to = day ? { x: dayGrid.x(day.col), y: dayGrid.y(day.row) } : from;
        const move = interpolate(t, [DAYS_AT + (k / total) * 10, DAYS_AT + 6 + (k / total) * 10], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
        const px = 4 + move;
        const x = from.x + (to.x - from.x) * move;
        const y = (from.y + (to.y - from.y) * move) - (1 - fall) * (from.y + 40) - Math.sin(move * Math.PI) * 60;
        if (fall <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y }}>
            <Sprite rows={COIN_STACKED} palette={GOLD} px={px} />
          </div>
        );
      })}

      {!toDays && busiestMonth >= 0 && t >= 70 ? (
        <div
          style={{
            position: "absolute",
            left: monthGrid.x(busiestMonth) - 2,
            top: monthGrid.y(data.months[busiestMonth]!.count - 1) - 44,
          }}
        >
          <Sprite rows={CROWN} palette={GOLD} px={4} />
        </div>
      ) : null}
      {toDays && busiestDay >= 0 && t >= DAYS_AT + 16 ? (
        <div style={{ position: "absolute", left: dayGrid.x(busiestDay) + 3, top: dayGrid.y(data.days[busiestDay]!.count - 1) - 46 }}>
          <Sprite rows={CROWN} palette={GOLD} px={4} />
        </div>
      ) : null}

      <div style={{ position: "absolute", left: CHART.left, width: CHART.width, top: BASE, height: 4, backgroundColor: color.casingDeep }} />
      {!toDays ? <Labels columns={months} t={t} highlight={busiestMonth} size={t >= 70 ? 3 : 0} /> : <Labels columns={days} t={t - DAYS_AT} highlight={busiestDay} size={3} />}
    </>
  );
};
