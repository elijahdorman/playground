# Websocket workflow

All function calls are calls inside websocket.js
All `socket::whatever` calls are actions.
All status assignments track websocket abstraction internal status

Line breaks are asynch breaks in code flow while comma-separated entries are synchronous execution

ws = websocket instance, mw = middleware instance, sa = saga instance

There's also a websocket login flow diagram in this folder

### Create - workflow

* mw: `socket::makeSocket`
* ws: status=uninitialized
* do connect workflow

### Connect - workflow

* ws: connect(), `socket::connect--pending`, make connect() timeout, `status=connecting`
* ws: onOpen(), `socket::connect-success`, `socket::login` (or relogin), clearQueue() (if relogin), `status=connected`
* do login or relogin workflow

### Login - workflow

* sa: sendLogin, sendData(), `status=login`
* sa: receiveLoginSuccess, setLoggedIn(), doQueue(), `status=loggedIn`
* sa: sendUserInfo, sendData(),
* normal run time here

### Relogin - workflow

* sa: sendRelogin, sendData(), `status=relogin`
* sa: receiveReloginSuccess, setLoggedIn(), doQueue(), `status=loggedIn`
* sa: sendUserInfo, sendData(),
* normal run time here with onMessage() sending `socket::receive--MESSAGE`

### Error - workflow

* ws: onError(), `socket::connect--error`, disconnect(), `status=error`
* do connect workflow

### Logoff - workflow

* sa: sendLogOff, `status=logoff`
* do close workflow

### Close - workflow

* mw: destroySocket, closeSocket()
* ws: onClose(), `socket::disconnect`, `status=closed`
* ws: destroy(), disconnect(), `status=destroyed`

## Auto-close on sending (NOTE: from MDN)

If the data can't be sent
(for example, because it needs to be buffered but the buffer is full),
the socket is closed automatically.

Not sure at this point if it error. I don't think so.

TODO: double check about the error and update

## Error Codes

We may  may desire event codes in the future. Here's a list from MDN

https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes


## Valid Statuses

* "uninitialized"
* "connecting"
* "connected"
* "login"
* "relogin"
* "loggedIn"
* "closed"
* "error"
* "logOff"
* "destroyed"