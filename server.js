var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));

// set the view engine to ejs
app.set('view engine', 'ejs');

// pages

app.get('/', function(request, response) {
  response.render('../views/index.html.ejs');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
