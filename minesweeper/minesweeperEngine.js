/* jshint asi: true */
var createMinesweeperEngine = (cellsWidth = 9, cellsHeight = 9, totalMines = 10) => {
  //sanitize input
  if (cellsHeight < 2 || cellsWidth < 2) {
    throw Error("Board size cannot be less than 2x2.");
  }
  
  if (totalMines < 1 || totalMines > cellsWidth * cellsHeight - 1) {
    throw Error("There must be at least one cell that is not a mine.");
  }
  
  //this allows us to represent our board as a 2D array of bits
  //these are used to mark and track changes.
  class Bitboard {
    constructor(width, height) {
      this.width = width
      this.height = height
      this.bitboardSize = Math.ceil(width / 8)
      this.bitboard = null
      
      this.resetBitboard() //create initial board
    }
    
    resetBoard() {
      this.bitboard = []
      for (let i = 0; i < this.height; ++i) {
        this.bitboard.push(new Uint8Array(this.bitBoardSize))
      }
    }
    
    getBit(row, column) {
      //get the byte we need (div by 8 via shift 3)
      //get remainder by & with 7
      //subtract from 7 to get offset from leftmost bit
      //shift that bit to the rightmost position
      //bitmask away all the other bits so we return 1 or 0
      return (this.bitboard[row][column >> 3] >> (7 - (column & 7))) & 1
    }
    
    isSet(row, column) {
      return this.getBit(row, column) === 1
    }
    
    clearBit(row, column) {
      //get our offset and NOT to create a negative bitmask to set
      this.board[row][column >> 3] &= ~(1 << (7 - (column & 7)))
    }
    
    setBit(row, column) {
      var byte = column >> 3
      var mask = 1 << (7 - (column & 7))
      //we clear (with NOT bitmask) then set (with XOR) rather than branch
      this.board[row][byte] &= ~mask
      this.board[row][byte] ^= mask
    }
  }
  
   
  //note: will return 0 if bit index out of range
  var getBitBoard = (bit) => (num >> bit) & 1
  var setBit= (num, bit, value) => {
    var currentValue = getBit(num, bit)
    if (currentValue !== value) {
      return num ^ (1 << bit)
    }
    return num
  }
  
  var getBitFromArray = (arr, index, bit) => (arr[index] >> bit) & 1
  var setBitFromArray = (arr, index, bit) => {
    arr[index] &= ~(1 << bit)
    arr[index] ^= (1 << bit)
  }
  //mask the correct bit, invert the mask then and it together
  var clearBitFromArray = (arr, index, bit) => arr[index] &= ~(1 << bit)
    
  class Board {
    constructor(cellsWidth, cellsHeight, totalMines) {
      this.cellsWidth = cellsWidth
      this.cellsHeight = cellsHeight
      this.totalMines = totalMines
  
      this.board = []
      this.bitboard = new Bitboard(cellsWidth, cellsHeight)
      this.subscribers = []
      //"uninitialized" "initializing" "initialized" "playing" "won" "lost"
      this.status = "uninitialized"
    }
    
    on(fn) {
      this.subscribers.push(fn)
      return () => this.subscribers.filter(x => x !== fn)
    }
    
    emit(evt) {
      this.subscribers.forEach(sub => sub(evt))
    }
    
    /* IMPLEMENTATION NOTES
     * Each row is a unsigned typed byte array.
     * Each integer can have several states.
     * we'll be using bits to represent different states
     * bits are 0 to 15 going left to right
     * bit 7 -- is mine if 1
     * bit 6 -- is marked as safe mine if 1
     * bit 5 -- is question if 1
     * bit 4 -- is visible if 1
     * bits 0 to 3 -- the number of mines nearby
     */
    isMine(row, column) {
      return getBitFromArray(board[row], column, 7)
    }
    
    isMarkedSafe(row, column) {
      return getBitFromArray(board[row], column, 6)
    }
    
    isMarkedQuestion(row, column) {
      return getBitFromArray(board[row], column, 5)
    }
    
    isVisible(row, column) {
      return getBitFromArray(board[row], column, 4)
    }
    
    //we don't unify the others because its inconvenient
    //and we read a lot more than we write
    setCellState(row, column, stateType) {
      switch(stateType) {
        case "mine":
          setBitFromArray(board[row], column, 7)
          break;
        case "visible":
          setBitFromArray(board[row], column, 4)
          break;
        case "flag":
          clearBitFromArray(board[row], column, 5)
          setBitFromArray(board[row], column, 6)
          break;
        case "question":
          setBitFromArray(board[row], column, 5)
          clearBitFromArray(board[row], column, 6)
          break;
        default: //"unmark"
          clearBitFromArray(board[row], column, 5)
          clearBitFromArray(board[row], column, 6)
      }
    }
    
    getValue(row, column) {
      //get first 4 bits only
      return board[row][column] & 15
    }
    
    setValue(row, column, value) {
      board[row][column] &= value & 15 //make sure no values over 4 bits
    }
    
    //only win if all non-mine spaces are visible
    //and no mines are visible
    hasWon() {
      for (let i = 0; i < this.cellsHeight; ++i) {
        for (let j = 0; j < this.cellsWidth; ++j) {
          let isVisible = this.isVisible(this.board[i][j])
          let isMine = this.isMine(this.board[i][j])
          
          if (isMine && isVisible) {
            return false
          }
          if (!isMine && !isVisible) {
            return false
          }
        }
      }
      return true;
    }
    
    updateStatus(newStatus) {
      this.status = newStatus
      emit({
        type: "statusChanged",
        value: this.status,
      })
    }
    
    doClick(row, column) {
      var changed = []
      var toChange = [[row, column]];
      this.bitboard.resetBoard() //the board will track things we've already put on the list to check
      
      //LOOP STRATEGY
      //get the next waiting value
      //make it visible
      //add it to the list of changed
      //if it is zero, check the surrounding cells
      //   if they exist and haven't been added already
      //      add them to the list to change
      while (toChange.length) {
        let [currentRow, currentCol] = toChange.pop()
        let currentVal = this.getValue(currentRow, currentCol)
        this.setCellState(row, column, "visible")
        changed.push({row: currentRow, column: currentCol, value: currentVal})
        
        if (currentVal !== 0) {
          continue;
        }
        
        //row above
        if (currentRow > 0) {
          if (currentCol - 1 >= 0 && !this.bitboard.isSet(currentRow - 1, currentCol - 1)) {
            toChange.push([currentRow - 1, currentCol - 1])
          }
          if (!this.bitboard.isSet(currentRow - 1, currentCol)) {
            toChange.push([currentRow - 1, currentCol])
          }
          if (currentCol + 1 < this.cellsWidth && !this.bitboard.isSet(currentRow - 1, currentCol + 1)) {
            toChange.push([currentRow - 1, currentCol + 1])
          }
        }
        
        //current row
        if (currentCol - 1 >= 0 && !this.bitboard.isSet(currentRow, currentCol - 1)) {
          toChange.push([currentRow, currentCol - 1])
        }
        if (currentCol + 1 < this.cellsWidth && !this.bitboard.isSet(currentRow, currentCol + 1)) {
          toChange.push([currentRow, currentCol + 1])
        }
        
        //row below
        if (currentRow < this.cellsHeight) {
          if (currentCol - 1 >= 0 && !this.bitboard.isSet(currentRow + 1, currentCol - 1)) {
            toChange.push([currentRow + 1, currentCol - 1])
          }
          if (!this.bitboard.isSet(currentRow + 1, currentCol)) {
            toChange.push([currentRow + 1, currentCol])
          }
          if (currentCol + 1 < this.cellsWidth && !this.bitboard.isSet(currentRow + 1, currentCol + 1)) {
            toChange.push([currentRow + 1, currentCol + 1])
          }
        }
      }
      
      emit({
        type: "click",
        value: {row, column, changed}
      })
      
      // don't check for win if we obviously lost
      if (this.isMine(row, column)) {
        this.updateStatus("lost")
      } else if (this.hasWon()) {
        this.updateStatus("won")
      }
    }
    
    doRightClick(row, column) {
      var cellState
      if (this.isMarkedSafe(row, column)) {
        this.setCellState(row, column, "question")
        cellState = "question"
      } else if (this.isMarkedQuestion(row, column)) {
        this.setCellState(row, column, "unmark")
        cellState = "unmark"
      } else {
        this.setCellState(row, column, "flag")
        cellState = "flag"
      }
      
      emit({
        type: "righClick",
        value: {row, column, cellState}
      })
    }
    
    click(row, column) {
      //if we already won or lost
      //we want to return without doing anything
      switch(this.status) {
        case "won":
        case "lost":
        case "initializing":
        case "initialized":
          break;
        case "uninitialized":
          this.updateStatus("initializing")
          this.setupBoard(clickRow, clickColumn)
          this.updateStatus("initialized")
          this.updateStatus("playing")
          this.doClick(row, column)
          break;
        default: //"playing"
          this.doClick(row, column)
      }
    }
    
    rightClick(row, column) {
      //if we already won or lost
      //we want to return without doing anything
      switch(this.status) {
        case "won":
        case "lost":
        case "initializing":
        case "initialized":
          break;
        default: //"playing" or "uninitialized"
          this.doRightClick(row, column)
      }
    }
      
    setupBoard(clickRow, clickColumn) {
      //STEP 1: create board
      for (let i = 0; i < cellsHeight; ++i) {
        board[i] = new Uint16Array(cellsWidth);
      }
      
      //STEP 2: add all the mines to the board.
      //        if less than 25% of the squares are mines
      //        use true random. Otherwise, simply fill the next
      //        available square until the end of the row
      if ((totalMines / (cellsWidth * cellsHeight)) > 0.25) {
        let i = 0;
        let row, col;
        while (i < totalMines) {
          row = Math.floor(Math.random() * cellsWidth);
          col = Math.floor(Math.random() * cellsHeight);
          if (!isMine(row, col) && !(row === clickRow && col === clickCol)) {
            setCellState(row, col, "mine");
            ++i;
          }
        }
      } else {
        let row, col, i = 0;
        while (i < totalMines) {
          row = Math.floor(Math.random() * cellsWidth);
          col = Math.floor(Math.random() * cellsHeight);
          
          //if not mine, set it
          if (!isMine(row, col) && !(row === clickRow && col === clickCol)) {
            setCellState(row, col, "mine");
            ++i;
          //otherwise, find next empty slot in the row if it exists and set it instead
          } else {
            for (let j = row + 1; j < cellsWidth; ++j) {
              if (!isMine(j, col) && !(row === clickRow && col === clickCol)) {
                setCellState(row, col, "mine");
                ++i;
                break;
              }
            }
          }
        }//END while
      }//END else
      
      //STEP 3: calculate how many mines are being touched by each square
      for (let i = 0; i < cellsHeight; ++i) {
        for (let j = 0; j < cellsWidth; ++j) {
          board[i][j] += [
            //row above
            board[i-1][j-1],
            board[i-1][j],
            board[i-1][j+1],
            //current row
            board[i][j-1],
            board[i][j+1],
            //row below
            board[i+1][j-1],
            board[i+1][j],
            board[i+1][j+1],
            //any non-existent entries will return `undefined`
          ].reduce((acc, i) => acc + (i || 0));
        }
      }
    }//END setupBoard
  }
  
  return new Board(cellsWidth, cellsHeight, totalMines)
}
