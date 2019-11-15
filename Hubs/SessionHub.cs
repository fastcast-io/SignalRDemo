using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SignalRChat.Hubs
{
    public class SessionHub : Hub
    {
        public async Task StartSession(string sessionCode)
        {
            await Clients.All.SendAsync("EngageSession", sessionCode);
        }

        public async Task StopSession(string sessionCode)
        {
            await Clients.All.SendAsync("HaltSession", sessionCode);
        }
    }
}