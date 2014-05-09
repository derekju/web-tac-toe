web-tac-toe
===========

Implementation of Tic-Tac-Toe in Javascript.

### Server

Server written in Node using Express as the routing framework. There isn't much logic here other than the framework code needed to bootstrap the app and accept connections.

An attempt was made at presenting where configs, run-time constants, and translated strings could live in order to abstract out their definitions from the controllers and views.

### Client

The client was written using Backbone.js as the framework. Backbone was chosen as it has the seperation of models and views needed to keep the code clean and has a built-in event manager for the views communicate.

The base view uses Jade as the templating engine (due to its synergy with Express) and the UI is dynamically generated in Javascript.

Client code is located at:

    app/public/*
    app/views/*
    
### Infrastructure

Grunt was used for jslinting the code base. Since server + client are both written in the same language, keeping the code clean and following a certain standard is important.
