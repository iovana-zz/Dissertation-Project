var express = require('express');
var app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.send('Hello World');
})

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});