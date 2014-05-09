web-tac-toe
===========

Implementation of Tic-Tac-Toe in Javascript.

### Server

The server is written in Node using Express as the routing framework. There isn't much logic here other than the framework code needed to bootstrap the app and accept connections.

An attempt was made at presenting where configs, run-time constants, and translated strings could live in order to abstract out their definitions from the controllers and views.

Server code is located at:

    app/config/*
    app/routes/*
    app/server.js

### Client

The client was written using Backbone.js as the framework. Backbone was chosen as it has the seperation of models and views needed to keep the code clean and has a built-in event manager for the views to communicate.

The base view uses Jade as the templating engine (due to its synergy with Express) and the UI is dynamically generated in Javascript.

Client code is located at:

    app/public/*
    app/views/*
    
### Infrastructure

Grunt was used for jslinting the code base. Since server + client are both written in the same language, keeping the code clean and following a certain standard is important.

### CPU Logic

The algorithm used for the computer was the minimax algorithm. I originally was going for an algorithm that would check for different board layouts that the player could choose and then respond based on that but that quickly became untenable.

A recursive solution was sought in order to recurse through all possible combinations of moves in order to find the best one for the computer to take. The first few attempts resulted in incorrect scores being used but that was corrected to yield the correct, current solution.

Due to the computer always choosing the path that yields either a draw or a win for itself, winning the game for the player is extremely difficult, if not impossible. A difficulty setting could be provided that could be used to alter or randomize the scoring algorithm so that the computer will not always choose the best path.
