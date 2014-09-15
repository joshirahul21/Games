(function () {
    $.connection.hub.url = "/signalr";
    var app = angular.module('mazeGameSignal', []);
    var hub;
    var nextHandler;

    app.connectSignalR = function () {
        hub = $.connection.mazeHub;
        hub.client.addNewPlayerToGameRoom = addNewPlayerToGameRoom;
        hub.client.addPlayersToGameRoom = addPlayersToGameRoom;
        hub.client.removePlayerFromGameRoom = removePlayerFromGameRoom;
        hub.client.requestToJoinGame = requestToJoinGame;
        hub.client.serveAlert = serveAlert;
        hub.client.updatePlayerState = updatePlayerState;
        hub.client.updatePartnerMove = updatePartnerMove;
        hub.client.startGame = startGame;

        $.connection.hub.start().done(function () {

        });
    }

    app.enterToGameRoom = function (player, next) {
        nextHandler = next;
        hub.server.enterToGameRoom(player.name);
    }

    var addNewPlayerToGameRoom = function (player) {

        //var divGameRoom = document.getElementById("divGameRoom");
        //var item = createPlayerElement(player);
        //item.setAttribute("id", player.connectionId);
        //divGameRoom.appendChild(item);
    };

    var addPlayersToGameRoom = function (players) {
        if (nextHandler != null && nextHandler != undefined) {
            nextHandler(players);
        }
        //var index;
        //for (index in players) {
        //    addPlayerToGameRoom(players[index]);
        //}
    };

    var removePlayerFromGameRoom = function (conId) {
        var divGameRoom = document.getElementById("divGameRoom");
        var item = document.getElementById(conId);
        if (divGameRoom && item) {
            divGameRoom.removeChild(item);
        }
    };

    var requestToJoinGame = function (hostPlayer, guestPlayer) {
        var msg = hostPlayer.Name + " wants to join with you for a game.";
        var cb = confirm(msg);
        if (cb == true) {
            mazeHub.server.joinRequestConfirmation(hostPlayer, guestPlayer, true);
        } else {
            mazeHub.server.joinRequestConfirmation(hostPlayer, guestPlayer, false);
        }
    };

    var serveAlert = function (msg) {
        alert(msg);
    };

    var updatePlayerState = function (player1, player2) {
        var div1 = document.getElementById(player1.ConnectionId);
        if (div1) {
            div1.className = "bs-callout .bs-callout-busy";
            div1.disabled = true;
        }
        var div2 = document.getElementById(player2.ConnectionId);
        if (div2) {
            div2.className = "bs-callout .bs-callout-busy";
            div2.disabled = true;
        }
    };

    var updatePartnerMove = function (keyIdentifier) {
        move(keyIdentifier);
        isMyTurn = true;
    };

    var startGame = function () {
        isMyTurn = true;
    }
})();