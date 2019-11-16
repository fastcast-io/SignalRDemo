"use strict"

var hasJoined = false
var mySessionCode = -1
document.getElementById("removeSessionCode").disabled = true

var sessionConnection = new signalR.HubConnectionBuilder().withUrl("/sessionHub").build();
sessionConnection.start().then(function () {
    console.log("Connection was started")
    console.log("Not on the index page? There is no button to enable")
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("setSessionCode").addEventListener("click", function(event) {
    mySessionCode = document.getElementById("mySessionCode").value
    sessionConnection.invoke("JoinSession", mySessionCode).then(function () {
        hasJoined = true
        document.getElementById("removeSessionCode").disabled = false
        document.getElementById("setSessionCode").disabled = true
    }).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
    
})

document.getElementById("removeSessionCode").addEventListener("click", function(event) {
    // mySessionCode = document.getElementById("mySessionCode").value
    if (hasJoined) {
        sessionConnection.invoke("ExitSession", mySessionCode).then(function () {
            hasJoined = false
            document.getElementById("removeSessionCode").disabled = true
            document.getElementById("setSessionCode").disabled = false
        }).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
    
})

sessionConnection.on("EngageSession", function () {
    document.getElementById("session-started").style.display = "initial"
    document.getElementById("session-ended").style.display = "none"
});

sessionConnection.on("HaltSession", function () {
    document.getElementById("session-started").style.display = "none"
    document.getElementById("session-ended").style.display = "initial"
});

sessionConnection.on("ShowDurationLeft", function (durationLeft) {
    // console.log(durationLeft)
    document.getElementById("time-left").innerText = durationLeft.remaining;
});

sessionConnection.on("StopTimer", function () {
    // console.log("Timer stopped")
    document.getElementById("time-left").innerText = "Timer stopped";
    setInterval(function() {
        document.getElementById("time-left").innerText = "";
    }, 5000);
});