import { continueRender, delayRender, staticFile } from "remotion";

const FACES = [
  { family: "DOSIyagiBoldface", weight: "400", file: "dos-iyagi-boldface.woff2" },
  ...["500", "700", "800"].flatMap((weight) => [
    { family: "Libre Franklin", weight, file: `libre-franklin-latin-${weight}-normal.woff2` },
    {
      family: "Libre Franklin",
      weight,
      file: `libre-franklin-latin-ext-${weight}-normal.woff2`,
      unicodeRange: "U+0100-024F, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ]),
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === "undefined") {
    return;
  }
  loaded = true;
  const handle = delayRender("Loading fonts");
  Promise.all(
    FACES.map(({ family, weight, file, ...rest }) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, {
        weight,
        ...("unicodeRange" in rest ? { unicodeRange: rest.unicodeRange } : {}),
      });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
