using Microsoft.AspNetCore.SignalR;
using SignalRDemo;
using System;
using System.Threading.Tasks;
using System.Globalization;

namespace SignalRChat.Hubs
{
    public interface ISessionClient
    {
        Task EngageSession(string sessionCode);
        Task HaltSession(string sessionCode);
        Task ShowDurationLeft(string timeLeft);
        Task StopTimer();

    }

    public class SessionHub : Hub<ISessionClient>
    {
        private SessionDuration _duration;

        public SessionHub(SessionDuration sessionDuration)
        {
            _duration = sessionDuration;
        }

        public async Task StartTimer(string sessionCode)
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            _duration.Elapsed += (sender, e) => UpdateDuration(sender, e, sessionCode);
            _duration.Interval = 1000;
            _duration.Enabled = true;
        }

        static void UpdateDuration(object sender, System.Timers.ElapsedEventArgs e, string sessionCode)
        {
            var _duration = (SessionDuration)sender;
            //IHubClients<ISessionClient> hubClients = _duration.HubContext.Clients as IHubClients<ISessionClient>;

            //hubClients.All.ShowDurationLeft(DateTime.Now.ToString("T", CultureInfo.CreateSpecificCulture("en-US")));
            _duration.HubContext.Clients.Group(sessionCode).SendAsync(
                "ShowDurationLeft", 
                DateTime.Now.ToString("T", CultureInfo.CreateSpecificCulture("en-US"))
            );
        }

        public async Task StopTimer(string sessionCode)
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            _duration.Elapsed -= (sender, e) => UpdateDuration(sender, e, sessionCode);
            _duration.Enabled = false;

            # pragma warning disable CA2007
            await Clients.OthersInGroup(sessionCode).StopTimer();
        }

        public async Task JoinSession(string sessionCode)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);

            //await Clients.Group(sessionCode).SendAsync("Send", $"{Context.ConnectionId} has joined the group {sessionCode}.");
        }

        public async Task ExitSession(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            //await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
        }

        public async Task StartSession(string sessionCode)
        {
            //await Clients.All.SendAsync("EngageSession", sessionCode);
            #pragma warning disable CA2007
            await Clients.All.EngageSession(sessionCode);
        }

        public async Task StopSession(string sessionCode)
        {
            //await Clients.All.SendAsync("HaltSession", sessionCode);
            #pragma warning disable CA2007
            await Clients.All.HaltSession(sessionCode);
        }
    }
}