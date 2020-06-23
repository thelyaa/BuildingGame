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
var isGameStarted = false;

var firmList = [];
var userList = [];

var mainRoles = {
    customer: new Role("Покупатель"),
    banker: new Role('Банкир'),
    contractor: new Role('Поставщик')
}

/**
 * Класс роли
 * @param name - название роли на русском
 * @param multi - флаг мультироли (могут ли быть назначены несколько человек на нее)
 * @constructor
 */
function Role(name, multi) {
    this.name = name;
    this.userId;
    this.multi = multi;
    this.idList = [];
    this.setUser = function(userId) {
        if(this.multi) {
            this.idList.push(userId);
        } else {
            this.userId = userId;
        }
    }
}

/**
 * Класс фирмы
 * @param name - название фирмы
 * @param directorId - ид директора
 * @constructor
 */
function Firm(name, directorId) {
    this.name = name;
    this.directorId = directorId;
    this.firmId = lastFirmId++;
    this.roles = {
        director: new Role("Директор"),
        foreman: new Role("Прораб"),
        financer: new Role("Бухгалтер"),
        builders: new Role("Строитель", true)
    }
    this.roles.director.setUser(directorId);

    firmList.push(this);
}

/**
 * Генерация айди пользователя
 * @returns {string}
 */
function getLastId() {
    return `${lastId++}`;
}

/**
 * Запрос получения страницы ролей
 */
app.get('/roles', function(req, res) {
    res.sendFile(__dirname + '/views/roles.html');
});

/**
 * Запрос получения главной страницы
 */
app.get('/', function (req, res) {
    res.render('roles', {
        title: 'RolesTest'
    });
});

/**
 * Запрос АПИ
 * Получение айдишника
 */
app.post('/getId', function(req, res){
    res.send(getLastId());
});

function getFirmById(id) {
    return firmList[id];
}

/**
 * Запрос АПИ
 * Установка роли
 */
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
        else {
            res.send({error: "У вас уже есть созданная фирма"});
        }
    } else if(req.body.role !== "director") {
        if(req.body.firmId) {
            if(getFirmById(req.body.firmId).roles[req.body.role].userId) {
                res.send({error: "Кто-то занял эту роль :("});
            } else {

                // redirect to waiting screen
                getFirmById(req.body.firmId).roles[req.body.role].setUser(req.body.userId);
                res.send({success: true});
            }
        } else {
            if(mainRoles[req.body.role].userId) {
                res.send({error: "Кто-то занял эту роль :("});
            } else {

                // redirect to waiting screen
                mainRoles[req.body.role].setUser(req.body.userId);
                res.send({success: true});
            }
        }
    }
    console.log(firmList[0].roles.foreman);
});

app.post('/roles', function(req, res) {
    if (!req.body) return res.sendStatus(400);
    res.sendFile(__dirname + '/views/roles.html', { data: req.body});
});

/**
 * Запрос АПИ
 * Получение списка фирм
 */
app.post('/getFirmList', function(req, res) {
    res.send(firmList);
});

app.post('/checkStatus', function(req, res) {
   res.send({gameStarted: isGameStarted});
});

app.post('/startGame', function(req, res) {
    isGameStarted = true;
});

app.listen(3000);