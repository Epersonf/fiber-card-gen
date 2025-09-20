# Fiber Card Gen

**Fiber Card Gen** is a web application for generating and visualizing hair cards using React, Three.js, and React Three Fiber. It provides real‑time 2D/3D visualization, customizable strand parameters, and export options for rendering color and normal maps.

---

## Features

- **Real‑time 2D/3D preview** of hair card sheets
- **Configurable parameters** for strands:
  - Strand points, length, thickness
  - Spread, clumping, frizz, curls, messiness
  - Gradient hair colors and material properties
- **Spawn plane visualization** with radius and tilt adjustments
- **Lighting setup** with directional and point lights, editable in the UI
- **Render toolbar** for exporting:
  - Color map (PNG)
  - Normal map (PNG)
- **Copy/paste state** as JSON for sharing presets

---

## Tech Stack

- **React 19**
- **TypeScript**
- **Three.js** (3D engine)
- **React Three Fiber** (renderer binding)
- **Zustand** (state management)
- **Chroma.js** (color scales)
- **Open Simplex Noise** (procedural frizz/messiness)

---

## Project Structure

- `src/components` → UI and scene components (`.tsx` files, lower camelCase)
- `src/hair` → hair generation logic and operations (`.ts` files, kebab-case)
- `src/store` → Zustand state store
- `src/utils` → math, noise, rendering, and helper utilities
- `src/models` → TypeScript type definitions

---

## Scripts

- `npm start` → run development server
- `npm build` → build for production
- `npm test` → run tests
- `npm run deploy` → build and deploy to GitHub Pages

The project is published at:
[https://epersonf.github.io/fiber-card-gen](https://epersonf.github.io/fiber-card-gen)

---

## Installation

```bash
# clone repository
git clone https://github.com/epersonf/fiber-card-gen
cd fiber-card-gen

# install dependencies
npm install

# run in dev mode
npm start
```

---

## License

Licensed under the [MIT License](LICENSE).