console.log('running background.js');

chrome.runtime.onConnect.addListener(port => {});

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		console.log("This is a first install!");
	}else if(details.reason == "update"){
		console.log("update");
	}
});//when oninstall or onupdate call the login ?

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(tab.url && tab.url.includes('teacher_dropbox_assignment/grade') && changeInfo.status === 'complete') {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			// for(var i= 0; i < tabs.length; i++) {
			// 	if (tabs.length && tabs[0].id) {
			// 		chrome.tabs.executeScript(tabs[0].id, {
			// 			file: 'content.js',
			// 			runAt: 'document_end'
			// 		}, () => {
			// 			// console.log('content.js is injected when update page')
			// 		});
			// 	}
			// }
		});
	}
});
chrome.storage.local.get('token', (result) => {
	console.log('token', result.token);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!sender) {
		return;
	}

	switch (message.type) {
		case "API_TEST": {
			chrome.storage.local.get('token', (result) => {
				console.log( message.type,result.token, message.token,message.data);

				fetch("https://admin.qa.nexford.net/api/neo/grading/start", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${result.token}`,
					},
					body: JSON.stringify(message.data),
				}).then(() => {
					console.log('success response test');
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
			try {
				chrome.storage.local.get('token', (result) => {
					console.log( message.type, result.token, message.data, );
					fetch("https://admin.qa.nexford.net/api/neo/grading/end", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${result.token}`,
						},
						body: JSON.stringify(message.data),
					}).then(() => {
						console.log('success response end');
						sendResponse({message: 'success', success: true });
					})
						.catch(error => {
							console.error('error:', error);
							sendResponse({message: 'success', success: false });
						});
				});
			} catch (error) {
				console.error('Error:', error)
			}
			break;
		case "GRADING_START":
			try {
				chrome.storage.local.get('token', (result) => {
					console.log('sender.url', sender.url, message.data );
					console.log( message.type);
					fetch("https://admin.qa.nexford.net/api/neo/grading/start", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${result.token}`,
						},
						body: JSON.stringify(message.data),
					}).then(() => {
						console.log('success response start grading');
						sendResponse({message: 'success', success: true });
					})
						.catch(error => {
							console.error('error:', error);
							sendResponse({message: 'success', success: false });
						});
				});

			}
			catch (error) {
				console.error('Error:', error)
			}
			break;
		default:
			console.error("Unrecognised message: ", message);
			break;
	}
});
