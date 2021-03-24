console.log('running background.js');

chrome.runtime.onConnect.addListener(port => {});

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		console.log("This is a first install!");
	}else if(details.reason == "update"){
		console.log("update");
	}
});//when oninstall or onupdate call the login ?


// function GetParams(pageUrl) {
// 	if(pageUrl && pageUrl.includes('teacher_dropbox_assignment/grade')) {
// 		const AssignmentId =  pageUrl.substring(pageUrl.lastIndexOf('/') + 1, pageUrl.indexOf('?'));
// 		const studentParamFromUrl = pageUrl.split('student=')[1].toString();
// 		const studentId = studentParamFromUrl.substring(0, studentParamFromUrl.indexOf('&'));
//
// 		return {
// 			NeoId: studentId,
// 			AssignmentId: AssignmentId
// 		};
// 	}
// 	else {
// 	}
// }


// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
// 	if(tab.url && tab.url.includes('teacher_dropbox_assignment/grade') && changeInfo.status === 'complete') {
// 		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
// 			// console.log('tabs',tabs);
// 			// if(tabs[0].id) {
// 			// 	chrome.tabs.executeScript(tabs[0].id, {
// 			// 		file: 'content.js',
// 			// 		runAt: 'document_start'
// 			// 	},() => {console.log('content.js is injected when update page')});
// 			// }
// 		});
// 	}
// });

async function fetchPost(path, data, sendResponse) {
	return new Promise((resolve, reject) => {

		chrome.storage.local.get('token', (result) => {
			const token = result.token;
			data = { ...data, Token: token };
			fetch(`https://admin.stg.nexford.net${path}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			}).then((response) => {
				console.log(response )
				if(!response.ok) {
					alert('Server error in NXU Faculty Helper');
				}
				else {
					sendResponse({message: 'success', success: true });
				}
				resolve();
			})
				.catch(error => {
					console.error('error:', error);
					sendResponse({message: 'success', success: false });
					reject(error);
				});
		});
	});
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!sender) {
		return;
	}
	console.log('message',message.type);
	switch (message.type) {
		default:
			console.error("Unrecognised message: ", message);
			return;

		case "API_TEST": {
			fetchPost('/api/analytics/neo/grading/start', message.data, sendResponse);
			return;
		}

		case "GRADING_START": {
			// this will be passed in via message.data by the caller of chrome.runtime.sendMessage
			const dataTest = { NeoId: "6765294", AssignmentId: "12785489" };
			const dataWebPage = message.data;
			console.log('message.data', dataWebPage, dataTest, typeof dataWebPage.NeoId, typeof dataTest.NeoId);
			fetchPost('/api/analytics/neo/grading/start', dataTest, sendResponse);

			return;
		}

		case "GRADING_END":
			// this will be passed in via message.data
			const data = { NeoId: "6765294", AssignmentId: "12785489" };;

			fetchPost('/api/analytics/neo/grading/end', data, sendResponse);
			return;
	}
});



// (function() {
// 	const tabStorage = {};
// 	const networkFilters = {
// 		urls: [
// 			"https://jsonplaceholder.typicode.com/todos/1"
// 		]
// 	};
//
// 	chrome.webRequest.onBeforeRequest.addListener((details) => {
// 		const { tabId, requestId } = details;
// 		if (!tabStorage.hasOwnProperty(tabId)) {
// 			return;
// 		}
//
// 		tabStorage[tabId].requests[requestId] = {
// 			requestId: requestId,
// 			url: details.url,
// 			startTime: details.timeStamp,
// 			status: 'pending'
// 		};
// 		console.log(tabStorage[tabId].requests[requestId]);
// 	}, networkFilters);
//
// 	chrome.webRequest.onCompleted.addListener((details) => {
// 		const { tabId, requestId } = details;
// 		if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
// 			return;
// 		}
//
// 		const request = tabStorage[tabId].requests[requestId];
//
// 		Object.assign(request, {
// 			endTime: details.timeStamp,
// 			requestDuration: details.timeStamp - request.startTime,
// 			status: 'complete'
// 		});
// 		console.log(tabStorage[tabId].requests[details.requestId]);
// 	}, networkFilters);
//
// 	chrome.webRequest.onErrorOccurred.addListener((details)=> {
// 		const { tabId, requestId } = details;
// 		if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
// 			return;
// 		}
//
// 		const request = tabStorage[tabId].requests[requestId];
// 		Object.assign(request, {
// 			endTime: details.timeStamp,
// 			status: 'error',
// 		});
// 		console.log(tabStorage[tabId].requests[requestId]);
// 	}, networkFilters);
//
// 	chrome.tabs.onActivated.addListener((tab) => {
// 		const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
// 		if (!tabStorage.hasOwnProperty(tabId)) {
// 			tabStorage[tabId] = {
// 				id: tabId,
// 				requests: {},
// 				registerTime: new Date().getTime()
// 			};
// 		}
// 	});
// 	chrome.tabs.onRemoved.addListener((tab) => {
// 		const tabId = tab.tabId;
// 		if (!tabStorage.hasOwnProperty(tabId)) {
// 			return;
// 		}
// 		tabStorage[tabId] = null;
// 	});
// }());
//