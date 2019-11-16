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

        public async Task StartTimer()
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            _duration.Elapsed += UpdateDuration;
            _duration.Interval = 1000;
            _duration.Enabled = true;
        }

        static void UpdateDuration(object sender, System.Timers.ElapsedEventArgs e)
        {
            var _duration = (SessionDuration)sender;
            //IHubClients<ISessionClient> hubClients = _duration.HubContext.Clients as IHubClients<ISessionClient>;

            //hubClients.All.ShowDurationLeft(DateTime.Now.ToString("T", CultureInfo.CreateSpecificCulture("en-US")));
            _duration.HubContext.Clients.All.SendAsync(
                "ShowDurationLeft", 
                DateTime.Now.ToString("T", CultureInfo.CreateSpecificCulture("en-US"))
            );
        }

        public async Task StopTimer()
        {
            _duration = SessionDuration.Durations.GetOrAdd(Context.ConnectionId, _duration) as SessionDuration;
            _duration.Elapsed -= UpdateDuration;
            _duration.Enabled = false;

            # pragma warning disable CA2007
            await Clients.All.StopTimer();
        }

        //public SessionDuration sessionDuration = new SessionDuration();
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