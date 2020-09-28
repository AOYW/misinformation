Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/
	
	for (var i = 0; i < game.length; i++) {
		var answer = document.createElement("div");
		
		// image
		var p1 = document.createElement('p');
		var imgNum = game.length - i - 1;
		var img = document.createElement("img");
		
		var did = downloadIDs[game[imgNum]];
		if (did.split('https:').length == 2) {
			var path = did; //Qualtrics
		} else {
			var path = prefix + did + suffix; //Google Drive
		}
		
		img.src = path;
		img.style.display = 'block';
		img.style.height = '25%';
		img.style.width = "25%";
		img.style.margin = "0 auto";
		
		img.id = "news_image" + imgNum.toString();
		p1.append(img);
		
		// text
		var p2 = document.createElement('p');
		var truth = document.createElement("h3");
		if (truths[game[imgNum]] == 1) {
			truth.innerHTML = "The information presented above is <span style='color:green'>TRUE</span>";
		} else if (truths[game[imgNum]] == 0) {
			truth.innerHTML = "The information presented above is <span style='color:red'>FALSE</span>";
		}
		truth.style = "text-align:center";
		truth.id = "truth" + imgNum.toString();
		p2.append(truth);
		
		// white space
		var cushion = document.createElement("div");
		cushion.className = "cushion";
		cushion.style.height = '30px';
		
		answer.append(p1);
		answer.append(p2);
		answer.append(cushion);
		
		answer.id = "ans" + imgNum.toString();
		var bd = document.body;
		bd.insertBefore(answer, bd.firstChild);
	}
	
});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/
	var logs = JSON.stringify(log)
	var url = new URL("https://script.google.com/a/berkeley.edu/macros/s/AKfycbxO9VA64M6mIpwd2F9pLe6OXx6Kb1qgOiu1LI-e/exec")
	var saveParams = [
			["Sheet", "Logs"],
			["GameID", "${e://Field/GameID}"],
			["Save", "ImgLogs"],
			["Logs", logs],
			["UserID", "${e://Field/UserID}"],
	]
		
	var p = new URLSearchParams(saveParams);

	fetch(url, {
		method: 'POST', 
		body: p,
	})
		
	// POST web service call to save names of R1 sharers
	if ("${e://Field/RoundID}" == "1") {
		var ans = JSON.stringify(answers);
		var beli = JSON.stringify(beliefs);

		var url = new URL("https://script.google.com/a/berkeley.edu/macros/s/AKfycbxO9VA64M6mIpwd2F9pLe6OXx6Kb1qgOiu1LI-e/exec")
		var saveParams = [
			["Sheet", "Sharing" + "${e://Field/GameID}"],
			["GameID", "${e://Field/GameID}"],
			["Save", "Sharers"],
			["userAnswers", ans],
			["userBeliefs", beli],
			["UserID", "${e://Field/UserID}"],
		]
		
		var p = new URLSearchParams(saveParams);

		fetch(url, {
			method: 'POST', 
			body: p,
		})
	}
			
});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});
