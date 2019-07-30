var makeFizzBuzz = function * (resultCount = 100, tests = [[3, "fizz"], [5, "buzz"]]) {
  var res, i = 0;

  while (true) {
    i += 1;
    res = tests.reduce((acc, [num, text]) => {
      if (!(i % num)) {
        acc += text;
      }
      return acc;
    }, "");

    if (i > resultCount) {
      break;
    }
    yield res || i;
  }

  return res || i;
}

//now let's use it
for (answer of makeFizzBuzz(200, [[3, "fizz"], [5, "buzz"], [7, "hello"]])) {
  console.log(answer);
}
