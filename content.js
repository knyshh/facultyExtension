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

///new instance !!!  and new redirect url  ?
// const redirect = 'https://inpncpppbajgklekajknpmmibgdpcnad.chromiumapp.org';

let msalInstanceContent = new msal.PublicClientApplication({
	auth: {
		authority: "https://login.microsoftonline.com/bdf1795a-c7bb-4599-bac9-f8d3335bef69",
		clientId: "22473745-b0f0-43af-98c1-eea2ab47088e",
		redirectUri: "https://inpncpppbajgklekajknpmmibgdpcnad.chromiumapp.org",
		postLogoutRedirectUri: "https://inpncpppbajgklekajknpmmibgdpcnad.chromiumapp.org"
	},
	cache: {
		cacheLocation: "localStorage"
	}
});
console.log('msal', msalInstanceContent);
console.log('msal.getAllAccounts', msalInstanceContent.getAllAccounts()[0]); //undefined

const getBearerToken = async (account) => {
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
				// msalInstance.acquireTokenRedirect(tokenRequest);
				console.log('InteractionRequiredAuthError');
			}
			throw error;
		}
	}
	throw new Error('Not Authenticated');
};

async function sendMessage(account) {
	const token = await getBearerToken(account);
	console.log('test token',token);
}
chrome.storage.local.get('Accounts', function(data) {
	console.log('accounts',data);
	sendMessage(data);
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





