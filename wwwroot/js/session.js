"use strict";

var sessionConnection = new signalR.HubConnectionBuilder().withUrl("/sessionHub").build();

//Disable send button until connection is established
//console.log(window.URL())
var sessionCode = "";
var sessionDuration = "";
var endedTimer = false;
var hasJoined = true

sessionConnection.start().then(function () {
    console.log("Connection was started")
    if (window.location.pathname === "/") {
        document.getElementById("startSession").disabled = false;
        document.getElementById("stopSession").disabled = false;
        document.getElementById("startTimer").disabled = false;
        document.getElementById("setSessionCode").disabled = false;
        // document.getElementById("stopTimer").disabled = false;
    }
    else {
        console.log("Not on the index page? There is no button to enable")
    }
}).catch(function (err) {
    return console.error(err.toString());
});


// if (window.location.pathname === "/") { // TODO: have a better check when in production
document.getElementById("startSession").disabled = true;
document.getElementById("stopSession").disabled = true;
document.getElementById("startTimer").disabled = true;
document.getElementById("stopTimer").disabled = true;
document.getElementById("stopTimer").hidden = true;
document.getElementById("setSessionCode").disabled = true;
document.getElementById("removeSessionCode").disabled = true;

document.getElementById("setSessionCode").addEventListener("click", function(event) {
    sessionCode = document.getElementById("sessionCode").value
    sessionConnection.invoke("JoinSession", sessionCode).then(function () {
        hasJoined = true
        document.getElementById("removeSessionCode").disabled = false
        document.getElementById("setSessionCode").disabled = true
    }).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
    
})

document.getElementById("removeSessionCode").addEventListener("click", function(event) {
    if (hasJoined) {
        sessionConnection.invoke("ExitSession", sessionCode).then(function () {
            hasJoined = false
            document.getElementById("removeSessionCode").disabled = true
            document.getElementById("setSessionCode").disabled = false
        }).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
    
})

document.getElementById("startSession").addEventListener("click", function (event) {
    sessionCode = document.getElementById("sessionCode").value;
    sessionConnection.invoke("StartSession", sessionCode).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("stopSession").addEventListener("click", function (event) {
    sessionCode = document.getElementById("sessionCode").value;
    sessionConnection.invoke("StopSession", sessionCode).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("startTimer").addEventListener("click", function(event) {
    sessionCode = document.getElementById("sessionCode").value;
    sessionDuration = parseInt(document.getElementById("sessionDuration").value)
    sessionConnection.invoke("StartTimer", sessionCode, parseInt(sessionDuration)).then(function () {
        console.log(`Starting timer at ${Date.now.toString()} for ${sessionDuration} seconds`);
        endedTimer = false;
        document.getElementById("startTimer").disabled = true;
    }).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
})

sessionConnection.on("ShowDurationLeft", function (durationLeft) {
    if (!endedTimer) {
        if (parseFloat(durationLeft.remaining) > 0) {
            document.getElementById("remaining-time").innerText = durationLeft.remaining;
        }
        else {
                document.getElementById("remaining-time").innerText = "DONE";
                stopTimer();
                endedTimer = true
            }
    }

});

function stopTimer() {
    sessionConnection.invoke("StopTimer", sessionCode, sessionDuration).then(function () {
        console.log("Stopping timer at", Date.now.toString())
        document.getElementById("startTimer").disabled = false;
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

sessionConnection.on("UserHasJoined", function() {
    var currentConnectedParticipants = document.getElementById("connected-participants").innerText 
    if (currentConnectedParticipants === "") {
        document.getElementById("connected-participants").innerText = 0
    }
    else {
        document.getElementById("connected-participants").innerText = parseInt(document.getElementById("connected-participants").innerText) + 1;
    }
})

sessionConnection.on("UserLeft", function() {
    var currentConnectedParticipants = document.getElementById("connected-participants").innerText 
    if (currentConnectedParticipants !== "" && parseInt(currentConnectedParticipants) > 0) {
        document.getElementById("connected-participants").innerText = parseInt(document.getElementById("connected-participants").innerText) - 1;
    }
})
// }
