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
    this.balance = 0;
    this.setUser = function(userId) {
        if(this.multi) {
            this.idList.push(userId);
        } else {
            this.userId = userId;
        }
    }
}

var projectId = 0;
var projectList = [];

function Parter(id, projectId, part) {
    this.id = id;
    this.projectId = projectId;
    this.part = part;
}

function Building(name, firmId, square, pricePerMetre) {
    this.name = name;
    this.globalId = projectId++;
    this.id = getFirmById(firmId).projects.length;
    this.firmName = getFirmById(firmId).name;
    this.stage = 0; // -1 - проект отклонен, 0 - проект на утверждении, 1 - проект начат, 2 - вырыт котлован, 3 - заложен фундамент, 4 - построены стены, 5 - построена крыша, 6 - строительство завершено
    this.status = 0; // 0 - идет строительство, 1 - построен
    this.ownerFirmId = firmId;
    this.partersList = [];
    this.square = square;
    this.pricePerMetre = pricePerMetre;
    projectList.push(this);
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
    this.projects = [];
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
//    res.sendFile(__dirname + '/views/roles.html');
    res.render('roles', {
        title: 'RolesTest'
    });
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
 * firmId, objectName, square, pricePerMetre
 */
app.post('/startBuilding', function(req, res) {
    var firm = getFirmById(req.body.firmId);
    firm.projects.push(new Building(req.body.objectName, firm.firmId, req.body.square, req.body.pricePerMetre));
    res.send({success: true});
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
})

app.post('/getFirmById', function(req, res) {
   res.send(getFirmById(req.body.firmId));
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
    this.id = currentContractorRequests.length;
    this.firm = getFirmById(firmId);
    this.materials = {
        material1: materials.material1,
        material2: materials.material2,
        material3: materials.material3
    };
    this.status = 3; // 0 - не рассмотрена, 1 - выдано, 2 - отклонено, 3 - на заполнении (бухгалтера)
    this.price = price;
    currentContractorRequests.push(this);
}

app.post('/setFirmMaterial', function(req, res) {
    var firm = getFirmById(req.body.firmId);
    firm.inventory.take("material" + req.body.idMaterial, req.body.count);
    res.send({success: true});
})

app.post('/materialRequest', function(req, res) {
    new Request(req.body.firmId, req.body, req.body.price);

    res.send({success: true});
});

app.post('/checkRequests', function(req, res) {
    res.send(currentContractorRequests);
});

app.post('/setRequestStatus', function(req, res) {
    var curRequest = currentContractorRequests[req.body.requestId];
    if(req.body.status == 1) {
        if(curRequest.firm.balance < curRequest.price) {
            res.send({error: "У фирмы недостаточно денег"});
        } else {
            curRequest.status = req.body.status;
            curRequest.firm.balance -= Number(curRequest.price);
            mainRoles.contractor.balance += Number(curRequest.price);
            curRequest.firm.inventory.add("material1", curRequest.materials.material1);
            curRequest.firm.inventory.add("material2", curRequest.materials.material2);
            curRequest.firm.inventory.add("material3", curRequest.materials.material3);
            res.send({success: true});
        }
    } else if (req.body.status == 2){
        curRequest.status = req.body.status;
        res.send( {success: true});
    } else if(req.body.status == 0) {
        curRequest.price = req.body.price;
        curRequest.status = req.body.status;
        res.send({success: true});
    }
})

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

app.post('/setProjectStatus', function(req, res) {
    var firm = getFirmById(req.body.firmId);
    firm.projects[req.body.idProject].status = req.body.status;
    res.send({success: true});
})

app.post('/getAllProjects', function(req,res) {
    res.send(projectList);
})

app.post('/buySector', function(req, res) {
    var curFirm = getFirmById(projectList[req.body.globalId].firmId);
    var curProj = projectList[req.body.globalId];
    curFirm.balance += req.body.part * curProj.pricePerMetre;
    curFirm.projects[req.body.projectId].partersList.push(new Parter(req.body.parterId, req.body.projectId, req.body.part));
    res.send({success: true});
})

app.get('/directorScreen', function(req, res){
    res.render('directorScreen');
});

app.get('/builderScreen', function(req, res){
    res.render('builderScreen');
});

app.get('/financerScreen', function(req, res){
    res.render('financerScreen');
});

app.get('/contractorScreen', function(req, res){
    res.render('contractorScreen');
});

app.get('/foremanScreen', function(req, res){
    res.render('foremanScreen');
});

app.get('/customerScreen', function(req, res){
    res.render('customerScreen');
});

app.listen(3000);