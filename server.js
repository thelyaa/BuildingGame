var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");

var app = express();
app.set('view engine', 'ejs');
app.use('/views', express.static('views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var lastId = 0;
var lastFirmId = 0;

var firmList = [];
var userList = [];

function Firm(name, directorId) {
    this.name = name;
    this.directorId = directorId;
    this.firmId = lastFirmId++;
    firmList.push(this);
}


function getLastId() {
    return `${lastId++}`;
}

app.get('/roles', function(req, res) {
    res.sendFile(__dirname + '/views/roles.html');
});

app.get('/', function (req, res) {
    res.render('roles', {
        title: 'RolesTest'
    });
});

app.post('/getId', function(req, res){
    res.send(getLastId());
});

app.post('/setRole', function(req, res){
    console.log(req.body);
    userList[req.body.userId] = req.body.role;
    if(req.body.role === "director" && req.body.firmName !== null) {
        var flag = false;
        firmList.forEach(function(item) {
            if (item.directorId === req.body.userId)
                flag = true;
                
        });
        if (!flag) new Firm(req.body.firmName, req.body.userId);
    }
    console.log(firmList);
    console.log(userList)
});

app.post('/roles', function(req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    res.sendFile(__dirname + '/views/roles.html', { data: req.body});
});

app.post('/getFirmList', function(req, res) {
    res.send(firmList);
    console.log(firmList);
});

app.listen(3000);