(function () {

    var app = angular.module("mazeGameApp", ['ui.bootstrap']);
    var mazeHub = angular.module("mazeGameSignal");

    var gameController = function ($scope) {
        var me;
        var roomPlayers = $scope.roomPlayers = [];
        $scope.initial = 'Mr';
        mazeHub.connectSignalR();

        $scope.enterGameRoomHandler = function () {
            var name = $scope.playerName;
            var initial = $scope.initial;
            me = new Player();
            me.name = name;
            me.initial = initial;
            mazeHub.enterToGameRoom(me, function (players) {
                $scope.playerNameTitle = initial + ". " + name;
                $scope.showGamePage = true;
                roomPlayers = players;
            });
        };

        mazeHub.updateRoomPlayers(function (player, state) {
            switch (state) {
                case "Added":
                    //$scope.roomPlayers.push(player);
                    break;
                default:
                    break;
            }
        });

    };

    app.controller("gameController", gameController);

    var tableMage;
    var errorEle;
    var player1;
    var player2;
    var currentPlayer;
    var isMyTurn;

    var init = function init() {
        connectSignalR();

        isMyTurn = false;
        tableMage = document.getElementById('mage');
        errorEle = document.getElementById('error');
        var btnEnterGameRoom = document.getElementById('btnEnterGameRoom');

        var hammerOptions = { threshold: 2 };
        var mc = new Hammer(tableMage, hammerOptions);
        mc.on("swipeleft swiperight swipeup swipedown", swipeHandler);

        btnEnterGameRoom.addEventListener("click", function () {
            btnEnterGameRoomHandler();
        }, false);
        tableMage.addEventListener("keydown", function (e) {
            keydownHandler(e.keyIdentifier);
        }, false);

        player1 = new Player();
        player1.X = 1;
        player1.Y = 1;
        player1.allowedMove = "0011";
        player1.className = "player1";

        player2 = new Player();
        player2.X = 13;
        player2.Y = 13;
        player2.allowedMove = "1100";
        player2.className = "player2";

        currentPlayer = player1;
    };

    var swipeHandler = function (swipeEve) {
        if (isMyTurn) {
            switch (swipeEve.type) {
                case "swipeup":
                    move("Up");
                    break;
                case "swipedown":
                    move("Down");
                    break;
                case "swiperight":
                    move("Right");
                    break;
                case "swipeleft":
                    move("Left");
                    break;
                default:
                    break;
            }
        }
        else {
            setErrorText("Please wait, it's your partner turn.")
        }
    }

    var keydownHandler = function (keyIdentifier) {
        //mazeHub.server.invokeMazeHub($.connection.hub.id);
        if (isMyTurn) {
            move(keyIdentifier);
        }
        else {
            setErrorText("Please wait, it's your partner turn.")
        }
    };

    var move = function (keyIdentifier) {

        var moveSuccess = false;
        var selectedElement = tableMage.rows[currentPlayer.Y].cells[currentPlayer.X];

        switch (keyIdentifier) {
            case "Up":
                moveSuccess = moveUp();
                break;
            case "Down":
                moveSuccess = moveDown();
                break;
            case "Right":
                moveSuccess = moveRight();
                break;
            case "Left":
                moveSuccess = moveLeft();
                break;
            default:
                break;
        }

        if (moveSuccess) {
            selectedElement.className = currentPlayer.className;
            if (isMyTurn) {
                isMyTurn = false;
                mazeHub.server.updateMyMoveToPartner(keyIdentifier);
            }
            updatePlayerAllowedMove(player1);
            updatePlayerAllowedMove(player2);

            //Check if any valid move is there to complete the game.
            if ((player1.allowedMove == 0 || player2.allowedMove == 0) && currentPlayer === player2) {
                setErrorText("No valid move pending. Game over.");
            }

            if (currentPlayer === player1) {
                currentPlayer = player2;
            }
            else if (currentPlayer === player2) {
                currentPlayer = player1;
            }

            //Set new selected cell.
            selectedElement = tableMage.rows[currentPlayer.Y].cells[currentPlayer.X];
            selectedElement.className += " selectedBlock";
        }
        else {
            setErrorText("Invalid move.");
        }
    };

    var updatePlayerAllowedMove = function (player) {
        var x;
        var y;
        var new_p_Allowed_Move = "";

        //Check left
        x = player.X - 1;
        y = player.Y;
        var text = tableMage.rows[y].cells[x].className;
        if (text == "freeBolck") {
            new_p_Allowed_Move = new_p_Allowed_Move + "1";
        }
        else {
            new_p_Allowed_Move = new_p_Allowed_Move + "0";
        }

        //Check up
        x = player.X;
        y = player.Y - 1;
        var text = tableMage.rows[y].cells[x].className;
        if (text == "freeBolck") {
            new_p_Allowed_Move = new_p_Allowed_Move + "1";
        }
        else {
            new_p_Allowed_Move = new_p_Allowed_Move + "0";
        }

        //Check Right
        x = player.X + 1;
        y = player.Y;
        var text = tableMage.rows[y].cells[x].className;
        if (text == "freeBolck") {
            new_p_Allowed_Move = new_p_Allowed_Move + "1";
        }
        else {
            new_p_Allowed_Move = new_p_Allowed_Move + "0";
        }

        //Check Down
        x = player.X;
        y = player.Y + 1;
        var text = tableMage.rows[y].cells[x].className;
        if (text == "freeBolck") {
            new_p_Allowed_Move = new_p_Allowed_Move + "1";
        }
        else {
            new_p_Allowed_Move = new_p_Allowed_Move + "0";
        }

        player.allowedMove = new_p_Allowed_Move;
    };

    var createPlayerElement = function (player) {
        var mainDiv = document.createElement("div");
        mainDiv.setAttribute("class", "bs-callout bs-callout-danger");
        var nameDiv = document.createElement("div");
        //nameDiv.setAttribute("class", "col-md-9");
        nameDiv.setAttribute("class", "pull-left list-item-margin");
        var buttonDiv = document.createElement("div");
        //buttonDiv.setAttribute("class", "col-md-3");
        buttonDiv.setAttribute("class", "pull-right list-item-margin");
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-success sharp-border");
        button.addEventListener("click", function () {
            btnJoinHandler(player.connectionId);
        }, false);

        button.innerHTML = "Join";
        buttonDiv.appendChild(button);
        nameDiv.innerHTML = player.playername;
        mainDiv.appendChild(nameDiv);
        mainDiv.appendChild(buttonDiv);
        return mainDiv;
    };

    var btnJoinHandler = function (conId) {
        mazeHub.server.joinGameRequest(conId);
    };

    var setErrorText = function (text) {
        alert(text);
    };

    var moveUp = function () {
        var moveSuccess = false;
        if (currentPlayer.allowedMove[1] == 1) {
            currentPlayer.Y = currentPlayer.Y - 1;
            tableMage.rows[currentPlayer.Y].cells[currentPlayer.X].className = currentPlayer.className;
            moveSuccess = true;
        }
        return moveSuccess;
    };

    var moveDown = function () {
        var moveSuccess = false;
        if (currentPlayer.allowedMove[3] == 1) {
            currentPlayer.Y = currentPlayer.Y + 1;
            tableMage.rows[currentPlayer.Y].cells[currentPlayer.X].className = currentPlayer.className;
            moveSuccess = true;
        }
        return moveSuccess;
    };

    var moveRight = function () {
        var moveSuccess = false;
        if (currentPlayer.allowedMove[2] == 1) {
            currentPlayer.X = currentPlayer.X + 1;
            tableMage.rows[currentPlayer.Y].cells[currentPlayer.X].className = currentPlayer.className;
            moveSuccess = true;
        }
        return moveSuccess;
    };

    var moveLeft = function () {
        var moveSuccess = false;
        if (currentPlayer.allowedMove[0] == 1) {
            currentPlayer.X = currentPlayer.X - 1;
            tableMage.rows[currentPlayer.Y].cells[currentPlayer.X].className = currentPlayer.className;
            moveSuccess = true;
        }
        return moveSuccess;
    };

    return { init: init };
})();