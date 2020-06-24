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

var SETTINGS = {
    DEFAULT_FIRM_CAPITAL: 100000,
}

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

function Inventory() {
    this.materialList = {
        material1: 0,
        material2: 0,
        material3: 0
    }

    this.add = function(name, count) {
        this.materialList[name] += Number(count);
    }

    this.take = function(name, count) {
        if(this.materialList[name] < count) return "Недостаточно материалов";
        else this.materialList[name] -= Number(count);
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
    this.debt = 0;
    this.balance = SETTINGS.DEFAULT_FIRM_CAPITAL;
    this.inventory = new Inventory();
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
    userList[req.body.userId] = req.body.role;
    if(req.body.role === "director" && req.body.firmName !== null) {
        var flag = false;
        firmList.forEach(function(item) {
            if (item.directorId === req.body.userId)
                flag = true;
        });
        if (!flag) {
            new Firm(req.body.firmName, req.body.userId);
            res.send({success: true});
        }
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

app.get('/waitingRoom', function (req, res) {
    res.render('waitingRoom', {
        title: 'Ожидание'
    });
});

app.post('/checkStatus', function(req, res) {
   res.send({gameStarted: isGameStarted});
});

app.post('/startGame', function(req, res) {
    isGameStarted = true;
});

app.get('/bankerScreen', function(req, res){
    res.render('bankerScreen', {
        title: 'банкир'
    });
});

app.post('/giveMoneyToFirm', function(req, res) {
    var firm = getFirmById(req.body.firmId);
    firm.debt += Number(req.body.value);
    firm.balance += Number(req.body.value);
});

app.post('/getFirmByDirectorId', function(req, res) {
    firmList.forEach(function(item) {
        if (item.directorId == req.body.userId) {
            res.send(item);
        }
    });
});

var currentContractorRequests = [];

function Request(firmId, materials, price) {
    this.firm = getFirmById(firmId);
    this.materials = {
        material1: materials.material1,
        material2: materials.material2,
        material3: materials.material3
    };
    this.status = 0; // 0 - не выдано, 1 - выдано
    this.price = price;
    currentContractorRequests.push(this);
}

app.post('/materialRequest', function(req, res) {
    new Request(req.body.firmId, req.body.request, req.body.price);
    res.send({success: true});
});

app.post('/checkRequests', function(req, res) {
    res.send(currentContractorRequests);
});

var currentPrices = {};

app.post('/setPrices', function(req,res) {
    console.log(req.body);
    currentPrices.material1 = req.body.material1;
    currentPrices.material2 = req.body.material2;
    currentPrices.material3 = req.body.material3;
    res.send({success: true});
})

app.post('/checkPrices', function(req, res) {
    console.log(currentPrices);
    res.send(currentPrices);
})

app.get('/directorScreen', function(req, res){
    res.render('directorScreen');
});

app.get('/contractorScreen', function(req, res){
    res.render('contractorScreen');
});

app.listen(3000);