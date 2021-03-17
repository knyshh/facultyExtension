console.log('content script starting');

function GetParams(pageUrl) { //AssignmentId  and studentId I get from the url
	if(pageUrl && pageUrl.includes('teacher_dropbox_assignment/grade')) {
		const AssignmentId =  pageUrl.substring(pageUrl.lastIndexOf('/') + 1, pageUrl.indexOf('?'));
		const studentParamFromUrl = pageUrl.split('student=')[1].toString();
		const studentId = studentParamFromUrl.substring(0, studentParamFromUrl.indexOf('&'));

		const pageInfo = {
			NeoId: studentId,
			AssigmentId: AssignmentId
		};
		return pageInfo;
	}
	else {
		console.log('cant get params');
	}
}
// const dataFromPage = GetParams(location.href);

chrome.storage.local.remove('Grading');

// chrome.storage.local.get('BearerToken', function(data) {
// 	console.log('from local storage token',data.BearerToken);
// });
chrome.storage.local.get('msalInstanceTest', function(data) {
	console.log('msalInstanceTest',data); //its empty
});

///new instance !!!  and new redirect url  ?
const redirect = 'https://inpncpppbajgklekajknpmmibgdpcnad.chromiumapp.org';

let msalInstanceContent = new msal.PublicClientApplication({
	auth: {
		authority: "https://login.microsoftonline.com/bdf1795a-c7bb-4599-bac9-f8d3335bef69",
		clientId: "22473745-b0f0-43af-98c1-eea2ab47088e",
		redirect,
		postLogoutRedirectUri: redirect
	},
	cache: {
		cacheLocation: "localStorage"
	}
});
console.log('msal', msalInstanceContent);
console.log('msal.getAllAccounts', msalInstanceContent.getAllAccounts()[0]); //undefined

const getBearerToken = (account) => {
	if (account) {
		const tokenRequest = {
			scopes: ["api://nxutestadmin/user_impersonation"],
			account: account
		};
		try {
			const response = msalInstanceContent.acquireTokenSilent(tokenRequest);
			return response.accessToken;
		} catch (error) {
			if (error.name === 'InteractionRequiredAuthError') {
				msalInstanceContent.acquireTokenRedirect(tokenRequest);
			}
			throw error;
		}
	}
	throw new Error('Not Authenticated');
};


chrome.storage.local.get('Accounts', function(data) {
	console.log('accounts',data);
	getBearerToken({data});
});

window.addEventListener('click', function (e) {
	if (e.target.tagName == "A" && e.target.classList.toString().indexOf('save-thread-comment') > -1) {
		chrome.storage.local.set({ 'Grading': 'end' }, function() {});
		chrome.runtime.sendMessage( { type: "API_TEST" , data: (GetParams(location.href))} , response => console.log('sendWebMessage success',response));
		console.log('API_TEST: clicked "comment" button');
	}
	else if (e.target.tagName == "A" && e.target.name == 'commit' && e.target.classList.toString().indexOf('disabled') === -1) {

		chrome.storage.local.set({ 'Grading': 'end' }, function() {});
		chrome.runtime.sendMessage( { type: "API_TEST" , data:  (GetParams(location.href))} , response => console.log('sendWebMessage success',response));
		console.log('API_TEST: clicked "save" botton');
	}

}, false);



// const getBearerToken = async () => {
// 	const msalInstance = localStorage.getItem('msalInstanceTest');
// 	chrome.storage.local.get('msalInstanceTest', (result) => {
// 		console.log('result', result)
// 	});
// 	if (msalInstance.getAllAccounts()[0]) {
// 		const tokenRequest = {
// 			scopes: [ "api://nxutestadmin/user_impersonation" ], // from admin-ui test and this and this
// 			account: msalInstance.getAllAccounts()[0]
// 		};
// 		try {
// 			const response = await msalInstance.acquireTokenSilent(tokenRequest);
// 			// chrome.storage.local.set({ 'BearerToken': response.accessToken }, function() {});
// 			// localStorage.setItem('BearerToken', response.accessToken );
// 			return response.accessToken;
// 		} catch (error) {
// 			if (error.name === 'InteractionRequiredAuthError') {
// 				msalInstance.acquireTokenRedirect(tokenRequest);
// 			}
// 			chrome.storage.local.remove('BearerToken', function() {});
// 			throw error;
// 		}
// 	}
// 	throw new Error('Not Authenticated');
// };

async function sendWebMessage(type, data) {
	// console.log('send msg');
	// const token = await getBearerToken();
	// console.log('token', token);
	// chrome.runtime.sendMessage({ type, data, token }, response => console.log('sendWebMessage success',response));
}

// let signedIn = false;
// const accounts = msalInstance.getAllAccounts();
// if (accounts && accounts.length) {
// 	const foo = {
// 		scopes: [ 'api://nxutestadmin/user_impersonation' ],
// 		account: accounts[0]
// 	};
// 	msalInstance.acquireTokenSilent({ foo }).then((res) => {
// 		console.log('Silent Login Success: ', res)
//
// 		// set token in sessionStorage
// 		const { username, name } = res;
// 		// document.getElementById("username").innerHTML = 'acquired silently ' + username;
// 		// document.getElementById("displayname").innerHTML = name;
// 		// document.getElementById("user-block").style.display = "block";
// 		signedIn = true;
// 	})
// 		.catch((err) => console.log(err))
// }


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





