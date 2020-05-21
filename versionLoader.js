/*
 * This code allows us to dynamically load
 * either the ES5 or ESnext version of our
 * codebase depending on user agent string.
 */
 'use strict';
 (function loadSimulcast(fileLoaders) {
  var ua = navigator.userAgent;
  var isEs6 = false;

  function checkVersion(v) {
    var noCount = !v.no ? 0 : v.no.filter(function (no) {
      return ua.indexOf(no) >= 0;
    });
    if (noCount > 0) {
      return false;
    }
    return v.yes.map(function (yes) {
      return [yes, ua.indexOf(yes)];
    }).map(function (ver) {
      return !v.version ? ver : [v.version, ua.indexOf(v.version)];
    }).filter(function (idx) {
      return idx[1] >= 0;
    }).map(function (flt) {
      return parseFloat(ua.slice(flt[0].length + flt[1] + 1));
    }).reduce(function (acc, num) {
      if (num >= v.minVersion) {
        acc = true;
      }
      return acc;
    }, false);
  }

  isEs6 = isEs6 || checkVersion({ yes: ['Chrome', 'Chromium'], minVersion: 60 });
  isEs6 = isEs6 || checkVersion({ yes: ['Firefox'], minVersion: 55 });
  isEs6 = isEs6 || checkVersion({ yes: ['Edge'], minVersion: 15 });
  isEs6 = isEs6 || checkVersion({ yes: ['Safari'], minVersion: 10.1, version: 'Version', no: ['Chrome', 'Chromium'] });

  //load files in order (synchronously)
  var loadFile = function loadFile(files) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = function () {
      if (files.length < 2) {
        return;
      }
      loadFile(files.slice(1)); //recurses across event loop
    };
    script.src = files[0](isEs6).url; //get filename
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  loadFile(fileLoaders);
})([
  function loadApp(isEs6) {
    return {
      url: isEs6 ? './es6app.js' : './es5app.js'
    };
  },
  function loadEnvironment(isEs6) {
    return {
      url: isEs6 ? './es6environment.js' : './es5environment.js'
    };
  },
]);

