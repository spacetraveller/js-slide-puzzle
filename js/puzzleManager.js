/*
js-slide puzzle with createJS
Version: 0.1.2
Author: D. Hersch
http://twitter.com/marsoups
Licensed under the MIT License
Copyright (c) 2020
*/

export default class PuzzleManager {
  constructor(config) {
    if (!createjs)
      return alert("Create JS Library not detected. Please install!");
    if (!createjs.BitmapData)
      return alert("Create JS plugin BitmapData not detected. Please install!");

    this.loadQueue = new createjs.LoadQueue();
    this.puzzleContainer = new createjs.Container();
    this.debugContainer = new createjs.Container();
    this.imageMap = [];
    this.containers = [];
    this.dimensionPiece = [];
    this.dimensionStage = [0, 0];
    this.selectOffset = [0, 0];
    this.moveCount = 0;
    this.moveGrossCount = 0;
    this.solvedPieces = 0;
    this.config = config;
    this.boundsContainers;
    this.timeStart;
    this.timeEnd;

    this.stage = new createjs.Stage(config.canvasTargetId);
    this.loadAssets();
  }
  initPuzzle() {
    const {
      reordering,
      framerate,
      homePosition,
      debug,
      piecesPerRow,
    } = this.config;
    const { stage, loadQueue } = this;
    console.log(
      "IMAGE SIZE : ",
      loadQueue.getResult("main").width,
      loadQueue.getResult("main").height
    );
    this.dimensionStage[0] = loadQueue.getResult("main").width;
    this.dimensionStage[1] = loadQueue.getResult("main").height;
    createjs.Touch.enable(stage);
    createjs.Ticker.framerate = framerate;
    createjs.Ticker.addEventListener("tick", function () {
      stage.update();
    });

    // check for randomization
    if (reordering && reordering.length === 0 && !debug) {
      let randomProvider = [];
      for (let i = 0; i < Math.pow(piecesPerRow, 2); i++) {
        if (i !== homePosition) randomProvider.push(i);
      }
      while (randomProvider.length > 0) {
        let newVal = randomProvider.splice(
          Math.floor(Math.random() * randomProvider.length),
          1
        );
        reordering.push(newVal[0]);
      }
      reordering.splice(homePosition, 0, homePosition);

      // TODO: Verify solvability based on forumla.
      // https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html
      console.log(
        "Caution: This puzzle may be unsolvable. Error handling not yet available"
      );
    }
    // fix reordering list
    if (reordering && reordering.length > 0) {
      let fixIndex = reordering[homePosition];
      reordering[homePosition] = -1;
      for (let i = 0; i < reordering.length; i++) {
        if (reordering[i] > fixIndex) reordering[i] -= 1;
      }
    }
    console.log("After adjust : ", reordering);

    this.sliceMap(loadQueue.getResult("main"));
    this.addSlicesToStage();

    if (loadQueue.getResult("background")) {
      let bg = new createjs.Container();
      bg.addChild(new createjs.Bitmap(loadQueue.getResult("background")));
      this.stage.addChildAt(bg, 0);
    }
  }
  startPuzzle() {
    const { containers } = this;
    for (let i = 0; i < containers.length; i++) {
      containers[i].addEventListener("mousedown", (evt) => {
        this.handleSelectPiece(evt);
      });
      containers[i].addEventListener("pressmove", (evt) => {
        this.handlePressMove(evt);
      });
      containers[i].addEventListener("pressup", (evt) => {
        this.handleDeselect(evt);
      });
    }
    this.timeStart = new Date();
  }
  handleSelectPiece(evt) {
    let { stage, selectOffset } = this;

    selectOffset[0] = evt.localX;
    selectOffset[1] = evt.localY;
    stage.setChildIndex(evt.currentTarget, stage.numChildren - 1);

    // calculate intersections...
    this.calculateDragBounds(evt.currentTarget);
  }
  handlePressMove(evt) {
    let { selectOffset, boundsContainers, dimensionPiece } = this;
    let { puzzleOffset } = this.config;
    evt.currentTarget.x = -puzzleOffset[0] + evt.stageX - selectOffset[0];
    evt.currentTarget.y = -puzzleOffset[1] + evt.stageY - selectOffset[1];

    if (boundsContainers !== null) {
      // x axis
      if (boundsContainers[0].x > evt.currentTarget.x)
        evt.currentTarget.x = boundsContainers[0].x;
      if (
        boundsContainers[0].x + boundsContainers[0].width <
        evt.currentTarget.x + dimensionPiece[0]
      )
        evt.currentTarget.x =
          boundsContainers[0].x + boundsContainers[0].width - dimensionPiece[0];
      // y axis
      if (boundsContainers[1].y > evt.currentTarget.y)
        evt.currentTarget.y = boundsContainers[1].y;
      if (
        boundsContainers[1].y + boundsContainers[1].height <
        evt.currentTarget.y + dimensionPiece[1]
      )
        evt.currentTarget.y =
          boundsContainers[1].y +
          boundsContainers[1].height -
          dimensionPiece[1];
    }
  }

  handleDeselect(evt) {
    let { dimensionPiece } = this;
    const { piecesPerRow: pieces, onSolvePiece } = this.config;

    this.moveGrossCount++;

    if (
      evt.currentTarget.x % dimensionPiece[0] < 2 &&
      evt.currentTarget.y % dimensionPiece[1] < 2
    ) {
      evt.currentTarget.x =
        dimensionPiece[0] * Math.floor(evt.currentTarget.x / dimensionPiece[0]);
      evt.currentTarget.y =
        dimensionPiece[1] * Math.floor(evt.currentTarget.y / dimensionPiece[1]);
      this.moveCount++;

      this.checkSolved();
      let pieceIndex =
        Math.floor(evt.currentTarget.y / dimensionPiece[1]) * pieces +
        Math.floor(evt.currentTarget.x / dimensionPiece[0]);
      if (pieceIndex === evt.currentTarget.myIndex) {
        // Solved a piece!!
        console.log("Total solved pieces", this.solvedPieces);
        if (onSolvePiece) onSolvePiece();
      }
    }
  }
  getTimeTaken() {
    this.timeEnd = new Date();
    return this.timeEnd - this.timeStart;
  }
  checkSolved() {
    const { containers, dimensionPiece } = this;
    const { piecesPerRow: pieces } = this.config;
    this.solvedPieces = 0;
    for (let i = 0; i < containers.length; i++) {
      let pieceIndex =
        Math.floor(containers[i].y / dimensionPiece[1]) * pieces +
        Math.floor(containers[i].x / dimensionPiece[0]);
      if (pieceIndex === containers[i].myIndex) {
        this.solvedPieces++;
      }
    }
    if (this.solvedPieces === Math.pow(pieces, 2) - 1) {
      this.onSolvePuzzle();
    }
  }
  onSolvePuzzle() {
    const { onSolvePuzzle } = this.config;

    console.log(
      "Completed the game!!!! Completed in " +
        this.moveGrossCount +
        " movements & " +
        this.moveCount +
        " moves!!",
      "Solved in " + this.getTimeTaken() + "ms"
    );
    for (let i = 0; i < this.containers.length; i++) {
      this.containers[i].removeAllEventListeners();
    }
    // completed game logic trigger.
    if (onSolvePuzzle) onSolvePuzzle();
  }
  calculateDragBounds(targetClip) {
    // draw intersection checker.
    const { debug } = this.config;
    const { Rectangle } = createjs;
    let { containers, dimensionPiece, dimensionStage } = this;
    let scopeY = new Rectangle(
      targetClip.x + 1,
      0,
      dimensionPiece[0] - 2,
      dimensionStage[1]
    );
    let scopeX = new Rectangle(
      0,
      targetClip.y + 1,
      dimensionStage[0],
      dimensionPiece[1] - 2
    );
    this.boundsContainers = [scopeX, scopeY];

    for (let i = 0; i < containers.length; i++) {
      if (containers[i] === targetClip) {
        // ignore.
      } else {
        if (scopeY.intersects(containers[i].getTransformedBounds())) {
          // evaluate intersection
          if (
            targetClip.y > containers[i].y &&
            scopeY.y < containers[i].y + dimensionPiece[1]
          ) {
            scopeY.height =
              scopeY.height - (containers[i].y + dimensionPiece[1] - scopeY.y);
            scopeY.y = containers[i].y + dimensionPiece[1];
          } else if (scopeY.y + scopeY.height > containers[i].y) {
            scopeY.height = containers[i].y - scopeY.y;
          }
        }
        if (scopeX.intersects(containers[i].getTransformedBounds())) {
          // evaluate intersection
          if (
            targetClip.x > containers[i].x &&
            scopeX.x < containers[i].x + dimensionPiece[0]
          ) {
            // LHS
            scopeX.width =
              scopeX.width - (containers[i].x + dimensionPiece[0] - scopeX.x);
            scopeX.x = containers[i].x + dimensionPiece[0];
          } else if (
            scopeX.x + scopeX.width > containers[i].x &&
            scopeX.x < containers[i].x
          ) {
            // RHS
            scopeX.width = containers[i].x - scopeX.x;
          }
        }
      }
    }

    // if container goes over the edge, trim.
    if (scopeX.x + scopeX.width > dimensionStage[0]) {
      scopeX.width =
        scopeX.width - (scopeX.x + scopeX.width - dimensionStage[0]);
    }
    if (scopeY.y + scopeY.height > dimensionStage[1]) {
      scopeY.height =
        scopeY.height - (scopeY.y + scopeY.height - dimensionStage[1]);
    }

    if (debug) this.showDebugPositions();
  }

  sliceMap(_htmlImg) {
    // generate mapping.
    const { BitmapData, Rectangle, Bitmap } = createjs;
    const { dimensionPiece, imageMap } = this;
    const { piecesPerRow: pieces, homePosition } = this.config;

    let pieceXSize = (dimensionPiece[0] = _htmlImg.width / pieces);
    let pieceYSize = (dimensionPiece[1] = _htmlImg.height / pieces);

    let tgtPoint = new createjs.Point();

    for (let y = 0; y < pieces; y++) {
      for (let x = 0; x < pieces; x++) {
        let bm = new BitmapData(null, pieceXSize, pieceYSize, 0x000000);
        let sourceRect = new Rectangle(
          x * pieceXSize,
          y * pieceYSize,
          pieceXSize,
          pieceYSize
        );
        bm.copyPixels(_htmlImg, sourceRect, tgtPoint);
        let _bm = new Bitmap(bm.canvas);
        imageMap.push(_bm);
      }
    }
    imageMap[homePosition] = null;
  }
  addSlicesToStage() {
    // assumes slices have been generated in slice array.
    const { Container, Graphics, Shape } = createjs;
    const {
      piecesPerRow: pieces,
      reordering,
      debug,
      puzzleOffset,
      onLoad,
    } = this.config;
    const {
      containers,
      stage,
      dimensionPiece,
      imageMap,
      puzzleContainer,
    } = this;

    stage.addChild(puzzleContainer);
    puzzleContainer.x = puzzleOffset[0];
    puzzleContainer.y = puzzleOffset[1];

    let border = new Graphics();
    border.setStrokeStyle(1);
    border.beginStroke("#333333");

    border.drawRect(0, 0, dimensionPiece[0], dimensionPiece[1]);
    for (let y = 0; y < pieces; y++) {
      for (let x = 0; x < pieces; x++) {
        if (x + y * pieces < Math.pow(pieces, 2)) {
          let index = x + y * pieces;
          if (!imageMap[index]) {
            // do nothing
          } else {
            let pc = new Container();
            pc.addChild(imageMap[index]);
            pc.x = x * dimensionPiece[0];
            pc.y = y * dimensionPiece[1];

            let g = new Shape(border);
            pc.addChild(g);
            containers.push(pc);
            containers[containers.length - 1].myIndex = index;

            puzzleContainer.addChild(pc);
          }
        }
      }
    }
    if (reordering && reordering.length > 0) {
      for (let i = 0; i < reordering.length; i++) {
        if (reordering[i] == -1) continue;
        else {
          containers[reordering[i]].x = (i % pieces) * dimensionPiece[0];
          containers[reordering[i]].y =
            Math.floor(i / pieces) * dimensionPiece[1];
          containers[reordering[i]].startIndex = i;
          if (debug)
            containers[reordering[i]].addChild(
              new createjs.Text("#" + i, "24px Arial", "#ff2222")
            );
        }
      }
    }

    if (onLoad) {
      onLoad();
    } else {
      this.startPuzzle();
    }
  }
  loadAssets() {
    const { targetImage, backgroundImage } = this.config;
    let manifest = [{ id: "main", src: targetImage }];
    if (backgroundImage)
      manifest.push({ id: "background", src: backgroundImage });

    this.loadQueue.loadManifest(manifest);
    this.loadQueue.on("complete", this.handleLoadComplete, this);
  }
  handleLoadComplete() {
    this.initPuzzle();
  }
  showDebugPositions() {
    const { Graphics, Shape } = createjs;
    let { debugContainer, boundsContainers, puzzleContainer } = this;
    // debug.
    let positionDebug = new Graphics();
    positionDebug.setStrokeStyle(1);
    positionDebug.beginStroke("#CCCCCC");
    positionDebug.beginFill("#AA330060");
    positionDebug.drawRect(
      boundsContainers[1].x,
      boundsContainers[1].y,
      boundsContainers[1].width,
      boundsContainers[1].height
    );
    positionDebug.drawRect(
      boundsContainers[0].x,
      boundsContainers[0].y,
      boundsContainers[0].width,
      boundsContainers[0].height
    );
    debugContainer.removeAllChildren();
    let debugShape = new Shape(positionDebug);
    debugContainer.addChild(debugShape);
    puzzleContainer.addChild(debugContainer);
  }
}
