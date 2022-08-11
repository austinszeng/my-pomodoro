const timer = {
    pomodoro: 1,
    break: 1,
    sessions: 0,
};

// Ensures 'mode' and 'remainingTime' properties are applied to timer on page load
document.addEventListener('DOMContentLoaded', () => {
    // If browser supports notifications
    if ('Notification' in window){
        // If permissions need to be granted / denied
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied'){
            // Ask user for permission
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    new Notification(
                        'Great! You will be notified at the start of each session'
                    );
                }
            });
        }
    }
    switchMode('pomodoro');
});

var interval;

// Start button
const buttonSound = new Audio('/assets/button.mp3');
const mainButton = document.getElementById('js-btn')
mainButton.addEventListener('click', () => {
    buttonSound.play()
    // action stores value of data-action
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    } else {
        stopTimer();
    }
});

// Pomodoro vs. Breaks
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    // deactivate / remove class 'active'
    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    // wtf is `` as opposed to the normal apostrophes
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    // Progress bar needs a max attribute, so we're adding it here
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total);

    updateClock();
}

// Happens whenever user changes mode
function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

function updateClock(){
    // What is this formatting { bruh } uts ab object?
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2,'0');
    const seconds = `${remainingTime.seconds}`.padStart(2,'0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    // Display in website title
    const text = timer.mode === 'pomodoro' ? 'Get back to work ._.' : 'Take a break :)'
    // Template literals are surrounded in backticks
    document.title = `${minutes}:${seconds} — ${text}`;

    const progress = document.getElementById('js-progress');
    // Change minutes to seconds on pomodoro timer 
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function getRemainingTime(endTime){
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    // evaluate string as a decimal (base 10)
    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

function startTimer(){
    var { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    // Session count
    if (timer.mode === 'pomodoro' && timer.remainingTime.minutes === timer.pomodoro) {
        timer.sessions++
        const sessionCount = document.getElementById('session-count');
        sessionCount.textContent = timer.sessions;
    }

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0){
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.mode === 'pomodoro') {
                        switchMode('break');
                    } else {
                        switchMode('pomodoro');
                    }
                    break;
                    default:
                        switchMode('pomodoro');
            }

            // Send a notification if user granted notification permissions
            if (Notification.permission === 'granted'){
                // Can make this a lil variable or something since it's used twice and I might want to easily change it
                const text = timer.mode === 'pomodoro' ? 'Get back to work ._.' : 'Take a break :)';
                new Notification(text);
            }

            /////////// This is an attempt to give user selected audio...move on for now
            var currMode;
            if(timer.mode === 'pomodoro'){currMode = "start-choice";}
            else{currMode = "break-choice";}
            // Store user selection
            var selectList = document.getElementById(currMode);
            var userSelect = selectList.options[ selectList.selectedIndex ].value ;
            // change audio source to user selected one
            // document.getElementById('audio-pomodoro').src = '/assets/' + userSelect.outerHTML + '.mp3';
            document.getElementById('audio-break').src = '/assets/lego.mp3';
            // document.getElementById(currMode).src = '/assets/' + yourSelect.outerHTML + '.mp3';
            /////////////
        
            document.querySelector(`[data-sound="${timer.mode}"]`).play();
            // Delay time switch to allow for some breathing time
            const msDelay = 1100;
            setTimeout(function(){
                startTimer();
            }, msDelay);
        }
    }, 1000);
}

function stopTimer() {
    // Pause countdown
    clearInterval(interval);

    // I see potential in this turning into a function
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}