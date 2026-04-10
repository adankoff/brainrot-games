# Agent Prompt Template for Game Cloning

## How this works

Each new game is a CLONE of an existing mechanic with NEW themes. The agent's job:

1. **Read the reference game** (the one being cloned)
2. **Copy its main.js structure** — keep the game mechanic identical
3. **Write new themes.js** — the ONLY truly new code. New draw functions, colors, messages.
4. **Adapt main.js** — change gameId, title, theme references, canvas dimensions if needed
5. **Copy any additional JS files** (entities.js, physics.js, etc.) from the reference

## What the agent SHOULD NOT do:
- Reinvent the game mechanic
- Rewrite the game loop
- Change the shared infrastructure API
- Write index.html or style.css (already generated)

## Mechanic Reference Map:
| Mechanic | Clone From | Files to Copy | What Changes |
|----------|-----------|--------------|-------------|
| flappy-bird | game-01 | main.js, player.js, obstacle.js, background.js, characters.js, constants.js, ui.js | themes in constants.js + characters.js |
| whack-a-mole | game-02 | main.js, characters.js, constants.js, effects.js, game.js, holes.js, ui.js | characters.js + constants.js |
| idle-clicker | game-03 | main.js, themes.js, upgrades.js, renderer.js | themes.js + renderer.js |
| endless-runner | game-04 | main.js, themes.js, entities.js, renderer.js | themes.js |
| stack | game-05 | main.js, themes.js, stack.js, renderer.js | themes.js |
| snake | game-06 | main.js, themes.js, snake.js | themes.js |
| 2048 | game-07 | main.js, themes.js, board.js, renderer.js | themes.js |
| fruit-ninja | game-08 | main.js, themes.js, physics.js, slicer.js | themes.js |
| geometry-dash | game-11 | main.js, themes.js, level.js, player.js | themes.js |

## Standard Prompt:
```
Clone [REFERENCE GAME] to build [NEW GAME]. 

CRITICAL: Read ALL files in /games/[REFERENCE]/ first. Copy the game mechanic EXACTLY.
The index.html and style.css are already created at /games/[TARGET]/.
You only need to write the JS files.

Your job: clone all JS files from [REFERENCE] to [TARGET], then REPLACE the themes.

New themes:
1. [THEME NAME]: [description]
2. [THEME NAME]: [description]  
3. [THEME NAME]: [description]

For each theme, provide: drawPlayer/drawHead, drawObstacles/drawObjects, drawBackground, 
colors object, deathMessages array (5+), scoreLabel, accentColor.
```
