/** Small square-wave sounds made with Web Audio, so there are no files to load. Silent until enabled. */
type Note = [frequency: number, startS: number, lengthS: number];

const SOUNDS: Record<string, Note[]> = {
  blip: [[660, 0, 0.04]],
  select: [[880, 0, 0.05], [1320, 0.05, 0.06]],
  coin: [[988, 0, 0.08], [1319, 0.08, 0.32]],
  tick: [[440, 0, 0.06]],
  over: [[392, 0, 0.18], [330, 0.2, 0.18], [262, 0.4, 0.4]],
};

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function play(name: keyof typeof SOUNDS) {
  if (!enabled) return;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  const now = ctx.currentTime;
  for (const [frequency, start, length] of SOUNDS[name]!) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.06, now + start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + length + 0.02);
  }
}
