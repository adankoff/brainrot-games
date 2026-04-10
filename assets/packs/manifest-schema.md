# Skin Pack Manifest Schema

Each skin pack lives in `assets/packs/{pack-id}/` and contains a `manifest.json` plus PNG image files.

## Folder Structure

```
assets/packs/{pack-id}/
  manifest.json          # Required: describes the pack and its images
  protagonist.png        # Required: main playable character
  antagonist.png         # Required: main enemy/obstacle character
  supporting-01.png      # Optional: supporting cast (need 10 for full coverage)
  supporting-02.png
  ...
  supporting-10.png
  collectible.png        # Optional: primary collectible item
  collectible-01.png     # Optional: secondary collectibles (need 5)
  ...
  collectible-05.png
  obstacle-01.png        # Optional: obstacle items (need 3)
  obstacle-02.png
  obstacle-03.png
  projectile.png         # Optional: paper toss projectile
  target.png             # Optional: paper toss target
  background.png         # Optional: background image/pattern
```

## manifest.json Format

```json
{
  "id": "italian-brainrot",
  "name": "ITALIAN BRAINROT",
  "description": "Tralalero, Bombardiro, and the whole Italian brainrot crew",

  "characters": {
    "protagonist": {
      "file": "protagonist.png",
      "name": "Tralalero Tralala",
      "shortName": "Tralalero",
      "emoji": "🦈"
    },
    "antagonist": {
      "file": "antagonist.png",
      "name": "Bombardiro Crocodilo",
      "shortName": "Bombardiro",
      "emoji": "🐊"
    },
    "supporting": [
      { "file": "supporting-01.png", "name": "Lirili Larila", "shortName": "Lirili", "emoji": "🦋" },
      { "file": "supporting-02.png", "name": "Tung Tung Sahur", "shortName": "TungTung", "emoji": "🥁" }
    ]
  },

  "items": {
    "collectible": { "file": "collectible.png", "name": "Brainrot Token", "emoji": "🧠" },
    "collectibles": [
      { "file": "collectible-01.png", "name": "Pasta", "emoji": "🍝" }
    ],
    "obstacles": [
      { "file": "obstacle-01.png", "name": "Mamma Mia Wall", "emoji": "🧱" }
    ],
    "projectile": { "file": "projectile.png", "name": "Meatball", "emoji": "🧆" },
    "target": { "file": "target.png", "name": "Pasta Bowl", "emoji": "🍝" }
  },

  "palette": {
    "primary": "#ff3838",
    "secondary": "#2ecc71",
    "bgTop": "#1a0a0a",
    "bgBottom": "#0a0505"
  }
}
```

## Image Requirements

- **Format**: PNG with transparency (alpha channel)
- **Size**: 256x256px recommended (will be scaled to fit game context)
- **Orientation**: Characters should face RIGHT by default
- **Background**: Transparent (no solid background)
- **Style**: Consistent art style within a pack

## For AI Image Generation

When generating images for a pack:

1. Create the folder: `assets/packs/{keyword}/`
2. Generate each PNG at 256x256 with transparent background
3. Write the `manifest.json` with all file references
4. Add the pack ID to `assets/packs/index.json`

The skin-manager will automatically detect and offer the new pack in all games.
