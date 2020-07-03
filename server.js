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
    customer: new Role("Покупатель", true),
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
            return this.idList.length;
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
    this.stage = 0; // -1 - проект отклонен, 0 - проект на утверждении, 1 - проект начат, 2 - заложен фундамент, 3 - построены стены, 4 - построена крыша, 5 - строительство завершено, 6 - продано
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
        material3: 0,
        material4: 0,
        material5: 0,
        material6: 0,
        material7: 0,
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
        manager: new Role("Менеджер по продажам", true),
        financer: new Role("Бухгалтер"),
        builders: new Role("Строитель", true),
        driver: new Role("Водитель")
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

var customerList = [];

function Customer(userId) {
    this.userId = userId;
    this.budget = -1;
    this.customerId = customerList.length;

    this.getBudget = function() {
        if(this.budget === -1) {
            this.budget = startCustomerCapital;
        }
        return this.budget;
    }
    customerList.push(this);
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
            res.send({success: true, firmId: new Firm(req.body.firmName, req.body.userId).firmId});
        }
        else {
            res.send({error: "У вас уже есть созданная фирма"});
        }
    } else if(req.body.role === "customer") {
        new Customer(req.body.userId);
        mainRoles[req.body.role].setUser(req.body.userId);
        res.send({success: true});
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

var startCustomerCapital = 5000000;
app.post('/startGame', function(req, res) {
    isGameStarted = true;
    customerList.forEach((item) => {
        item.getBudget();
    });
    if(req.body.customerBudget > 0) {
        startCustomerCapital = req.body.customerBudget;
    }
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
        material3: materials.material3,
        material4: materials.material4,
        material5: materials.material5,
        material6: materials.material6,
        material7: materials.material7,
    };
    this.status = 3; // 0 - не рассмотрена, 1 - одобрено, 2 - отклонено, 3 - на заполнении (бухгалтера), 4 - выдано
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
            res.send({success: true});
        }
    } else if (req.body.status == 2){
        curRequest.status = req.body.status;
        curRequest.firm.inventory.add("material1", curRequest.materials.material1);
        curRequest.firm.inventory.add("material2", curRequest.materials.material2);
        curRequest.firm.inventory.add("material3", curRequest.materials.material3);
        curRequest.firm.inventory.add("material4", curRequest.materials.material4);
        curRequest.firm.inventory.add("material5", curRequest.materials.material5);
        curRequest.firm.inventory.add("material6", curRequest.materials.material6);
        curRequest.firm.inventory.add("material7", curRequest.materials.material7);
        res.send( {success: true});
    } else if(req.body.status == 0) {
        curRequest.price = req.body.price;
        curRequest.status = req.body.status;
        res.send({success: true});
    } else {
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
    currentPrices.material4 = req.body.material4;
    currentPrices.material5 = req.body.material5;
    currentPrices.material6 = req.body.material6;
    currentPrices.material7 = req.body.material7;
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
});

app.post('/getCustomerInfo', function(req, res) {
    res.send(customerList);
});

app.post('/buyProject', function(req, res) {
    var curFirm = getFirmById(projectList[req.body.globalId].ownerFirmId);
    var curProj = projectList[req.body.globalId];
    var curPrice = req.body.price;
    if(customerList[req.body.sellRequestId].isSelled) {
        res.send({error: "Объект уже продан!"});
    } else {
        sellRequestList[req.body.sellRequestId].isSelled = true;
        curProj.selledPrice = curPrice;
        curFirm.balance += Number(curPrice);
        customerList[req.body.customerId].budget -= curPrice;
        curProj.isSelled = true;
        res.send({success: true});
    }
})


var sellRequestList = [];
function SellRequest(customerId, price, objectGlobalId, firm, proj) {
    this.sellRequestId = sellRequestList.length;
    this.customerId = customerId;
    this.price = price;
    this.objectGlobalId = objectGlobalId;
    this.firmName = firm.name;
    this.firmId = firm.firmId;
    this.square = proj.square;
    this.name = proj.name;
    this.status = proj.status;
    sellRequestList.push(this);
}

app.post('/sellObject', function(req, res) {
    var curFirm = getFirmById(projectList[req.body.globalId].ownerFirmId);
    var curProj = projectList[req.body.globalId];
//    console.log(projectList);
//    console.log(req.body.globalId);
    new SellRequest(req.body.customerId, req.body.priceForSell, req.body.globalId, curFirm, curProj);
    res.send({success: true});
})

app.post('/getSellRequests', function(req, res) {
    res.send(sellRequestList);
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

app.get('/managerScreen', function(req, res){
    res.render('managerScreen');
});

app.get('/driverScreen', function(req, res){
    res.render('driverScreen');
});

app.listen(80);