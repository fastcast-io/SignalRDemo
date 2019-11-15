"use strict";

var sessionConnection = new signalR.HubConnectionBuilder().withUrl("/sessionHub").build();

//Disable send button until connection is established
//console.log(window.URL())
var mySessionCode = 42;

sessionConnection.on("EngageSession", function (sessionCode) {
    console.log(`EngageSession was called ${parseInt(sessionCode)}`)
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
    console.log(`HaltSession was called ${parseInt(sessionCode)}`)
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

sessionConnection.start().then(function () {
    console.log("Connection was started")
    if (window.location.pathname === "/session") {
        document.getElementById("startSession").disabled = false;
        document.getElementById("stopSession").disabled = false;
    }
    else {
        console.log("On the index page, there is no button to enable")
    }
}).catch(function (err) {
    return console.error(err.toString());
});

if (window.location.pathname === "/session") {
    document.getElementById("startSession").disabled = true;
    document.getElementById("stopSession").disabled = true;

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
}
