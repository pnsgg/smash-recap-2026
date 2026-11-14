# Style guide: recap card (the downloadable image)

One tall image per recap, player or organizer, shared as is. It replaces the six per-platform
arcade stills.

## References (grammar only, never their content, logos or characters)

1. **start.gg PlayerRank cards** (UltRank 2025/2026 player pages, a European power ranking card):
   the grammar of an esports player card.
   - A huge display-type name with a heavy outline or hard shadow, the subtitle under it.
   - One framed portrait on the side, a character render overlapping its frame.
   - Stat pills: a quiet label, then the figure in a solid pill (`Score 100.00`, `Top 25 17W - 9L`).
   - Tournament rows: logo square, placement set huge (`1st`), the tournament name on a bar above
     a strip of the players beaten, each one as a character icon over their name.
   - A grid of rounded panels under it, each with a title bar: head to heads with big W-L pills,
     a "best wins" grid of character icons with a `x3` count, characters used.
   - One saturated theme over a patterned ground; everything aligned to a few columns.
2. **SmashRecap brand** (`style_guide-player-arcade.md`, `apps/web/src/styles/global.css`): the
   palette, the display face and the arcade vocabulary stay, so the card is ours.

## Hybrid rules

- **Palette:** the brand tokens only (ground, raised, ink, muted, accent, gold, osd green, casing).
  The "one saturated theme" is the arcade's: near-black green ground, red accent, gold for wins.
- **Type:** DOSIyagiBoldface for the name, titles and placements (multiples of 16 px in design
  units); the 5×7 pixel face for W-L and counts (the pixel accent); Libre Franklin for names and
  captions.
- **Pictures are crisp** (avatars, renders, stock icons, logos): no pixelation, unlike the video.
  Scanlines over the whole card are the only CRT effect.
- **Pills** are cabinet plastic (casing) with ground-coloured figures; panels are square and raised with a
  raised-2 title bar.
- **Stats are named for what they are** (`Biggest events`, `Most wins over`), never a guessed tier.
- Design units 960 × 1080, rendered ×2: 1920 × 2160.
