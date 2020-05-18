var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.set('view engine', 'ejs');
app.use('/views', express.static('views'));

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/roles', function(req, res) {
    res.sendFile(__dirname + '/views/roles.html');
});

app.get('/', function (req, res) {
    res.render('roles', {
        title: 'RolesTest'
    });
});

app.post('/roles', urlencodedParser, function(req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    res.sendFile(__dirname + '/views/roles.html', { data: req.body});
});

app.listen(3000);