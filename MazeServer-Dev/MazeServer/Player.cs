using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MazeServer
{
    public class Player
    {
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public PlayerState State { get; set; }
        public string PartnerConnectionId { get; set; }
    }

    public enum PlayerState
    {
        Available,
        Busy
    }
}