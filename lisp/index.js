var GLOBAL_SYMBOLS = {}
var PERM_SYMBOLS = {}
var RESERVED_SYMBOLS = "[]{}@:#`~'"

/*
 * number
 * string with #" and ##
 * () is nil
 * (foo . bar)
 * (foo bar) => (foo . (bar . ()))
 * symbols
 * ;comment
 *
 * +=/*%
 *
 * list cons quote eval fn def if set
 */

//number, string, nil all eval to theirselves


//TODO: add getNextChar() function
//      this can abstract away the line and column tracking
var eval = (str, startLine = 0, startCol = 0) => {
  var line = startLine;
  var col = startCol

  for (var i = 1; i < str.length; ++i) {
    ++col;
    switch (str[i]) {
      case "\n":
        ++line;
        continue;

      case " ":
      case ",":
        continue;

      case ";":
        while (str[i] !== "\n" && i < str.length) {
          ++i;
          if (i >= str.length) {
            //TODO: need to add columns and lines
            //show from start of form to end of form.
            throw Error("Syntax Error: Form doesn't Terminate")
          }
        }

      case "(":
        //new list to evaluate. recurse and start again at new value
        continue;

      case ")":
        //return final value
        return "TODO: return the final value(s) of the form"

      //TODO: need lookahead for dotted lists
      //
      //TODO: need to call if applicable


    }
  }

}
