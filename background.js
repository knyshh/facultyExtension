console.log('running background.js');

chrome.runtime.onConnect.addListener(port => {});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(tab.url && tab.url.includes('teacher_dropbox_assignment/grade') && changeInfo.status === 'complete') {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			// for(var i= 0; i < tabs.length; i++) {
			// 	if (tabs.length && tabs[0].id) {
			// 		chrome.tabs.executeScript(tabs[0].id, {
			// 			file: 'content.js',
			// 			runAt: 'document_start'
			// 		}, () => {
			// 			// console.log('content.js is injected when update page')
			// 		});
			// 	}
			// }
		});
	}
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!sender) {
		return;
	}
	// console.log('message', message, sender, sendResponse, );
	// console.log('sender url',  sender.url);

	switch (message.type) {
		case "API_TEST": {

			chrome.storage.local.get('BearerToken', (result) => {
				console.log('sender.url', sender.url, message.data, message.type,  result.BearerToken);

				fetch("https://admin.qa.nexford.net/api/neo/grading/start", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${result.BearerToken}`,
					},
					body: JSON.stringify(message.data),
				}).then(() => {
					console.log('success response');
					sendResponse({message: 'success', success: true });
				})
					.catch(error => {
						console.error('error:', error);
						sendResponse({message: 'success', success: false });
					});
			});

			return;
		}
		case "GRADING_END":
			console.log('gragind end in bg');
			try {
				 chrome.storage.local.get('BearerToken', (result) => {
					// console.log('chrome.storage.local.gettoken', result);
					// const data = GetParams(sender.url); // get from here studentId and AssignmentId

					// const data = {
					// 	NeoId: 6903876,
					// 	AssignmentId: 18448372
					// }
					// fetch("https://admin.qa.nexford.net/api/neo/grading/end", {
					// 	method: 'POST',
					// 	headers: {
					// 		'Content-Type': 'application/json',
					// 		'Authorization': `Bearer ${result}`,
					// 	},
					// 	body: JSON.stringify(data),
					// }).then(response => response.json())
					// 	.then(json => console.log("json response",json))
					// 	.catch(error => console.error('error:', error));
				});
			} catch (error) {
				console.error('Error:', error)
			}
			break;
		case "GRADING_START":
			//
			break;
		default:
			console.error("Unrecognised message: ", message);
			break;
	}
});


function listenOnExtensionStarted() {
	// Called when the user clicks on the browser action.
	chrome.browserAction.onClicked.addListener(() => {
		// get current active tab
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			// create a new tab with current active tab url
			chrome.tabs.create({url: tabs[0].url}, (tab) => {
				// inject script to new created tab, start tracking javascript
				chrome.tabs.executeScript(tab.id, {
					file: 'content.js',
					runAt: 'document_end'
				})
			})
		})
	})
}

// listenOnExtensionStarted();


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
