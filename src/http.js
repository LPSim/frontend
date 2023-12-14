function getBaseFunc(getURL, successFunc, checkFunc, failFunc) {
  // success: receives a parsed JSON object.
  // check: receives a response object, if check passed, return object.
  // fail: receives an error object.
  fetch(getURL)
  .then(response => {
    return checkFunc(response);
  })
  .then(data => {
    successFunc(data);
  })
  .catch(error => {
    failFunc(error);
  });
}

function postBaseFunc(postURL, data, successFunc, checkFunc, failFunc) {
      fetch(postURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        return checkFunc(response);
      })
      .then(data => {
        successFunc(data);
      })
      .catch(error => {
        failFunc(error);
      });
}

function getPatch(serverURL, successFunc, checkFunc, failFunc) {
  let patch_url = serverURL + '/patch';
  getBaseFunc(patch_url, successFunc, checkFunc, failFunc);
}

function getDeckCodeData(serverURL, successFunc, checkFunc, failFunc) {
  let deck_code_url = serverURL + '/deck_code_data';
  getBaseFunc(deck_code_url, successFunc, checkFunc, failFunc);
}

function getVersion(serverURL, successFunc, checkFunc, failFunc) {
  let version_url = serverURL + '/version';
  getBaseFunc(version_url, successFunc, checkFunc, failFunc);
}

function postRespond(serverURL, data, successFunc, checkFunc, failFunc) {
  let respond_url = serverURL + '/respond';
  postBaseFunc(respond_url, data, successFunc, checkFunc, failFunc);
}

function getState(serverURL, mode, nextIdx, playerIdx, uuid, successFunc, checkFunc, failFunc) {
  let state_url = serverURL + '/state/' + mode + '/' + nextIdx + '/' + playerIdx;
  if (uuid) state_url += '?uuid=' + uuid;
  getBaseFunc(state_url, successFunc, checkFunc, failFunc)
}

function getRequest(serverURL, playerIdx, successFunc, checkFunc, failFunc) {
  let request_url = serverURL + '/request/' + playerIdx;
  getBaseFunc(request_url, successFunc, checkFunc, failFunc)
}

function getDecks(serverURL, successFunc, checkFunc, failFunc) {
  let version_url = serverURL + '/decks';
  getBaseFunc(version_url, successFunc, checkFunc, failFunc);
}

function postReset(serverURL, data, successFunc, checkFunc, failFunc) {
  let respond_url = serverURL + '/reset';
  postBaseFunc(respond_url, data, successFunc, checkFunc, failFunc);
}

export default {
  getBaseFunc,
  postBaseFunc,
  getPatch,
  getDeckCodeData,
  getVersion,
  postRespond,
  getState,
  getRequest,
  getDecks,
  postReset,
}
