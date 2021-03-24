console.log('content script starting');

function GetParams(pageUrl) { //AssignmentId  and studentId I get from the url
	if(pageUrl && pageUrl.includes('teacher_dropbox_assignment/grade' && 'to_grade=true')) {
		const AssignmentId =  pageUrl.substring(pageUrl.lastIndexOf('/') + 1, pageUrl.indexOf('?'));
		const studentParamFromUrl = pageUrl.split('student=')[1].toString();
		const studentId = studentParamFromUrl.substring(0, studentParamFromUrl.indexOf('&'));
		console.log('studentId, AssigmentId', studentId ,AssignmentId);
		return {
			NeoId: studentId,
			AssigmentId: AssignmentId
		};
	}
	else {
		console.log('cant get params');
	}
}

//check if grader on grading page and dont have token show message
chrome.storage.local.get('token', (result) => {
	const pageUrl = location.href;
	const data = GetParams(location.href);
	if (pageUrl && pageUrl.includes('teacher_dropbox_assignment/grade' && 'to_grade=true')) {
		if(result.token && result.token.length > 1) {
			chrome.runtime.sendMessage( { type: "GRADING_START" , data } , response => console.log('GRADING_START'));
		}
		else {
			alert('please login in extension before grading');
		}
	}
});

window.addEventListener('click', function (e) {
	const data = GetParams(location.href);

	if (e.target.tagName == "A" && e.target.classList.toString().indexOf('save-thread-comment') > -1) {
		chrome.runtime.sendMessage( { type: "GRADING_END" , data } , () => console.log('GRADING_END message success'));
		console.log('GRADING_END: clicked "comment" button');
	}
	else if (e.target.tagName == "A" && e.target.name == 'commit' && e.target.classList.toString().indexOf('disabled') === -1) {
		chrome.runtime.sendMessage( { type: "GRADING_END" , data } , () => console.log('GRADING_END message success'));
		console.log('GRADING_END: clicked "save" botton');
	}

}, false);



// //fix error Extension context invalidated
// var port;
// // Attempt to reconnect
// var reconnectToExtension = function () {
// 	// Reset port
// 	port = null;
// 	// Attempt to reconnect after 1 second
// 	setTimeout(connectToExtension, 1000 * 1);
// };
// // Attempt to connect
// var connectToExtension = function () {
// 	// Make the connection
// 	port = chrome.runtime.connect({name: "my-port"});
// 	// When extension is upgraded or disabled and renabled, the content scripts
// 	// will still be injected, so we have to reconnect them.
// 	// We listen for an onDisconnect event, and then wait for a second before
// 	// trying to connect again. Becuase chrome.runtime.connect fires an onDisconnect
// 	// event if it does not connect, an unsuccessful connection should trigger
// 	// another attempt, 1 second later.
// 	port.onDisconnect.addListener(reconnectToExtension);
//
// };
// // Connect for the first time
// connectToExtension();





