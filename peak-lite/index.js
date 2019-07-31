var express = require('express');
var path = require('path');

var app = express();

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/assets/index.html'));
});

app.listen(3000, () => console.log('listening on port 3000'));
