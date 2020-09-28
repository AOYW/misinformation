// Web service call
var imageInfo;
var game = [];
var downloadIDs = {};
var sharers;
var names;
var answers = {};
var beliefs = {};
var truths = {};
var log = []

var url = new URL("https://script.google.com/a/berkeley.edu/macros/s/AKfycbxO9VA64M6mIpwd2F9pLe6OXx6Kb1qgOiu1LI-e/exec")

var params = [
	["Sheet", "ImageReference"],
	["GameID", "${e://Field/GameID}"],
	["Search", "Images"],
]

url.search = new URLSearchParams(params).toString();

fetch(url)
	.then(response => response.json())
	.then(data => {
		imageInfo = data.Images;
		for (var img of data.Images) {
			downloadIDs[img.ImageID] = img.DownloadID;
			truths[img.ImageID] = img.IsTrue;
			game.push(img.ImageID);
		}
	})

if ("${e://Field/RoundID}" == "1") { // Get the prompt to display to Round 1 participants
	var shareParams = [
		["Sheet", "Sharing" + "${e://Field/GameID}"],
		["GameID", "${e://Field/GameID}"],
		["Search", "Prompt"],
	];
	
	url.search = new URLSearchParams(shareParams).toString();
	
	fetch(url)
		.then(response => response.json())
		.then(data => {
			sharers = data.Prompt;
		})
	
		// Get Names in later rounds
	var shareParams = [
		["Sheet", "Sharing" + "${e://Field/GameID}"],
		["GameID", "${e://Field/GameID}"],
		["Search", "Round2"],
	];
	
	url.search = new URLSearchParams(shareParams).toString();
	
	fetch(url)
		.then(response => response.json())
		.then(data => {
			names = data.Round2;
		})
} else if ("${e://Field/RoundID}" == "2") {  // Get the names of sharers for Round 2 participants
	var shareParams = [
		["Sheet", "Sharing" + "${e://Field/GameID}"],
		["GameID", "${e://Field/GameID}"],
		["Search", "Sharers"],
	];
	
	url.search = new URLSearchParams(shareParams).toString();
	
	fetch(url)
		.then(response => response.json())
		.then(data => {
			sharers = data.Sharers;
		})
}

// Initialize the download path for the images
var prefix = "https://drive.google.com/u/1/uc?id=";
var suffix = "&export=download";

Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/
	
});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/
	
	// Force to wait for 5 seconds before moving on.
	this.hideNextButton();
	setTimeout(function() {
		Qualtrics.SurveyEngine.setEmbeddedData("GameLength", game.length.toString());
		if ("${e://Field/RoundID}" == "1") {
			Qualtrics.SurveyEngine.setEmbeddedData("Prompt", sharers);
			Qualtrics.SurveyEngine.setEmbeddedData("Round2", names);
		}
		jQuery("#NextButton").show(); 
	}, 5000);
	
});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
	
});
