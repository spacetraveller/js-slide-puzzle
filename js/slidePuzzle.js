const config = {
  canvasTargetId: "puzzleGameCanvas",
  reordering: [],
  //reordering: [13, 1, 9, 2, 0, 11, 7, 3, 4, 14, 8, 5, 12, 15, 10, 6], //
  debug: false,
  outputRawPositions: false,
  piecesPerRow: 3,
  framerate: 50,
  targetImage: "./img/samoa.png",
  targetImageResize: [548,350],
  backgroundImage: "./img/background.png",
  homePosition: 6,
  puzzleOffset: [26, 123],
  onLoad: onPuzzleLoad,
  onSolvePiece: null,
  onSolvePuzzle: onSolvePuzzle,
};
let puzzle;

import PuzzleManager from "./puzzleManager";

window.onload = function () {
  puzzle = new PuzzleManager(config);
};
function onPuzzleLoad() {
  puzzle.startPuzzle();
}
function onSolvePuzzle() {}
