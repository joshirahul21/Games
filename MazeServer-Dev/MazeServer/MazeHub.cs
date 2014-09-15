using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MazeServer
{
    public class MazeHub : Hub
    {
        private static List<Player> _players = new List<Player>();

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            this.RemovePlayerFromGameRoom();
            return base.OnDisconnected(stopCalled);
        }

        private void RemovePlayerFromGameRoom()
        {
            Player removedPlayer = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(this.Context.ConnectionId));
            if (removedPlayer != null)
            {
                _players.Remove(removedPlayer);
                Clients.Others.removePlayerFromGameRoom(removedPlayer.ConnectionId);
            }
        }

        public void InvokeMazeHub(string connectionId)
        {
            Clients.Client(connectionId).updatePlayerMove();
        }

        public void InvokePartnerMove(string keyIdentifier)
        {
            string connectionId = this.Context.ConnectionId;
        }

        public void EnterToGameRoom(string playerName)
        {
            var player = new Player()
            {
                Name = playerName,
                ConnectionId = this.Context.ConnectionId
            };

            if (player != null && !_players.Any(t1 => t1.ConnectionId.Equals(this.Context.ConnectionId)))
            {
                //Add player to player list.
                _players.Add(player);

                var players = from p in _players
                              where p.ConnectionId != this.Context.ConnectionId
                              select new
                              {
                                  playername = p.Name,
                                  connectionId = p.ConnectionId
                              };

                Clients.Caller.addPlayersToGameRoom(players);

                //Update other players game room with new player.
                Clients.Others.addNewPlayerToGameRoom(player);
            }
            else
            {
                //Pass error here.
            }
        }

        public void JoinGameRequest(string connectionId)
        {
            Player hostPlayer = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(this.Context.ConnectionId));
            Player guestPlayer = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(connectionId));
            if (hostPlayer != null && guestPlayer != null && guestPlayer.State.Equals(PlayerState.Available))
            {
                this.Clients.Client(guestPlayer.ConnectionId).requestToJoinGame(hostPlayer, guestPlayer);
            }
        }

        public void JoinRequestConfirmation(Player hostPlayer, Player guestPlayer, bool result)
        {
            if (hostPlayer != null && guestPlayer != null)
            {
                if (result)
                {
                    Player player1 = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(hostPlayer.ConnectionId));
                    Player player2 = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(guestPlayer.ConnectionId));
                    player1.State = player2.State = PlayerState.Busy;
                    player1.PartnerConnectionId = player2.ConnectionId;
                    player2.PartnerConnectionId = player1.ConnectionId;

                    foreach (var player in _players)
                    {
                        this.Clients.All.updatePlayerState(player1, player2);
                    }
                    this.Clients.Client(hostPlayer.ConnectionId).startGame();
                }
                else
                {
                    this.Clients.Client(hostPlayer.ConnectionId).serveAlert(string.Format("Sorry :( \n{0} rejected your request.", guestPlayer.Name));
                }
            }
        }

        public void UpdateMyMoveToPartner(string keyIdentifier)
        {
            Player player = _players.SingleOrDefault(t1 => t1.ConnectionId.Equals(this.Context.ConnectionId));
            if (player != null && !string.IsNullOrEmpty(player.PartnerConnectionId))
            {
                Clients.Client(player.PartnerConnectionId).updatePartnerMove(keyIdentifier);
            }
        }
    }
}