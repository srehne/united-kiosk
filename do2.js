var system = require('system');
var args = require('system').args;
var page = require('webpage').create();
  
/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */

/** page.onResourceRequested = function (request) {
    system.stderr.writeLine('= onResourceRequested()');
    system.stderr.writeLine('  request: ' + JSON.stringify(request, undefined, 4));
};
 
page.onResourceReceived = function(response) {
    system.stderr.writeLine('= onResourceReceived()' );
    system.stderr.writeLine('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
};
 
page.onLoadStarted = function() {
    system.stderr.writeLine('= onLoadStarted()');
    var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
    system.stderr.writeLine('  leaving url: ' + currentUrl);
};
 
page.onLoadFinished = function(status) {
    system.stderr.writeLine('= onLoadFinished()');
    system.stderr.writeLine('  status: ' + status);
};
 
page.onNavigationRequested = function(url, type, willNavigate, main) {
    system.stderr.writeLine('= onNavigationRequested');
    system.stderr.writeLine('  destination_url: ' + url);
    system.stderr.writeLine('  type (cause): ' + type);
    system.stderr.writeLine('  will navigate: ' + willNavigate);
    system.stderr.writeLine('  from page\'s main frame: ' + main);
};
 **/
page.onResourceError = function(resourceError) {
    system.stderr.writeLine('= onResourceError()');
    system.stderr.writeLine('  - unable to load url: "' + resourceError.url + '"');
    system.stderr.writeLine('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};
 
page.onError = function(msg, trace) {
    system.stderr.writeLine('= onError()');
    var msgStack = ['  ERROR: ' + msg];
/**    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    } **/
    system.stderr.writeLine(msgStack.join('\n'));
};


function waitTimer(onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    interval = setInterval(function() {
      if ( (new Date().getTime() - start >= maxtimeOutMillis) ) {
        typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
        clearInterval(interval); //< Stop this interval
      }
    }, 200); //< repeat check every 250ms
};

function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
        // If not time-out yet and condition not yet fulfilled
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
      } else {
        if(!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          //                    console.log("'waitFor()' timeout");
          phantom.exit(1);
        } else {
          // Condition fulfilled (timeout and/or condition is 'true')
          //                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
          clearInterval(interval); //< Stop this interval
        }
      }
    }, 250); //< repeat check every 250ms
};

var myemail = args[1];

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';
page.settings.resourceTimeout = 20000;
page.viewportSize = {
    width: 1024,
    height: 800
};

waitTime = 20000;

page.settings.resourceTimeout = 20000;
var address = "https://helpcenter.united-kiosk.de/hc/de/requests/new";

console.log('STARTING ');

page.open(address, function(status) {
  if (status !== 'success') {
    console.log('<!-- .............. PHANTOM ERROR LOADING PAGE ..............-->');
    console.log(page);
   	phantom.exit(2);
  } else {
	console.log('<!-- .............. Loaded! ..............-->');
 
    waitFor(function(myemail) {
      return page.evaluate(function() {
        var myStr = document.body.innerHTML.toString();
        if( myStr.indexOf('United Kiosk Hilfe') > -1) {
          return true;
        } else {
          return false;
        };
      });
    }, function() {

      var ua = page.evaluate( function(mail) {
        window.document.getElementById( 'request_anonymous_requester_email' ).value = mail;
        window.document.getElementById( 'request_subject' ).value = "Remove all data about soren@rehne.dk from your databases!";
        window.document.getElementById('request_description').value = "Are you tied of my support tickets?\n\nNot as much as I am of your monthly emails!!!\n\nI demand all knowledge of all data in respect to my email address soren@rehne.dk to be removed from your databases.\n\nI have unsubscribed my apple subscription and do NOT want to receive any further emails regarding NEW issues.\n\nYour support department claims that they can't prevent emails to be sent to my email address.\n\nThis is against the law!!\n\nYou are mis-using my data by keep sending me emails!\n\nDon't break the law! REMOVE EVERYTHING NOW!\n\nNote that I will keep submitting these requests until united-kiosk.de no longer breaks the law!\n\nKind Regards\nSøren Rehné\nemail: soren@rehne.dk";
        window.document.getElementsByName('commit')[0].click();
      }, myemail);

      waitFor(function() {
        return page.evaluate(function() {
          var myStr = document.body.innerHTML.toString();
          if(myStr.indexOf('Die Anzahl neuer') > -1 ) {
			return true;
          } else {
	          if(myStr.indexOf('Ihre Anfrage wurde erfolgreich eingereicht.') > -1){
    	        return true;
        	  } else {
            	return false;
	          };
	      };
        });
      }, function() {
          var a = page.render('result.png');
/**	      var ub = page.evaluate( function() {
			var myStr = window.document.body.innerHTML.toString();
			console.log("<!-- .............. myStr = ..............-->\n $myStr\n\n<!----------------------------------->");

			if(myStr.indexOf('Die Anzahl neuer') > -1 ) {
				console.log('<!-- .............. BAD EXIT! ..............-->');
				return(-1)
			} else {
				return(0)
			};
   		  });
   		  if( ub > 0) {
   		  	var b = phantom.exit(-1);
   		  } else {
			console.log('<!-- .............. OK! ..............-->');
   		  	var b = phantom.exit(0);
   		  };
**/			
			var myStr = page.evaluate( function() {
				return window.document.body.innerHTML.toString();
			});
			if(myStr.indexOf('Die Anzahl neuer') > -1 ) {
				console.log('<!-- .............. BAD EXIT! ..............-->');
			 	phantom.exit(1);
			} else {
				console.log('<!-- .............. YEEESSS !! ..............-->');
				phantom.exit(0);
			};

      }, waitTime);
    }, waitTime);
  };
});
