var classNames = (...args) => {
  var classes = [];
  for (var i = 0; i < args.length; i += 1) {
    var argType = typeof args[i];
    if (argType === 'string' || argType === 'number') {
      classes.push(String(args[i]));
    } else if (Array.isArray(args[i])) {
      classes.push(classNames(...args[i]));
    } else if (argType === 'object') {
      Object.keys(args[i]).forEach(key =>
        args[i][key] ? classes.push(key) : undefined,
      ); //eslint-disable-line
    }
  }
  return classes.join(' ');
};
export default classNames;
