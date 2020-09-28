/*******************
*     Testing      *
********************/
/**
 * For unit testing, QUnit library is imported, please refer to documentaions for usage.
 */

function fakeGet() {
  var eventObject = 
      {
        "method": "get",
        "parameter": {
          "Sheet": "Sharing4",
          "Search": "Round2",
          "GameID": "2"
        },
      }
  doGet(eventObject);
}

function fakePost() {
  var eventObject = 
      {
        "method": "post",
        "parameter": {
          "Sheet": "Logs",
          "GameID": "3", 
          "Save": "ImgLogs",
          "Logs":'[{"Img":"9", "Log": "text"}, {"Img":"10", "Log": "text"}]',
          "userAnswers": '{"9":"No","10":"Yes","19":"No","22":"Yes","25":"Yes"}',
          "userBeliefs": '{"9":"1","10":"3","19":"5","22":"4","25":"2"}',
          "UserID": "12"
        },
      }
  doPost(eventObject);
}

function fakeParse() { //passed
  var ss = SpreadsheetApp.openById("1okZGLgdVTaBhBqV6iUdgIatZbf959DDI7XBJ-ar2ngQ")
  var sheet = ss.getSheetByName("Sharing3");
  var items = sheet.getRange(2, 2, sheet.getLastRow(), 1).getValues().flat();
  
  console.log(items);
  console.log(parseSharers(items));
  console.log(parseBeliefs(items));
  console.log(parseNonsharers(items));
  console.log(parseNumSharers(items));
  console.log(parseNumNonsharers(items));
}

function unitTest() {
  var ss = SpreadsheetApp.openById("1okZGLgdVTaBhBqV6iUdgIatZbf959DDI7XBJ-ar2ngQ")
  console.log(findDisplayType(ss, 3, 1))
  //console.log(findDisplayType(ss, 4, 2))
}



/*******************
*      doPost      *
********************/

/** 
 * This POST method supports saving data and it is defaulted to saving survey responses to the project 
 * Google Sheets.
 * 
 * Optional query parameters:
 * @param {String} ID     : assigns to [ssID=default] (ID of the spreadsheet to save information to)
 * @param {String} Sheet  : assigns to [sheetName='Sheet1'] (Name of the sheet to save information to)
 * @param {String} Save   : assigns to [saveFx='Default'] (the name of the save function, refer to section)
 *
 * @return {JSON} a JSON object depending on the save method
 */
function doPost(e){
   try {
     Logger.log(e);
     
     // Opens the Project Google Sheets by default or any other ones designated
     var ssID = e.parameter["ID"] ||  "1okZGLgdVTaBhBqV6iUdgIatZbf959DDI7XBJ-ar2ngQ";
     var ss = SpreadsheetApp.openById(ssID);
     
     // Sets the sheet to search in, or default to "Responses"
     var sheetName = e.parameter["Sheet"] || "Responses";
     var sheet = ss.getSheetByName(sheetName);
     
     // Choose the function from a library of functions to do the saving
     var saveFx = e.parameter["Save"] || "Default";
     var results = saveFxs[saveFx](sheet, e);
     
     var jsonData = JSON.stringify(results)
     return ContentService.createTextOutput(jsonData).setMimeType(ContentService.MimeType.JSON)
   } catch (e) {
     var error = {
       "error": e
     }
     var jsonError = JSON.stringify(error);
     return ContentService.createTextOutput(jsonError).setMimeType(ContentService.MimeType.JSON);
   }
}



/*******************
*       doGet      *
********************/

/**
 * This GET method supports retrieving data and it is defaulted to getting the names of participants who 
 * shared the news for each news story.
 *
 * Optional query parameters:
 * @param {String} ID      : assigns to [ssID=default] (ID of the spreadsheet to get information from)
 * @param {String} Sheet   : assigns to [sheetName='Test'] (Name of the sheet to get information from)
 * @param {String} Search  : assigns to [searchFx='Default'] (Name of the search function, refer to section)
 *
 * @return {JSON} a JSON object with requested information and others (depending on the search method).
 */
function doGet(e){
  try {
    Logger.log(e);
    
    // Opens the Project Google Sheets by default or any other ones designated
    var ssID = e.parameter["ID"] || "1okZGLgdVTaBhBqV6iUdgIatZbf959DDI7XBJ-ar2ngQ";
    var ss = SpreadsheetApp.openById(ssID);
    
    // Sets the sheet to search in, or default to "Sharing1"
    var sheetName = e.parameter["Sheet"] || "Sharing1";
    var sheet = ss.getSheetByName(sheetName);
    
    // Choose the function from a library of functions to do the searching
    var searchFx = e.parameter["Search"] || "Default";
    var results = this.searchFxs[searchFx](sheet, e);
    
    //Parse the results in JSON and return it
    var jsonData = JSON.stringify(results);
    return ContentService.createTextOutput(jsonData).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    var error = {
      "error": e
    }
    var jsonError = JSON.stringify(error);
    return ContentService.createTextOutput(jsonError).setMimeType(ContentService.MimeType.JSON);
  }
}



/*******************
*  Save Functions  *
********************/
/**
 * Save functions are the functions used when POST requests are sent to the web service, they take in the sheet
 * that the information is writting to, and the event containing all parameters that needed to be saved.
 *
 * All Save functions need to support these two input parameters:
 * @param {Sheet} sheet : the spreadsheet sheets of Google's Spreadsheet Service to save in
 * @param {JSON}  e     : the event object of the web service request
 */

// Currently available keywords for Save Functions are:
var saveFxs = {
  "Default": testingSave,
  "Answers": saveAnswers,
  "Sharers": saveSharers,
  "ImgLogs": saveImgLogs,
};

/**
 * A default testing function to see if parameters are working appropriately.
 */
function testingSave(sheet, e){
  return {"Status": "Success!"}
}

/** 
 * @Source: Martin Klubeck Adapted by Andy Zhong
 * This function saves the survey responses to the given sheet by matching the parameters with the
 * headers, and it fills empty Strings for missing data.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the "data" contains all the parameters that were passed in
 *                      and the "holder" contains all information that was actually saved to the sheet.
 */
function saveAnswers(sheet, e) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var holderArray = [];
  for (var x = 0; x < headers.length; x++) {
    var tempValue = !e.parameter[headers[x]] ? '' : e.parameter[headers[x]];
    holderArray.push(tempValue);
  }
  sheet.appendRow(holderArray);
  var results = {
    "data": e.parameter,
    "holder": holderArray
  };
  return results;
}

/** 
 * This function converts responses to names by matching UserID with the record in participants database
 * and save them in the corresponding sharing sheet.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the "data" contains all the parameters that were passed in
 *                      and the "holder" contains all information that was actually saved to the sheet.
 */
function saveSharers(sheet, e) {
  var headers = sheet.getRange(1, 2, 1, sheet.getLastColumn() - 1).getValues()[0];
  var holderArray = [];
  var userAnswers = JSON.parse(e.parameter["userAnswers"]);
  var userBeliefs = JSON.parse(e.parameter["userBeliefs"]);
  var name = getName(e.parameter["UserID"], sheet.getParent());
  
  for (var x = 0; x < headers.length; x++) {
    var tempValue = !userAnswers[headers[x]] ? '' : userAnswers[headers[x]];
    // Change it into names
    if (tempValue == "Yes") {
      tempValue = 'Yes, '+ name + ': ' + userBeliefs[headers[x]];
    } else if (tempValue == "No") {
      tempValue = 'No, ' + name + ': ' + userBeliefs[headers[x]];
    }
    holderArray.push(tempValue);
  }
  if (!isArrayEmpty(holderArray)) {
    holderArray.unshift(e.parameter["UserID"]);
    sheet.appendRow(holderArray);
  }
  var results = {
    "data": userAnswers,
    "holder": holderArray
  };
  return results;
}

/** 
 * This function converts responses to names by matching UserID with the record in participants database
 * and save them in the corresponding sharing sheet.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the "data" contains all the parameters that were passed in
 *                      and the "holder" contains all information that was actually saved to the sheet.
 */
function saveImgLogs(sheet, e){
  var headers = sheet.getRange(1, 2, 1, sheet.getLastColumn() - 1).getValues()[0];
  var logs = JSON.parse(e.parameter['Logs']);
  var name = getName(e.parameter["UserID"], sheet.getParent());
  var gameID = e.parameter["GameID"];
  var holderArray = [gameID, name];
  
  for (var img of logs) {
    holderArray.push(img['Img']);
    holderArray.push(img['Log']);
  }
  sheet.appendRow(holderArray);
  
  var results = {
    "data": logs,
    "holder": holderArray
  };
  return results;
}



/*******************
* Search Functions *
********************/
/**
 * Search functions are the functions used when GET requests are sent to the web service, they take in the
 * sheet containing the requested information then return the information formated neatly to be used by
 * Qualtrics, all by doing whatever operations necessary using G Suite services and just Javascript in general.
 *
 * All search functions need to support these two input parameters:
 * @param {Sheet} sheet : the spreadsheet sheets of Google's Spreadsheet Service to be searched
 * @param {JSON}  e     : the event object of the web service request
 */

// Currently available keywords for Search Functions are:
var searchFxs = {
  "Default": testingSearch,
  "Sharers": getSharers,
  "Images": getImages,
  "Prompt": getPrompt,
  "Round2": getRound,
  "Alt": altGetSharers, //deprecated: now included in getSharers (does not work with current data structure)
  "Truth": getTruth, //deprecated: now included in getImages
};

/**
 * A testing function to see if parameters are working appropriately.
 */
function testingSearch(sheet, e) {
  return {"Status": "Success!"}
}

/** 
 * This function parses the names (or any other text entries) of each column and return a dictionary 
 * with the header as the key, and all the entries in that column as one single String.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is an 
 *                      dictionary of (ImageIDs : text to display) pairs, where only the Images shown in that
 *                      game will be returned.
 */
function getSharers(sheet, e) {    
  // Collect all headers
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var results = {};
  var ss = sheet.getParent();
  
  // Get ImageIDs that are in the specific game
  var imageIDCol = 1 - 1;
  var gameIDCol = 2 - 1;
  var gameID = parseInt(e.parameter["GameID"]);
  var validImgs = sheetQuery(gameIDCol, gameID, [imageIDCol], ss.getSheetByName("ImageReference"));
  
  // Get the type of display
  var types = findDisplayType(ss, gameID, 2);
  console.log(types)
  // Get the parsing functions
  var parseFxs = {
    'sharers': parseSharers,
    'beliefs': parseBeliefs,
    'nonsharers': parseNonsharers,
    'num_sharers': parseNumSharers,
    'num_nonsharers': parseNumNonsharers,
  }
  
  for (var x = 1; x < headers.length; x++) {
    if (validImgs.includes(headers[x])) {
      var tempValue = sheet.getRange(2, x + 1, sheet.getLastRow(), 1).getValues().flat();
      var tempResult = [];
      for (var i = 0; i < types.length; i++) {
        tempResult.push(parseFxs[types[i]](tempValue));
      }
      results[headers[x]] = tempResult.join('<br>');
    }
  }
  console.log(results)
  return {"Sharers": results};
}

/**
 * This function parses the ImageID and DownloadID with GameID input. Note that the column of each entry 
 * needs to be changed here, since the sheet structure should stay constant.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is an 
 *                      array of all images of a specific game with ImageID, DownloadID, ImageTitle, and 
 *                      isTrue.
 */
function getImages(sheet, e) {
  // Initializes the location of the columns, GameID, and the field to search
  var imageIDCol = 1 - 1;
  var downloadIDCol = 4 - 1;
  var imageTitleCol = 5 - 1;
  var isTrueCol = 6 - 1;
  var gameIDCol = 2 - 1;
  var gameID = parseInt(e.parameter["GameID"]);
  
  return {"Images": sheetQuery(gameIDCol, gameID, [imageIDCol, downloadIDCol, imageTitleCol, isTrueCol], sheet)};
}

/**
 * This function returns the text to display during game explanation to Round 1 participants if their names 
 * will be shown to other participants.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is a single text
 */
function getPrompt(sheet, e) {
  var ss = sheet.getParent();
  var gameID = parseInt(e.parameter["GameID"]);
  var types = findDisplayType(ss, gameID, 1);
  var text;
  if (types == []) {
    text = '';
  } else if (types[0] == 'name') {
    text = 'NOTICE: Your sharing actions will be explicitly referenced to your name for the participants after you.';
  } else if (types[0] == 'num') {
    text = 'NOTICE: Your sharing actions will remain anonymous to the participants after you';
  }
  
  return {"Prompt": text};
}

/**
 * This function returns the text to display during game explanation to Round 1 participants who will be in their later 
 * rounds, which their names will or will not be visible to.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is a single text
 */
function getRound(sheet, e) {
  var ss = sheet.getParent();
  var gameID = parseInt(e.parameter["GameID"]);
  var gameIDCol = 3 - 1;
  var roundIDCol = 4 - 1;
  var nameCol = 5 - 1;
  var names = [];
  
  var game = sheetQuery(gameIDCol, gameID, [roundIDCol, nameCol], ss.getSheetByName("Participants"));
  for (var i = 0; i < game.length; i++) {
    if (game[i]['RoundID'] == 2) {
      names.push(game[i]['UserName'])
    }
  }
  console.log(names)
  return {'Round2': names.join(', ')};
}

/** 
 * This function parses the names (or any other text entries) of each column and return a dictionary 
 * with the header as the key, and all the entries in that column as one single String.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is an 
 *                      dictionary of (ImageIDs : names of sharers) pairs, where only the Images shown in that
 *                      game will be returned.
 */
function altGetSharers(sheet, e) {
  // Collect all headers
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var results = {};
  
  // Get ImageIDs that are in the specific game
  var imageIDCol = 1 - 1;
  var gameIDCol = 2 - 1;
  var gameID = parseInt(e.parameter["GameID"]);
  var validImgs = sheetQuery(gameIDCol, gameID, [imageIDCol], sheet.getParent().getSheetByName("ImageReference"));
  
  for (var x = 0; x < headers.length; x++) {
    if (validImgs.includes(headers[x])) {
      var tempValue = sheet.getRange(2, x + 1, sheet.getLastRow(), 1).getValues();
      // Remove empty values and join all names as one String
      tempValue = [].concat.apply([], tempValue).filter(function (el) {
        return el != "" && el != " ";
      }).join(", ");
      results[headers[x]] = tempValue;
    }
  }
  return {"Sharers": results};
}

/**
 * This function parses the ImageID and IsTrue with GameID input. Note that the column of each entry 
 * needs to be changed here, since the sheet structure should stay constant.
 *
 * @param refer to the top of the section
 *
 * @return {Dictionary} a dictionary where the key is the keyword of this function and the value is an 
 *                      array of all images of a specific game with ImageID and isTrue.
 */
function getTruth(sheet, e) {
  // Initializes the location of the columns, GameID, and the field to search
  var imageIDCol = 1 - 1;
  var isTrueCol = 6 - 1;
  var gameIDCol = 2 - 1;
  var gameID = parseInt(e.parameter["GameID"]);
  
  return {"Truth": sheetQuery(gameIDCol, gameID, [imageIDCol, isTrueCol], sheet)};
}



/*******************
* Helper Functions *
********************/
/**
 * This is a helper function that filters the sheet with a condition on one of the column, and is capable of 
 * recording multiple columns of information for each matching row.
 * 
 * @param {int}            queryCol : the ARRAY INDEX of the column to look for
 * @param {queryCol.type}  queryVal : the actual value of the entry to filter for
 * @param {Array}          valCols  : the ARRAY INDEX of the values to record and return
 * @param {Sheet}          sheet    : Google Spreadsheet Service's sheet to be searched
 *
 * @return {Array} An array with all matching entries with each entry recorded as a dictionary.
 *                 e.g. [{"ImageID": 1,  "DownloadID": abc}, {"ImageID": 2,  "DownloadID": def}]
 *                 If there is only one thing to return for each entry, it gets rid of the dictioanry.
 *                 e.g. [1, 2, 3, 4]
 */
function sheetQuery(queryCol, queryVal, valCols, sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var searchField = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var results = [];
  
  // Searches the whole sheet for any images that matches the GameID requested
  for (var i = 0; i < searchField.length; i++) {
    var result = {};
    var row = searchField[i];
    if (row[queryCol] == queryVal) {
      if (valCols.length == 1) {
        result = row[valCols[0]];
      } else {
        for (var j = 0; j < valCols.length; j++) {
          result[headers[valCols[j]]] = row[valCols[j]];
        }
      }
      results.push(result);
    }
  }
  return results;
}

/**
 * This is a helper function that checks if an array only has empty strings
 */
function isArrayEmpty(arr) {
  var empty = true;
  if (arr.length == 0) {
    return true;
  } else {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === "") {
        continue;
      } else {
        empty = false;
      }
    }
    return empty;
  }
}

/**
 * This helper function helps find the name correponding to the provided UserID. This function is set up
 * to better manage the problem with rearrangements of columns in Participants. Current name column = 4.
 */
function getName(userID, ss){
  return sheetQuery(0, userID, [4], ss.getSheetByName("Participants"))[0];
}

/**
 * This is a helper function that finds the type of information that gets diplayed, returns an empty array if
 * nothing was set to display
 */
function findDisplayType(ss, gameID, round){
  const r1reference = ['name', 'num']
  const r2reference = ['sharers', 'beliefs', 'nonsharers', 'num_sharers', 'num_nonsharers']
  
  var sheet = ss.getSheetByName('GameSetting');
  var games = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
  for (var i = 0; i < games.length; i++) {
    if (games[i] == gameID) {
      if (round == 1) {
        var setting = sheet.getRange(i + 1, 2, i + 1, r1reference.length).getValues()[0];
        return r1reference.filter((item, i) => setting[i]);
      } else if (round == 2) {
        var setting = sheet.getRange(i + 1, 4, i + 1, r2reference.length).getValues()[0];
        return r2reference.filter((item, i) => setting[i]);
      }
    }
  }
}

/**
 * The following functions are a series of parsing functions which are capable of compiling different forms of
 * data from the same column.
 */
function parseSharers(arr) {
  var result = arr.map(function(val){
    if (val != '') {
      var full = val.split(', ');
      var shared = full[0];
      var info = full[1];
      if (shared == 'Yes') {
        return info.split(': ')[0]
      }
    }
  })
  
  result = result.filter(function (el) {
    return el != "" && el != null;
  }).join(", ");
  return result + " shared this story with you.";
}

function parseBeliefs(arr) {
  var result = arr.map(function(val){
    return val.split(', ')[1]
  })
  
  result = result.filter(function (el) {
    return el != "" && el != null;
  }).join(", ");
  return "On the scale of 1 to 5, people's beliefs are: " + result;
}

function parseNonsharers(arr) {
  var result = arr.map(function (val) {
    if (val != '') {
      var full = val.split(', ');
      var shared = full[0]
      var info = full[1]
      if (shared == 'No') {
        return info.split(': ')[0]
      }
    }
  })
  
  result = result.filter(function (el) {
    return el != "" && el != null;
  }).join(", ");
  return result + " chose not to share this story with you.";
}

function parseNumSharers(arr) {
  var result = arr.reduce(function(prev, curr) {
    var shared = curr.split(', ')[0];
    if (shared == 'Yes'){
      return prev + 1;
    } else {
      return prev;
    }
  }, 0)
  
  return result.toString() + ' people shared this with you.';
}

function parseNumNonsharers(arr) {
  var result = arr.reduce(function(prev, curr) {
    var shared = curr.split(', ')[0];
    if (shared == 'No'){
      return prev + 1;
    } else {
      return prev;
    }
  }, 0)
  
  return result.toString() + ' people chose not to share this with you.';
}
/* End of Parsing Functions */
