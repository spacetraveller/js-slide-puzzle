# js-slide-puzzle

A Javascript slide puzzle using the createJS framework

Example provided in the index.html file with a sample image.

Sample background image contains edited wood texture, courtesy of http://www.freepik.com

```javascript
import PuzzleManager from "./puzzleManager";
const config = {
  canvasTargetId: "puzzleGameCanvas",
  //reordering: [],
  reordering: [13, 1, 9, 2, 0, 11, 7, 3, 4, 14, 8, 5, 12, 15, 10, 6], //
  debug: false,
  outputRawPositions: false,
  piecesPerRow: 4,
  framerate: 25,
  targetImage: "./img/samoa.png",
  backgroundImage: "./img/background.png",
  homePosition: 12,
  puzzleOffset: [26, 123],
  onLoad: onPuzzleLoad,
  onSolvePiece: null,
  onSolvePuzzle: onSolvePuzzle,
};

window.onload = function () {
  puzzle = new PuzzleManager(config);
};
```

An empty "reordering" array with "debug" turned off, will result in a random tile configuration. However, there is the chance that there will be no solution to this random layout. In order to handle that, there is a check that runs until a completable solution is discovered.

Using the ouputRawPositions config, you can determine a replayable position that can be executed and copied into the reordering array. However, please note that currently, you must leave the "free" or "home" position in the home position as defined in the configuration when trying to assemble a puzzle. In other words, the home position in your preferred puzzle scramble, must be the empty piece, even though the other pieces are scrambled.

Current version: 0.2.0
