(function () {

    // Global Dispatcher
    var Dispatcher = (function () {
        var inst = _.extend({}, Backbone.Events);
        return inst;       
    })();
    
    // Player
    var Player = Backbone.Model.extend({
        defaults: {
            pid: 0,
            symbol: '',
            isComputer: false
        }
    });

    // Score View
    var ScoreView = Backbone.View.extend({

        el: $('#score-container'),

        t: _.template('<div id="p<%= player %>">P<%= player %>: <%= score %></div>'),

        playerOneWon: function () {
            this.scoreP1++;
            this.redraw();
        },

        playerTwoWon: function () {
            this.scoreP2++;
            this.redraw();
        },

        redraw: function () {
            this.$el.html('');
            this.$el.append(this.t({
                player: 1,
                score: this.scoreP1
            }));
            this.$el.append(this.t({
                player: 2,
                score: this.scoreP2
            }));            
        },

        initialize: function () {
            this.scoreP1 = 0;
            this.scoreP2 = 0;
            this.redraw();
        }
    });

    // Results View
    var ResultsView = Backbone.View.extend({

        el: $('#results'),

        events: {
            'click #next-game': 'goToNextGame'
        },

        victory: function () {
            $('#results-text').show().text(strings.you_won);
        },

        death: function () {
            $('#results-text').show().text(strings.you_lost);
        },

        draw: function () {
            $('#results-text').show().text(strings.draw);
        },

        goToNextGame: function () {
            this.trigger('reset:game');
        },

        initialize: function () {
            this.$el.css('display', 'none');
            this.listenTo(Dispatcher, 'over:game', function () {
                this.$el.css('display', 'block');
            });
        }

    });

    // Game Tile View
    var GameTileView = Backbone.View.extend({

        el: _.template('<div class="tile unset" style=""></div>'),

        colorTile: function (cssClass) {
            this.$el.addClass(cssClass);
        },

        changeActivePlayer: function (player) {
            this.activePlayer = player;
        },

        clicked: function () {
            if (!this.set) {
                this.$el.append(this.activePlayer.get('symbol'));
                this.$el.removeClass('unset');
                this.setSymbol = this.activePlayer.get('symbol');                
                this.set = true;
                Dispatcher.trigger('moved:player');
            }
        },

        disableInteractions: function () {
            this.$el.unbind('click');
            this.$el.removeClass('unset');
        },

        initialize: function () {
            this.activePlayer = null;
            this.set = false;
            this.setSymbol = null;

            this.listenTo(Dispatcher, 'change:player', this.changeActivePlayer);
            this.listenTo(Dispatcher, 'over:game', this.disableInteractions);
            this.$el.click(
                $.proxy(this.clicked, this)
            );
        }

    });

    // Game View
    var GameboardView = Backbone.View.extend({
        el: $('#board'),

        colorTiles: function (winningPlayerSymbol, cssClass) {
            _.each(this.winningCombinations, function (element, index, list) {
                if ((this.tiles[element[0]].setSymbol === winningPlayerSymbol) &&
                    (this.tiles[element[1]].setSymbol === winningPlayerSymbol) &&
                    (this.tiles[element[2]].setSymbol === winningPlayerSymbol))
                {
                    this.tiles[element[0]].colorTile(cssClass);
                    this.tiles[element[1]].colorTile(cssClass);
                    this.tiles[element[2]].colorTile(cssClass);
                }
            }, this);            
        },

        didPlayerWin: function (tileArray, player) {
            var didWin = false;

            _.each(this.winningCombinations, function (element, index, list) {
                if ((tileArray[element[0]] === player.get('symbol')) &&
                    (tileArray[element[1]] === player.get('symbol')) &&
                    (tileArray[element[2]] === player.get('symbol')))
                {
                    didWin = true;
                }
            }, this);

            return didWin;
        },

        isDraw: function (tileArray) {
            if ((tileArray[0] != null) &&
                (tileArray[1] != null) &&
                (tileArray[2] != null) &&
                (tileArray[3] != null) &&
                (tileArray[4] != null) &&
                (tileArray[5] != null) &&
                (tileArray[6] != null) &&
                (tileArray[7] != null) &&
                (tileArray[8] != null))
            {
                return true;
            } else {
                return false;
            }
        },

        getScoreForTileWithPlayer: function (movingPlayer, opponentPlayer, currentBoardArray, iteration) {            
            var tileResults = [];
            for (var i = 0; i < 9; i++) {
                // If tile is occupied go to the next one
                if (currentBoardArray[i] != null) {
                    tileResults[i] = (iteration % 2 == 1) ? -1000 : 1000;
                    continue;
                }

                currentBoardArray[i] = (iteration % 2 == 1) ? movingPlayer.get('symbol') : opponentPlayer.get('symbol');

                // If we can win it's a positive for us
                if (this.didPlayerWin(currentBoardArray, movingPlayer)) {
                    tileResults[i] = (2 * (10 - iteration));
                }
                // If other play won it's a negative for us
                else if (this.didPlayerWin(currentBoardArray, opponentPlayer)) {
                    tileResults[i] = (-2 * (10 - iteration));
                } 
                // If result was a draw this is a positive for us
                else if (this.isDraw(currentBoardArray)) {
                    tileResults[i] = (1 * (10 - iteration));
                }
                // Else we need to calculate further
                else {
                    tileResults[i] = this.getScoreForTileWithPlayer(movingPlayer, opponentPlayer, currentBoardArray, iteration + 1);
                }

                currentBoardArray[i] = null;
            }

            // Moving player
            if (iteration % 2 == 1) {
                var largestIndex = tileResults.indexOf(Math.max.apply(Math, tileResults));
                return (iteration === 1) ? largestIndex : tileResults[largestIndex];
            } 
            // Opponent
            else {
                var smallestIndex = tileResults.indexOf(Math.min.apply(Math, tileResults));
                return tileResults[smallestIndex];
            }
        },

        arrayRepresentationOfTiles: function () {
            var arr = [];
            _.each(this.tiles, function (element, index, list) {
                arr.push(element.setSymbol);
            });
            return arr;
        },

        autoMove: function (movingPlayer, opponentPlayer, numMoves) {
            var boardArray = this.arrayRepresentationOfTiles(),
                indexToPlay = this.getScoreForTileWithPlayer(movingPlayer, opponentPlayer, boardArray, 1);
            this.tiles[indexToPlay].clicked();
        },

        initialize: function () {
            this.$el.html('');      
            this.tiles = [];
            this.winningCombinations = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
            for (var i = 0; i < 9; i++) {
                this.tiles[i] = new GameTileView();
                this.$el.append(this.tiles[i].$el);
            }
            this.listenTo(Dispatcher, 'over:game', this.colorTiles);
        }

    });

    // Main View
    var AppView = Backbone.View.extend({

        el: $('#application'),

        directions: $('#directions'),

        endGame: function (player) {
            if (player.get('pid') === this.playerOne.get('pid')) {
                this.resultsView.victory();
                this.scoreView.playerOneWon();
                Dispatcher.trigger('over:game', this.playerOne.get('symbol'), 'playerOneWon');
            } else {
                this.resultsView.death();
                this.scoreView.playerTwoWon();
                Dispatcher.trigger('over:game', this.playerTwo.get('symbol'), 'playerTwoWon');
            }
            $('#next-game').show();            
        },

        drawGame: function () {
            this.resultsView.draw();
            Dispatcher.trigger('over:game');
        },

        playerMoved: function () {
            this.directions.hide();
            this.numMoves++;
            if (this.currentPid === this.playerOne.get('pid')) {
                if (this.gameboardView.didPlayerWin(this.gameboardView.arrayRepresentationOfTiles(), this.playerOne)) {
                    this.endGame(this.playerOne);
                    return;
                } else if (this.gameboardView.isDraw(this.gameboardView.arrayRepresentationOfTiles())) {
                    this.drawGame();
                    return;
                }
                this.currentPid = this.playerTwo.get('pid');
                Dispatcher.trigger('change:player', this.playerTwo);

                if (this.playerTwo.get('isComputer')) {
                    this.gameboardView.autoMove(this.playerTwo, this.playerOne, this.numMoves);
                }            
            } else {
                if (this.gameboardView.didPlayerWin(this.gameboardView.arrayRepresentationOfTiles(), this.playerTwo)) {
                    this.endGame(this.playerTwo);
                    return;
                } else if (this.gameboardView.isDraw(this.gameboardView.arrayRepresentationOfTiles())) {
                    this.drawGame();
                    return;
                }                
                this.currentPid = this.playerOne.get('pid');
                Dispatcher.trigger('change:player', this.playerOne);
            }
        },

        resetGame: function () {
            this.numMoves = 0;
            this.gameboardView.initialize();
            this.resultsView.initialize();
            this.currentPid = this.playerOne.get('pid');
            Dispatcher.trigger('change:player', this.playerOne);
        },

        initialize: function () {
            this.gameboardView = new GameboardView();
            this.resultsView = new ResultsView();
            this.scoreView = new ScoreView();

            this.numMoves = 0;
            this.playerOne = new Player({
                pid: 1,
                symbol: 'X',
                isComputer: false
            });
            this.playerTwo = new Player({
                pid: 2,
                symbol: 'O',
                isComputer: true
            });
            this.currentPid = this.playerOne.get('pid');

            Dispatcher.trigger('change:player', this.playerOne);
            this.listenTo(Dispatcher, 'moved:player', this.playerMoved);
            this.listenTo(this.resultsView, 'reset:game', this.resetGame);
        }

    });

    new AppView();
})(strings);