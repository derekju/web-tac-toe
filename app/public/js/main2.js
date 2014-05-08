var Events = (function() {
    var me = {},
        _events = {};

    me.registerEvent = function (name, scope, callback) {
        if (typeof _events[name] == 'undefined') {
            _events[name] = [];
        }
        _events[name].push([scope, callback]);
    };

    me.fireEvent = function (name, data) {
        _.each(_events[name], function(value, key, list) {
            var scope = value[0],
                callback = value[1];
            callback.call(scope, data);
        });
    };

    return me;
})();

var Player = function (pid, symbol, isComputer) {
    this.pid = pid;
    this.symbol = symbol;
    this.isComputer = isComputer;
};

var GameTile = function (id) {    
    this.id = id;
    this.playerSymbol = null;

    var $tile = null,        
        _set = false,
        symbol;

    this.tileClicked = function () {
        if (!_set) {
            $tile.append('<span>' + symbol + '</span>');
            this.playerSymbol = symbol;
            Events.fireEvent('playerMoved');
            _set = true;
        }
    }

    this.render = function ($el) {
        $tile = $('<div class="tile" style="background-color: lightgray; margin: 10px; width: 150px; height: 150px; float: left"></div>');
        $el.append($tile);
        $tile.click(
            $.proxy(this.tileClicked, this)
        );
    };

    this.manualTileClick = function () {
        this.tileClicked();
    };

    function _changePlayer(player) {
        symbol = player.symbol;
    }

    Events.registerEvent('changePlayer', this, _changePlayer);
};

var GameBoard = function() {
    var _tiles = [],
        $board;

    this.init = function () {
        for (var i = 0; i < 9; i++) {
            _tiles[i] = new GameTile(i);
        }
    };

    this.render = function ($el) {
        $board = $('<div style="border: 1px solid black; height: 550px; width: 550px"></div>');
        $el.append($board);

        for (var i = 0; i < 9; i++) {
            _tiles[i].render($board, i);
        }        
    };

    function arrayRepresentationOfTiles() {
        var arr = [];
        for (var i = 0; i < 9; i++) {
            arr.push(_tiles[i].playerSymbol);
        }
        return arr;
    }

    function privateDidPlayerWinArray(player, tiles) {
        if ((tiles[0] === player.symbol && tiles[1] === player.symbol && tiles[2] === player.symbol) ||
            (tiles[3] === player.symbol && tiles[4] === player.symbol && tiles[5] === player.symbol) ||
            (tiles[6] === player.symbol && tiles[7] === player.symbol && tiles[8] === player.symbol) ||
            (tiles[0] === player.symbol && tiles[3] === player.symbol && tiles[6] === player.symbol) ||
            (tiles[1] === player.symbol && tiles[4] === player.symbol && tiles[7] === player.symbol) ||
            (tiles[2] === player.symbol && tiles[5] === player.symbol && tiles[8] === player.symbol) ||
            (tiles[0] === player.symbol && tiles[4] === player.symbol && tiles[8] === player.symbol) ||
            (tiles[2] === player.symbol && tiles[4] === player.symbol && tiles[6] === player.symbol))
        {
            return true;
        } else {
            return false;
        }
    };

    function privateDidPlayerWin(player, tiles) {
        if ((tiles[0].playerSymbol === player.symbol && tiles[1].playerSymbol === player.symbol && tiles[2].playerSymbol === player.symbol) ||
            (tiles[3].playerSymbol === player.symbol && tiles[4].playerSymbol === player.symbol && tiles[5].playerSymbol === player.symbol) ||
            (tiles[6].playerSymbol === player.symbol && tiles[7].playerSymbol === player.symbol && tiles[8].playerSymbol === player.symbol) ||
            (tiles[0].playerSymbol === player.symbol && tiles[3].playerSymbol === player.symbol && tiles[6].playerSymbol === player.symbol) ||
            (tiles[1].playerSymbol === player.symbol && tiles[4].playerSymbol === player.symbol && tiles[7].playerSymbol === player.symbol) ||
            (tiles[2].playerSymbol === player.symbol && tiles[5].playerSymbol === player.symbol && tiles[8].playerSymbol === player.symbol) ||
            (tiles[0].playerSymbol === player.symbol && tiles[4].playerSymbol === player.symbol && tiles[8].playerSymbol === player.symbol) ||
            (tiles[2].playerSymbol === player.symbol && tiles[4].playerSymbol === player.symbol && tiles[6].playerSymbol === player.symbol))
        {
            return true;
        } else {
            return false;
        }
    };

    function privateIsBoardFull(tiles, boardArray) {
        if ((tiles[0] != null) &&
            (tiles[1] != null) &&
            (tiles[2] != null) &&
            (tiles[3] != null) &&
            (tiles[4] != null) &&
            (tiles[5] != null) &&
            (tiles[6] != null) &&
            (tiles[7] != null) &&
            (tiles[8] != null))
        {
            return true;
        } else {
            return false;
        }
    }

    this.isDraw = function () {
        if ((_tiles[0].playerSymbol != null) &&
            (_tiles[1].playerSymbol != null) &&
            (_tiles[2].playerSymbol != null) &&
            (_tiles[3].playerSymbol != null) &&
            (_tiles[4].playerSymbol != null) &&
            (_tiles[5].playerSymbol != null) &&
            (_tiles[6].playerSymbol != null) &&
            (_tiles[7].playerSymbol != null) &&
            (_tiles[8].playerSymbol != null))
        {
            return true;
        } else {
            return false;
        }
    }

    this.didPlayerWin = function (player) {
        return privateDidPlayerWin(player, _tiles);
    };

    function _getScoreForTileWithPlayer(movingPlayer, opponentPlayer, currentBoardArray, iteration) {

        var tileResults = [];
        for (var i = 0; i < 9; i++) {
            // If tile is occupied go to the next one
            if (currentBoardArray[i] != null) {
                if (iteration % 2 == 1) {
                    tileResults[i] = -1000;
                } else {
                    tileResults[i] = 1000;
                }
                continue;
            }

            if (iteration % 2 == 1) {
                currentBoardArray[i] = movingPlayer.symbol;
            } else {
                currentBoardArray[i] = opponentPlayer.symbol;
            }
            // If we can win it's a positive for us
            if (privateDidPlayerWinArray(movingPlayer, currentBoardArray)) {
                tileResults[i] = (2 * (10 - iteration));
            }
            // If other play won it's a negative for us
            else if (privateDidPlayerWinArray(opponentPlayer, currentBoardArray)) {
                tileResults[i] = (-2 * (10 - iteration));
            } 
            // If result was a draw this is a positive for us
            else if (privateIsBoardFull(currentBoardArray)) {
                tileResults[i] = (1 * (10 - iteration));
            }
            // Else we need to calculate further
            else {
                tileResults[i] = _getScoreForTileWithPlayer(movingPlayer, opponentPlayer, currentBoardArray, iteration + 1);
            }

            currentBoardArray[i] = null;
        }
        // Moving player
        if (iteration % 2 == 1) {
            var largestIndex = tileResults.indexOf(Math.max.apply(Math, tileResults));
            if (iteration == 1) {
                console.log(tileResults);
                return largestIndex;
            } else {
                return tileResults[largestIndex];
            }
        } 
        // Opponent
        else {
            var smallestIndex = tileResults.indexOf(Math.min.apply(Math, tileResults));
            return tileResults[smallestIndex];
        }

    }

    this.setBoard = function () {
        _tiles[0].playerSymbol = 'X'; _tiles[1].playerSymbol = null; _tiles[2].playerSymbol = 'X';
        _tiles[3].playerSymbol = null; _tiles[4].playerSymbol = 'O'; _tiles[5].playerSymbol = 'X';
        _tiles[6].playerSymbol = null; _tiles[7].playerSymbol = null; _tiles[8].playerSymbol = 'O';
    };

    function _getHighestScoreForPlayer(movingPlayer, opponentPlayer, tiles) {
        var tileResults = [];
        var boardArray = arrayRepresentationOfTiles(tiles);
        var val = _getScoreForTileWithPlayer(movingPlayer, opponentPlayer, boardArray, 1);
        console.log(val);
        return val;
    }

    this.processCpuMove = function (movingPlayer, opponentPlayer, numMoves) {
        /*
        // Opening move
        if (numMoves == 1) {
            // Corner
            if ((_tiles[0].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[2].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[6].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[8].playerSymbol === opponentPlayer.symbol))
            {
                _tiles[4].manualTileClick();
                return;
            } 

            // Edge
            if ((_tiles[1].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[3].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[5].playerSymbol === opponentPlayer.symbol) ||
                (_tiles[7].playerSymbol === opponentPlayer.symbol))
            {
                _tiles[4].manualTileClick();
                return;
            }

            // Center
            if (_tiles[4].playerSymbol === opponentPlayer.symbol)
            {
                var random = _.random(0, 3);
                switch (random) {
                    case 0:
                        _tiles[0].manualTileClick();
                        break;
                    case 1:
                        _tiles[2].manualTileClick();
                        break;
                    case 2:
                        _tiles[6].manualTileClick();
                        break;
                    case 3:
                        _tiles[8].manualTileClick();
                        break;

                }
                return;
            }
        } else {
        */
            // Take the highest score and auto play that tile
            var highestScore = _getHighestScoreForPlayer(movingPlayer, opponentPlayer, _tiles);
            _tiles[highestScore].manualTileClick();
        //}
    };

    this.init();
};

var GameController = (function() {
    var me = {},
        p1,
        p2,
        currentPid,
        _gameboard,
        numMoves = 0;

    function _endGame(winningPlayer) {
        console.log('Player ' + winningPlayer.pid + ' won!');
    }

    function _drawGame() {
        console.log('Game ended in draw!');
    }

    function _playerMoved() {
        numMoves++;
        if (currentPid === p1.pid) {
            if (_gameboard.didPlayerWin(p1)) {
                _endGame(p1);
                return;
            } else if (_gameboard.isDraw()) {
                _drawGame();
                return;
            }
            currentPid = p2.pid;
            Events.fireEvent('changePlayer', p2);

            if (p2.isComputer) {
                _gameboard.processCpuMove(p2, p1, numMoves);   
            }            
        } else {
            if (_gameboard.didPlayerWin(p2)) {
                _endGame(p2);
                return;
            } else if (_gameboard.isDraw()) {
                _drawGame();
                return;
            }
            currentPid = p1.pid;
            Events.fireEvent('changePlayer', p1);
        }
    }

    function _preloadGame() {
        _gameboard.setBoard();
        numMoves = 10;
        _playerMoved();
    }

    me.init = function(config) {
        _gameboard = new GameBoard();
        _gameboard.render($('#board'));

        p1 = new Player(1, 'X');
        p2 = new Player(2, 'O', config.numPlayers === 1 ? true : false);
        currentPid = p1.pid;

        //_preloadGame();

        Events.fireEvent('changePlayer', p1);
        Events.registerEvent('playerMoved', GameController, _playerMoved);
    };

    return me;
})();

$(function() {
    GameController.init({numPlayers: 1});
});