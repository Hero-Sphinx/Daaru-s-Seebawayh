/**
 * Renders the site icon — a gold س on the green tile, as in the header — to
 * the PNGs Next.js serves as the favicon (src/app/icon.png) and the home-screen
 * icon (src/app/apple-icon.png). Rendered once, here, so every device shows the
 * same letter whatever fonts it has.   node scripts/make-icons.mjs
 */
import sharp from "sharp";

const FONT = process.env.ICON_FONT ?? "Traditional Arabic";

function svg(size, { rounded }) {
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#047857"/>
      <stop offset="1" stop-color="#115e59"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${(r / size) * 512}" fill="url(#bg)"/>
  <rect x="20" y="20" width="472" height="472" rx="${Math.max(0, (r / size) * 512 - 16)}" fill="none" stroke="#fcd34d" stroke-opacity="0.45" stroke-width="10"/>
  <text x="256" y="292" text-anchor="middle" font-family="${FONT}" font-size="440" font-weight="bold" fill="url(#gold)">س</text>
</svg>`;
}

const outputs = [
  { file: "src/app/icon.png", size: 512, rounded: true },
  // iOS draws its own rounded corners on home-screen icons — give it a full square.
  { file: "src/app/apple-icon.png", size: 180, rounded: false },
];
for (const o of outputs) {
  await sharp(Buffer.from(svg(o.size, o))).resize(o.size, o.size).png().toFile(o.file);
  console.log("wrote", o.file);
}
