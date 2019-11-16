using Microsoft.AspNetCore.SignalR;
using SignalRDemo;
using System;
using System.Threading.Tasks;
using System.Globalization;
using System.Diagnostics;

namespace SignalRChat.Hubs
{
    public interface ISessionClient
    {
        Task EngageSession(string sessionCode);
        Task HaltSession(string sessionCode);
        Task ShowDurationLeft(string timeLeft);
        Task StopTimer();
        Task UserHasJoined();
        Task UserLeft();
    }

    public class SessionHub : Hub<ISessionClient>
    {
        private SessionDuration _duration;

        public SessionHub(SessionDuration sessionDuration)
        {
            _duration = sessionDuration;
        }

        public async Task StartTimer(string sessionCode, int durationInSeconds)
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            var endTime = DateTime.Now.AddSeconds(durationInSeconds);
            _duration.Elapsed += (sender, e) => UpdateDuration(sender, e, sessionCode, endTime);
            _duration.Interval = 1000;
            _duration.Enabled = true;
        }

        static void UpdateDuration(object sender, System.Timers.ElapsedEventArgs e, string sessionCode, DateTime endTime)
        {
            var _duration = (SessionDuration)sender;
            Debug.WriteLine($"\n\n\n*************************END TIME IS {endTime}");
            //IHubClients<ISessionClient> hubClients = _duration.HubContext.Clients as IHubClients<ISessionClient>;

            //hubClients.All.ShowDurationLeft(DateTime.Now.ToString("T", CultureInfo.CreateSpecificCulture("en-US")));
            var currentTime = DateTime.Now;
            var remainingTime = endTime - currentTime;

            _duration.HubContext.Clients.Group(sessionCode).SendAsync(
                "ShowDurationLeft",
                new { 
                    //Left=currentTime.ToString("T", CultureInfo.CreateSpecificCulture("en-US")),
                    Remaining= Math.Ceiling(remainingTime.TotalSeconds)
                }
            );
        }

        public async Task StopTimer(string sessionCode, int durationInSeconds)
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            // Maybe I should find a way to better dispose of it
            //_duration.Elapsed -= (sender, e) => UpdateDuration(sender, e, sessionCode, DateTime.Now.AddSeconds(durationInSeconds));
            _duration.Enabled = false;

            # pragma warning disable CA2007
            await Clients.OthersInGroup(sessionCode).StopTimer();
        }

        public async Task JoinSession(string sessionCode)
        {
            // Need to implement logic to check if session has started
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).UserHasJoined();
            //await Clients.Group(sessionCode).SendAsync("Send", $"{Context.ConnectionId} has joined the group {sessionCode}.");
        }

        public async Task ExitSession(string sessionCode)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).UserLeft();
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