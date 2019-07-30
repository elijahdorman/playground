/* this code allows us to dynamcially load
 * either the ES5 or ESnext version of our
 * codebase depending on user agent string.
 *
 * It also accounts for current usage pattern
 * by logging API calls and then playing them
 * back once the actual library has loaded
 */
function loadOneSearch(onLoad) {
  var ua = navigator.userAgent,
    isEs6 = false;

  function checkVersion(v) {
    var noCount = !v.no ? 0 : v.no.filter(no => ua.indexOf(no) >= 0);
    if (noCount > 0) {
      return false;
    }
    return v.yes
      .map(yes => [yes, ua.indexOf(yes)])
      .map(ver => (!v.version ? ver : [v.version, ua.indexOf(v.version)]))
      .filter(idx => idx[1] >= 0)
      .map(flt => parseFloat(ua.slice(flt[0].length + flt[1] + 1)))
      .reduce((acc, num) => {
        if (num >= v.minVersion) {
          acc = true;
        }
        return acc;
      }, false);
  }

  isEs6 = isEs6 || checkVersion({yes: ['Chrome', 'Chromium'], minVersion: 60});
  isEs6 = isEs6 || checkVersion({yes: ['Firefox'], minVersion: 55});
  isEs6 = isEs6 || checkVersion({yes: ['Edge'], minVersion: 15});
  isEs6 =
    isEs6 ||
    checkVersion({
      yes: ['Safari'],
      minVersion: 10.1,
      version: 'Version',
      no: ['Chrome', 'Chromium'],
    });

  var script = d.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.onload = onLoad;
  script.src = isEs6 ? 'foo.es6.js' : 'foo.es5.js';
  d.getElementsByTagName('head')[0].appendChild(script);
}
