// Rasterize public/icon.svg into the PNG sizes PWAs need.
// Run: pnpm icons
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = new URL('../public/icon.svg', import.meta.url).pathname
const OUT = new URL('../public/icons/', import.meta.url).pathname

await mkdir(OUT, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'maskable-512.png', size: 512 }, // art is full-bleed with safe center zone
  { file: 'apple-touch-icon-180.png', size: 180 },
]

for (const t of targets) {
  await sharp(SRC, { density: 300 })
    .resize(t.size, t.size)
    .png()
    .toFile(OUT + t.file)
  console.log(`wrote public/icons/${t.file}`)
}
