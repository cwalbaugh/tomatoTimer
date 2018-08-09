let button = document.querySelector('#start-stop');
button.addEventListener('click', startCount);
let ticker;
let isOn = false;
console.log("isOn is:", isOn);

//stop enter key event on buttons to prevent conflict with timer events
window.addEventListener('keydown',function(e){if(e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13){if(e.target.nodeName=='BUTTON'){e.preventDefault();return false;}}},true);

document.addEventListener('keyup', function(event) {

	if (event.which === 13 || event.which === 32) {
		event.preventDefault();
		if (!isOn) { startCount();}
	}
});
let buzzer = new Audio('../audio/buzzer.mp3')



//Start count uses the difference between the actual time when the the button is clicked
//and the actual current time to calculate the amount of time elapsed.
function startCount () {
	isOn = true;
	console.log("isOn is:", isOn);

	document.addEventListener('keyup', function(event) {

		if (event.which === 13 || event.which === 32) {
			event.preventDefault();
			if (isOn) { pause();}
		}
	});


	let isPaused = false;
	let offset = 0;
	let count = 0;

	//get time at start of function
	let startTime = new Date().getTime();
	startTime = Math.floor(startTime / 100) / 10;
	//	console.log('The startTime is: ');
	//	console.log(startTime);


	let startValue = document.querySelector('#pomodoro-length').value;
	let breakValue = document.querySelector('#break-length').value;

	//Convert colon separated time to decimal value
	let regex1 = /([:])\w/;
	let regex2 = /([.])\w/;
	if (regex1.test(startValue)) {
		let times = startValue.split(':')
		startValue = Number(times[1])/60 + Number(times[0])
	}
	if (regex1.test(breakValue)) {
		document.querySelector('#break-remaining').innerHTML = breakValue;
		let times = breakValue.split(':');
		breakValue = Number(times[1])/60 + Number(times[0]);
	}
	if (regex2.test(breakValue)) {
		let mm = Math.floor(breakValue);
		let ss = Math.floor((breakValue - mm) * 60);
		let printableBreak = mm + ":" + ss;
		document.querySelector('#break-remaining').innerHTML = printableBreak;
	}
	if (!regex1.test(breakValue) && !regex2.test(breakValue)) {
		document.querySelector('#break-remaining').innerHTML = breakValue;
	}
	//	console.log('The startValue is: ');
	//	console.log(startValue);

	// Clock mechanism assisted by the design of James Edwards
  //https://www.sitepoint.com/creating-accurate-timers-in-javascript/
	
	ticker = setInterval(function() {
		console.log("ticker begun")
		if (!isPaused) {
			//get time elapsed since start of function
			//by calling for the system time again
			let currentTime = new Date().getTime();
			currentTime = Math.floor(currentTime / 100) / 10;

			let elapsed = (offset + ( currentTime - startTime )) / 60;
			

			//Wrapping the remaining parts of the function in the if/else
			//prevents timer from printing negative values, and from showing
			//'Stop' on button when pressed at zero.
			if (elapsed >= Number(startValue) + Number(breakValue)) {
				isOn = false;
				stopper(ticker);
				buzzer.play();
			}
			else if (elapsed >= startValue) {
				if (count === 0) {buzzer.play();}
				count++;

				let remaining = breakValue - (elapsed - startValue);
				updateSVG(remaining, breakValue);
				//	console.log("remaining is:");
				//	console.log(remaining);

				//convert remaining back to colon time
				let mm = Math.floor(remaining);
				let ss = Math.floor((remaining - mm) * 60);
				remaining = mm + ":" + ss;

				document.querySelector('#break-remaining').innerHTML = remaining;
				document.title = remaining;
			}
			else {
				let remaining = startValue - elapsed;
				console.log('remaining is: ', remaining);
				updateSVG(remaining, startValue);
				button.innerHTML = 'Restart';
				//	console.log("remaining is:");
				//	console.log(remaining);

				//convert remaining back to colon time
				let mm = Math.floor(remaining);
				let ss = Math.floor((remaining - mm) * 60);
				remaining = mm + ":" + ss;

				document.querySelector('#pomodoro-remaining').innerHTML = remaining;
				document.title = remaining;

			}

		} //end if === isPaused

	}, 100);	


	let pause = function () {
		isPaused = !isPaused;
		if (isPaused) {
			pauseButton.innerHTML = 'Play';
			offsetStart = new Date().getTime();
			offsetStart = Math.floor(offsetStart / 100) / 10;

			offset += (offsetStart - startTime);

		} else {
			pauseButton.innerHTML = 'Pause';
			startTime = new Date().getTime();
			startTime = Math.floor(startTime / 100) / 10;
		} 
	}	
	let pauseButton = document.querySelector('.pause');
	pauseButton.addEventListener('click', function (e) {
		e.preventDefault();
		pause();	
	});

	button.removeEventListener('click', startCount);
	button.addEventListener('click', function(){stopper(ticker)}, {once:true});
}


let stopper = function (timer) {
	clearInterval(timer);
	button.addEventListener('click', startCount);
	isPaused = false;
	button.removeEventListener('click', stopper);
	if (isOn) {startCount();};
	console.log("stopper run")
};


let Button = function (button) {
	let input = button.parentNode.querySelector('input');
	this.logger = function () {
		console.log(input);
	}

	this.increase = function () {
		let val = Number(input.value);
		val += 1;
		input.value = val;
	}

	this.decrease = function () {
		let val = Number(input.value);
		val -= 1;
		input.value = val;
	}
}

let pomodoroIncrease = new Button(document.querySelector('#pomodoro-increase'));
let pomodoroIncreaseButton = document.querySelector('#pomodoro-increase');
pomodoroIncreaseButton.addEventListener('click', pomodoroIncrease.increase);

let pomodoroDecrease = new Button(document.querySelector('#pomodoro-decrease'));
let pomodoroDecreaseButton = document.querySelector('#pomodoro-decrease');
pomodoroDecreaseButton.addEventListener('click', pomodoroDecrease.decrease);

let breakIncrease = new Button(document.querySelector('#break-increase'));
let breakIncreaseButton = document.querySelector('#break-increase');
breakIncreaseButton.addEventListener('click', breakIncrease.increase);

let breakDecrease = new Button(document.querySelector('#break-decrease'));
let breakDecreaseButton = document.querySelector('#break-decrease');
breakDecreaseButton.addEventListener('click', breakDecrease.decrease);


//Hourglass svg control
//Dave Rupert
//June 1, 2018
//https://daverupert.com/2018/03/animated-svg-radial-progress-bars/

function updateSVG (num, denom) {

	const meters = document.querySelectorAll('.meter');

	meters.forEach( (path) => {
		// Get the length of the path
		let length = path.getTotalLength();
		console.log("length is: ", length);

		// console.log(length) and hardcode the value for both stroke-dasharray & stroke-dashoffest styles
		// If unable to hardcode, set dynamically...
		// path.style.strokeDashoffset = length;
		// path.style.strokeDasharray = length;

		// Calculate the percentage of the total length
		// This value can be tricky to understand. If the data-value is '40' then 'to' will be 60, i.e. the inverse percentage. Why is this the number we want? strokeDashoffset describes at what point in the path to start drawing it. By telling it to start drawing 60% of the way through, there is only 40% left to draw. Thereby drawing a line which is 40% of the total length.
		console.log("num is: ", num);
		console.log("denom is: ", denom);
		console.log("length is: ", length);
		let to = length * (num / denom);
		if (to < 5) { to = 0 };
		console.log("to is: ", to);

		// Trigger Layout in Safari hack https://jakearchibald.com/2013/animated-line-drawing-svg/
		path.getBoundingClientRect();
		// Set the Offset
		path.style.strokeDashoffset = Math.max(0, to);
	});
}

