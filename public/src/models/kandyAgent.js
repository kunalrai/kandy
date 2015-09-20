function kandyAgent() {

    kandy.setup({

        remoteVideoContainer: $('#incoming-video')[0],
        localVideoContainer: $('#outgoing-video')[0],
        // listeners registers events to handlers
        // You can handle all Kandy Events by registering it here
        listeners: {
            callinitiated: onCallInitiate,
            callinitiatefailed: onCallInitiateFail,
            oncall: onCall,
            callended: onCallTerminate,
            callendfailed: onCallEndedFailed,
            callanswered: onCallAnswer
        }
    });
}

function onCallAnswer(call) {
    callId = call.getId();

    $audioRingOut[0].pause();
    $audioRingIn[0].pause();
}
// Event handler for callrejected event
function onCallRejected() {
    console.debug('callrejected');
    callId = null;
    $audioRingIn[0].pause();
    UIState.callrejected();
    alert('Call Rejected');
}

// Event handler for callinitiatefail event
function onCallInitiateFail() {
    console.debug('call initiate fail');

    $audioRingOut[0].pause();
    UIState.initial();
    alert('call failed');
}

function onCallInitiate(call) {
    callId = call.getId();

    $audioRingIn[0].pause();
    $audioRingOut[0].play();

    $('#username-calling').text('Calling ' + $('#user_to_call').val());
    UIState.callinitialized();
}
// Event handler for oncall event
function onCall(call) {
    console.debug('oncall');
    $audioRingOut[0].pause();
    UIState.oncall();
}
// Event handler for callendedfailed event
function onCallEndedFailed() {
    console.debug('callendfailed');
    callId = null;
}
// Event handler for callended event
function onCallTerminate(call) {
    console.debug('callended');
    callId = null;

    $audioRingOut[0].play();
    $audioRingIn[0].pause();

    UIState.initial();
}
var userArray =[];

var username, UIState = {};
UIState.authenticated = function(username) {
    $('#login-form').addClass('hidden');
    $('#logged-in').removeClass('hidden');
    $('.username').text(username);
};

UIState.unauthenticated = function() {
    $('#login-form').removeClass('hidden');
    $('#logged-in').addClass('hidden');
    $('.username').text('');
};

UIState.initial = function() {
    console.log('initial');

    $audioRingIn[0].pause();
    $audioRingOut[0].pause();

    $('#call-form p, #incoming-call p, #call-connected p').text('');
    $('#incoming-call, #call-connected, .call-terminator, #resume-call-btn').addClass('hidden');
    $('#call-form, .call-initializer').removeClass('hidden')
};

UIState.callinitialized = function() {
    console.log('callinitialized');

    $('.call-initializer').addClass('hidden');
};



kandyAgent.prototype.connect = function (username){
    var apiKey = 'DAK2bd5f97000ce49c589763f36e25a91e3';
    var password = 'acid_123';

    kandy.login(apiKey, username, password,function(msg){

            userArray.push(username);
            kandy.getLastSeen(userArray);
            console.log('login success ')
            UIState.authenticated(username);
        },
        function(msg){

            console.log('Login Failed!');
        });
    console.log('signing in please wait...');
}
$(function(){

    var agent = new kandyAgent();

    var callId, username;

    // Create audio objects to play incoming calls and outgoing calls sound
    var $audioRingIn = $('<audio>', { loop: 'loop', id: 'ring-in' });
    var $audioRingOut = $('<audio>', { loop: 'loop', id: 'ring-out' });

    // Load audio source to DOM to indicate call events
    var audioSource = {
        ringIn: [
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3', type: 'audio/mp3' },
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg', type: 'audio/ogg' }
        ],
        ringOut: [
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3', type: 'audio/mp3' },
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg', type: 'audio/ogg' }]
    };

    audioSource.ringIn.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingIn.append($source);
    });

    audioSource.ringOut.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingOut.append($source);
    });


    // Event handler for call answer button
    $('#answer-call-btn').on('click', function() {
        kandy.call.answerCall(callId, true);
        UIState.oncall();
    });

    // Event handler for call reject button
    $('#reject-call-btn').on('click', function() {
        kandy.call.rejectCall(callId);
        UIState.initial();
    });
    UIState.callincoming = function() {
        console.log('call incoming');

        $('#call-form, #call-connected').addClass('hidden');
        $('#incoming-call').removeClass('hidden');
    };

    UIState.callrejected = function() {
        console.log('call rejected');

        $('#incoming-call').addClass('hidden');
    };

    $('#login-btn').on('click', function(e) {
        e.preventDefault();
        debugger;
        var username = $('#username').val();
        agent.connect(username);

    });// Event handler for logout button
    $('#logout-btn').on('click', function(e) {
        e.preventDefault();
        /** logout(success) logs a user out of the Kandy Platform
         @param <function> success - Callback handler for
         successful logout
         */
        kandy.logout(function() {
            userArray.push(username);
            kandy.getLastSeen(userArray);
            UIState.unauthenticated();
        });
    });
    // Event handler for callinitiate





    $('#initialize-call-btn').on('click', function() {
        var username = $('#user_to_call').val();
        debugger;
        /** makeCall( userName, cameraOn ) : Void
         Initiates a call to another Kandy user over web
         @params <string> userName, <boolean> cameraOn
         */
        kandy.call.makeCall(username, true);
    });



    $('#hold-call-btn').on('click', function() {
        kandy.call.holdCall(callId);
        UIState.holdcall();
    });

    $('#resume-call-btn').on('click', function() {
        kandy.call.unHoldCall(callId);
        UIState.resumecall();
    });

    // Event handler for call end button
    $('#end-call-btn').on('click', function() {
        kandy.call.endCall(callId);
        UIState.initial();
    });

    UIState.oncall = function() {
        console.log('oncall');

        $('#incoming-call, #call-form').addClass('hidden');
        $('#call-connected').removeClass('hidden');
    };

    UIState.holdcall = function() {
        console.log('holdcall');

        $('#hold-call-btn').addClass('hidden');
        $('#resume-call-btn').removeClass('hidden');
    };

    UIState.resumecall = function() {
        console.log('resumecall');

        $('#hold-call-btn').removeClass('hidden');
        $('#resume-call-btn').addClass('hidden');
    };

});