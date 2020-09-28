Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/
	var header = document.createElement("div");  
	header.className = "header"  
	header.id = "header_1";
	
	// Added div to lower the timer position.
	var cushion = document.createElement("div");
	cushion.className = "cushion";
	cushion.id = "cushion_top";
	cushion.style.height = '25px';
	
	var timer = document.createElement("div");
	timer.className = "timer";  
	timer.id = "timer_1";
	timer.style = "text-align:center";
	timer.innerHTML = "Time Remaining: <span id='time'>30:00</span>";
	
	// Source@: Geneve "https://www.qualtrics.com/community/discussion/7656/how-to-implement-a-time-limit-at-the-block-level-plus-auto-advancing"
	// Adapted by Andy Zhong
	if ((document.getElementById("timer_1") == null) && ("${e://Field/GameLength}" >= 1)){
		header.appendChild(timer);
		document.body.insertBefore(header, document.body.firstChild);
		var timerSeconds = parseInt("${e://Field/TimeRemaining}");  
		display = document.querySelector('#time');  
		startTimer(timerSeconds, display);
		header.insertBefore(cushion, timer);
	}

	function startTimer(duration, display) {
		var timer = duration, minutes, seconds;  
		var myTimer = setInterval(function() {  
			Qualtrics.SurveyEngine.setEmbeddedData('TimeRemaining', timer);
			minutes = parseInt(timer / 60, 10)  
			seconds = parseInt(timer % 60, 10);  
			minutes = minutes < 10 ? "0" + minutes : minutes;  
			seconds = seconds < 10 ? "0" + seconds : seconds;  
			var text = ('innerText' in display)? 'innerText' : 'textContent';
			display[text] = minutes + ":" + seconds;  
			
			if (--timer < 0) {  
				clearInterval(myTimer);  
				timeOver();
			}
		}, 1000);
	} 
	
	var timeOver = function() {
		document.getElementById("timer_1").innerHTML = "Time is up.";
		if ("${e://Field/GameLength}" > 0) {
			$('NextButton').click();
		}
	}

	// creates an element for the image if there isn't one already (There should not be one)
	if (document.getElementById("news_image") == null) {
		var start = new Date();
		// Generate a URL path to the image
		var did = downloadIDs[game["${lm://CurrentLoopNumber}" - 1]]
		if (did.split('https:').length == 2) {
			var path = did; //Qualtrics
		} else {
			var path = prefix + did + suffix; //Google Drive
		}
		
		var img = document.createElement("img");
		img.onload = function() {
			var end = new Date()
			var loadTime = end.getTime() - start.getTime();
			log.push({'Img': game["${lm://CurrentLoopNumber}" - 1], 
			'Log': "Loop " + "${lm://CurrentLoopNumber}" + " ImgURL: " + path 
					  + " load time is " + loadTime.toString() + " ms."})
		}
		img.onerror = function() {
			var end = new Date()
			var loadTime = end.getTime() - start.getTime();
			log.push({'Img': game["${lm://CurrentLoopNumber}" - 1], 
			'Log': "Loop " + "${lm://CurrentLoopNumber}" + " ImgURL: " + path
					  + " failed, and timed out at " + loadTime.toString() + " ms."})
		}
		img.src = path;
		img.style.display = 'block';
		img.style.height = '500px';
		img.style.width = "500px";
		img.style.margin = "0 auto";
		img.alt = 'Sorry, the image failed to load.';
		img.id = "news_image";
		
		var bd = document.body;
		
		if ("${e://Field/RoundID}" == "2") {
			var shares = document.createElement("div");
			var text = document.createElement('h3');
			shares.style = "text-align:center";
			shares.style.minHeight = '50px';
			shares.id = "sharing_info";
			var names =  sharers[game["${lm://CurrentLoopNumber}" - 1]];
			if (names == "") {
				text.innerHTML = "None of your friends on your social media has shared this."
			} else {
				text.innerHTML = "<u>" + sharers[game["${lm://CurrentLoopNumber}" - 1]] +"</u>";
			}
			shares.append(text);
			bd.insertBefore(shares, bd.firstChild)
		}
		
		// Place the image on top of the page
		bd.insertBefore(img, bd.firstChild);
	}

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/
	
});

Qualtrics.SurveyEngine.addOnPageSubmit(function(type)
{
	if(type == "next") {
		Qualtrics.SurveyEngine.setEmbeddedData("GameLength", "${e://Field/GameLength}" - 1)
		
		// Update Beliefs
		var key = game["${lm://CurrentLoopNumber}" - 1];
		var belief = 5 - parseInt(this.getChoiceAnswerValue()) + 19; //use this to access answers on the same page
		beliefs[key] = belief.toString();
		
		Qualtrics.SurveyEngine.setEmbeddedData("userBeliefs", JSON.stringify(beliefs));
	}
});


Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
	
	var img = document.getElementById("news_image");
	img.parentNode.removeChild(img);
	if ("${e://Field/RoundID}" == "2") {
		var info = document.getElementById("sharing_info");
		info.parentNode.removeChild(info);
	}
	
	if (parseInt("${e://Field/GameLength}") <= 1) {
		// Clears "Time is up" after two seconds
		setInterval(function(){
			var header = document.getElementById("header_1");
			if (header == null) {
				clearInterval()
			} else {
				header.parentNode.removeChild(header);
			}
		}, 2000);
	}
});
