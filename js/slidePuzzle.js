const config = {
  canvasTargetId: "puzzleGameCanvas",
  //reordering: [],
  reordering: [13, 1, 9, 2, 0, 11, 7, 3, 4, 14, 8, 5, 12, 15, 10, 6], //
  debug: false,
  piecesPerRow: 4,
  framerate: 60,
  targetImage: "./img/samoa.png",
  homePosition: 12,
  puzzleOffset: [50, 50],
};

import PuzzleManager from "./puzzleManager";

window.onload = function () {
  let puzzle = new PuzzleManager(config);
};
