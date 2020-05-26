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
}
```

An empty "reordering" array with "debug" turned off, will result in a random tile configuration. However, there is the chance that there will be no solution to this random layout. Needs work to determine if the random solution solves and if not, to either repair or attempt to randomize again, until such time as a working random layout presents itself.

Current version: 0.1.3
