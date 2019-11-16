"use strict";

var sessionConnection = new signalR.HubConnectionBuilder().withUrl("/sessionHub").build();

//Disable send button until connection is established
//console.log(window.URL())
var mySessionCode = 42;

sessionConnection.on("EngageSession", function (sessionCode) {
    console.log(`EngageSession was called with ${parseInt(sessionCode)}`)
    if (parseInt(sessionCode) === mySessionCode) {
        console.log(`Engage MY Session!!!`)
        if (window.location.pathname === "/") {
            document.getElementById("session-started").style.display = "initial"
            document.getElementById("session-ended").style.display = "none"
        }
        else {
            console.log("Oh, I am the one who started")
        }
    }
});

sessionConnection.on("HaltSession", function (sessionCode) {
    console.log(`HaltSession was called with ${parseInt(sessionCode)}`)
    if (parseInt(sessionCode) === mySessionCode) {
        console.log(`Halt MY Session :(((!!!`)
        if (window.location.pathname === "/") {
            document.getElementById("session-started").style.display = "none"
            document.getElementById("session-ended").style.display = "initial"
        }
        else {
            console.log("Oh, I am the one who started it")
        }
    }
});

sessionConnection.on("ShowDurationLeft", function (durationLeft) {
    console.log(durationLeft)
    document.getElementById("time-left").innerText = durationLeft;
});

sessionConnection.on("StopTimer", function () {
    console.log("Timer stopped")
    document.getElementById("time-left").innerText = "Timer stopped";
    setInterval(function() {
        document.getElementById("time-left").innerText = "";
    }, 5000);
});

sessionConnection.start().then(function () {
    console.log("Connection was started")
    if (window.location.pathname === "/session") {
        document.getElementById("startSession").disabled = false;
        document.getElementById("stopSession").disabled = false;
        document.getElementById("startTimer").disabled = false;
        document.getElementById("stopTimer").disabled = false;
    }
    else {
        console.log("Not on the session page? There is no button to enable")
    }
}).catch(function (err) {
    return console.error(err.toString());
});

if (window.location.pathname === "/session") { // TODO: have a better check when in production
    document.getElementById("startSession").disabled = true;
    document.getElementById("stopSession").disabled = true;
    document.getElementById("startTimer").disabled = true;
    document.getElementById("stopTimer").disabled = true;

    document.getElementById("startSession").addEventListener("click", function (event) {
        var sessionCode = document.getElementById("sessionCode").value;
        sessionConnection.invoke("StartSession", sessionCode).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });

    document.getElementById("stopSession").addEventListener("click", function (event) {
        var sessionCode = document.getElementById("sessionCode").value;
        sessionConnection.invoke("StopSession", sessionCode).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });

    document.getElementById("startTimer").addEventListener("click", function(event) {
        sessionConnection.invoke("StartTimer").then(function () {
            console.log("Starting timer at", Date.now.toString())
        }).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    })

    document.getElementById("stopTimer").addEventListener("click", function(event) {
        sessionConnection.invoke("StopTimer").then(function () {
            console.log("Stopping timer at", Date.now.toString())
        }).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    })
}
