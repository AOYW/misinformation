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
	if(type == "next") {
		var key =game["${lm://CurrentLoopNumber}" - 1];
		var ans = this.getChoiceAnswerValue();
		if (parseInt(ans) < 5) {
			ans = "No";
		} else if (parseInt(ans) > 5) {
			ans = "Yes";
		}
		answers[key] = ans;
		Qualtrics.SurveyEngine.setEmbeddedData("userAnswers", JSON.stringify(answers));
	}
	
});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});
