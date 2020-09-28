Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnPageSubmit(function(type)
{
	// Updating answers
	if(type == "next") {
		var key =game["${lm://CurrentLoopNumber}" - 1];
		var choice = this.getChoiceAnswerValue(); //use this to access answers on the same page
		if (choice == "24") {
			answers[key] = "Yes";
		} else if (choice == "25") {
			answers[key] = "No";
		}
		Qualtrics.SurveyEngine.setEmbeddedData("userAnswers", JSON.stringify(answers));
	}
});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
	
});
