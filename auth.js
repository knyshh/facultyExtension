console.log('auth');

//chrome.runtime.reload(); TODO: !
// Set the redirect URI to the chromiumapp.com provided by Chromium
const redirectUri = typeof chrome !== "undefined" && chrome.identity ?
	chrome.identity.getRedirectURL() :
	`${window.location.origin}/index.html`;

let msalInstance = new msal.PublicClientApplication({
	auth: {
		authority: "https://login.microsoftonline.com/bdf1795a-c7bb-4599-bac9-f8d3335bef69",
		clientId: "22473745-b0f0-43af-98c1-eea2ab47088e",
		redirectUri,
		postLogoutRedirectUri: redirectUri
	},
	cache: {
		cacheLocation: "localStorage"
	}
});


async function getLoginUrl(request, reject) {
	return new Promise((resolve) => {
		msalInstance.loginRedirect({
			...request,
			onRedirectNavigate: (url) => {
				resolve(url);
				return false;
			}
		}).catch(reject);
	});
}

async function login() {
	document.getElementById("user-block").style.display = "block";
	document.getElementById("username").innerHTML = '...';
	document.getElementById("statusinfo").innerHTML = '...';

	const url = await getLoginUrl();
	const { account } = await launchWebAuthFlow(url);
	document.getElementById("username").innerHTML = `${account.name} (${account.username})`;

	const bearerToken = await getBearerToken();
	console.log('bearer token', bearerToken);

	let getTokenUrl = "https://admin.qa.nexford.net/api/neo/token";
	chrome.storage.local.get('token', (result) => {
		if (result && result.token) {
			getTokenUrl += '/' + result.token;
		}
		fetch(getTokenUrl, { headers: { 'Authorization': `Bearer ${bearerToken}` } })
			.then(response => response.json())
			.then(json => {
				chrome.storage.local.set({ 'token': json.Token }, function() {
					document.getElementById("statusinfo").innerHTML = 'Installation complete';

					// FOR DEBUG ONLY 👇🏻
					const data = { NeoId: "6765294", AssignmentId: "12785489" };
					chrome.runtime.sendMessage({ type: "API_TEST", data });
					// FOR DEBUG ONLY 👆🏻
					console.log('token!!', result.token)

					console.log('new token is set');
				});
			})
			.catch(error => {
				alert(JSON.stringify(error))
			});
	});
}

/**
 * Launch the Chromium web auth UI.
 * @param {*} url AAD url to navigate to.
 * @param {*} interactive Whether or not the flow is interactive
 */
async function launchWebAuthFlow(url) {

	return new Promise((resolve, reject) => {

		chrome.identity.launchWebAuthFlow({
			interactive: true,
			url
		}, (responseUrl) => {
			// Response urls includes a hash (login, acquire token calls)
			if (responseUrl && responseUrl.includes("#")) {
				msalInstance.handleRedirectPromise(`#${responseUrl.split("#")[1]}`)
					.then(result => {
						if (result && result.account) {
							resolve(result);
						} else {
							console.log('not Loading msal ');
							resolve(null);
						}

					}).catch(reject)
			} else {
				// Logout calls
				resolve(null);
			}
		})
	})
}

const getBearerToken = async () => {
	if (msalInstance.getAllAccounts()[0]) {
		const tokenRequest = {
			scopes: [ "api://nxutestadmin/user_impersonation" ], // from admin-ui test and this and this
			account: msalInstance.getAllAccounts()[0]
		};
		try {
			const response = await msalInstance.acquireTokenSilent(tokenRequest);
			chrome.storage.local.set({ 'BearerToken': response.accessToken }, () => {console.log('BearerToken set')});
			return response.accessToken;
		} catch (error) {
			if (error.name === 'InteractionRequiredAuthError') {
				msalInstance.acquireTokenRedirect(tokenRequest);
			}
			chrome.storage.local.remove('BearerToken', function() {});
			throw error;
		}
	}
	throw new Error('Not Authenticated');
};

login();

//TODO:

