const ERRORS = {
  noError: {type: 200, label: "success"},
  alreadyLoggedIn: {type: 400, label: "Already Logged In"},
  reconnectFailed: {type: 450, label: "Reconnect Failed"},
  invalidLogin: {type: 500, label: "Login Information Incomplete or Invalid"},
  serverLost: {type: 600, label: ""},
  serverUnreachable: {type: 700, label: ""},
  unknownError: {type: 800, label: ""},
  firewallError: {type: 900, label: ""},
};

//(User, Bool, ERRORS) -> JSON
var makeLoginResponse = ({token, userId, node, userType}, valid = true, error = ERRORS.noError) =>
  JSON.stringify({
    name: "LOGINRESP",
    attributes: {
      token, // same token
      userId, // SAVE:
      node, // what lane server we're actually on
      userType, // SAVE: Hardcoded "Buyer" .      (is, BUYER vs SELLER apps to determine which components which to use)

      valid, // login failure sets this to false (check error code to see what happened)
      errorCode: error.type, // handle as it comes: if '400', then override
      error: error.label, // handle as it comes
    },
    attachments: [],
  });

module.exports = {
  ERRORS,
  makeLoginResponse,
};
