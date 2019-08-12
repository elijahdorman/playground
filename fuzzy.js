// Returns true if each character in pattern is found sequentially within str
// TODO: consider building one with varying weights
//      This becomes more important if the algorithm is ever used for
//      small needles in large haystacks (relatively speaking).
var simpleFuzzy = (needle, haystack) => {
  // short-circuit
  if (needle.length === 0) {
    return haystack.length;
  }
  if (haystack.length === 0) {
    return needle.length;
  }

  var needleIndex = 0;
  var haystackIndex = 0;

  while (needleIndex !== needle.length && haystackIndex !== haystack.length) {
    if (
      needle.charAt(needleIndex).toLowerCase() ===
      haystack.charAt(haystackIndex).toLowerCase()
    ) {
      needleIndex += 1;
    }
    haystackIndex += 1;
  }

  if (needleIndex === needle.length) {
    return 0; // low number is better match
  }

  return 1e5; // arbitrary large number
};

var lowestHamming = (needle, haystack) => {
  if (!needle.length) {
    return haystack.length;
  }
  if (!haystack.length) {
    return needle.length;
  }
  // ensure needle is the shortest
  if (needle.length > haystack.length) {
    [needle, haystack] = [haystack, needle];
  }
  var lowestScore = needle.length; // highest possible score
  // calculate each hamming distance
  for (var i = 0; i < haystack.length - needle.length; i += 1) {
    var currentScore = needle.length;
    for (var j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] === needle[j]) {
        currentScore -= 1;
      }
    }
    // TODO: determine match threshold. If threshold is passed
    // slide needle forward and back a position or two to see
    // if any other chars can be accounted for
    if (currentScore < lowestScore) {
      lowestScore = currentScore;
    }
  }
  // handle when needle length is one (log(1) --> 0)
  if (needle.length < 2) {
    return lowestScore;
  }
  return Math.log(lowestScore + 1) / Math.log(needle.length);
};

var min3 = (a, b, c) => {
  if (a < b) {
    return a < c ? a : c;
  }

  return b < c ? b : c;
};

var min2 = (a, b) => (a < b ? a : b);

var damerauLevenshteinFuzzy = (strN, strM) => {
  var i, // column (n)
    j, // row (m)
    cost;
  var old, prev, curr;

  // return when a length is zero
  if (!strN.length) {
    return strM.length;
  }
  if (!strM.length) {
    return strN.length;
  }

  // m is row and is always longer (variable j refers to the row)
  var n = strN.length <= strM.length ? strN : strM;
  var m = strN.length > strM.length ? strN : strM;

  // we assume no word larger than 64? characters with 8-bit arrays
  // instead of creating a huge array, we reuse the three relevant rows
  if (window.ArrayBuffer) {
    old = new Uint8Array(m.length);
    prev = new Uint8Array(m.length);
    curr = new Uint8Array(m.length);
  } else {
    old = new Array(m.length);
    prev = new Array(m.length);
    curr = new Array(m.length);
  }

  // set first row to 0..M for direct comparison substring
  // set to all zeros for substring comparison
  for (j = 0; j < m.length; j += 1) {
    // old[j] = j;//old becomes curr at beginning of loop
    curr[j] = 0; // needs all zeros for 'prev'
  }

  // check for similarity
  // traverse for each column
  for (i = 1; i < n.length; i += 1) {
    // current becomes previous
    // previous becomes old
    // old becomes current
    [prev, old, curr] = [curr, prev, old];

    // traverse for each row
    for (j = 1; j < m.length; j += 1) {
      curr[0] = i; // set default (on the fly since we only keep three rows)

      // set cost to zero if identical else set to one
      cost = n[i - 1] === m[j - 1] ? 0 : 1;

      curr[j] = min3(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost, // substitution
      );

      // transposition (if not in first two rows and actually a transposition)
      if (i > 1 && j > 1 && m[i - 1] === n[j - 2] && m[i - 2] === n[j - 1]) {
        curr[j] = min2(curr[j], old[j - 2] + cost);
      }
    }
  }

  // the final cell holds the direct comparison answer
  // return curr[curr.length - 1];

  // the lowest cell is used for substring
  cost = curr[0]; // reuse variable
  for (i = 1; i < curr.length; i += 1) {
    if (curr[i] < cost) {
      cost = curr[i];
    }
  }

  return cost;
};
