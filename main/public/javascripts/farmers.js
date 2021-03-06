var fs = require("fs");
var paymentStatus = require("./paymentStatus.js");
var url = require('url');

var responce = {"farmers": []};
const FILEPATH = "../resources/farmersDetail.json";
const USERFILEPATH = "../resources/user.json";


function farmerDetailsRelatedToFEF(requestPrams, res) {
    fs.readFile(FILEPATH, 'utf8', function (err, data) {
        var details = JSON.parse(data);
        var counter = 0;
        if(Object.keys(requestPrams)[0] === "FEFId") {
            for (var farmer in details.farmers) {
                if (details.farmers[farmer].FEF === requestPrams.FEFId) {
                    responce.farmers[counter++] = details.farmers[farmer];
                }
            }
        }else{
            for (var farmer in details.farmers) {
                if (details.farmers[farmer].doner === requestPrams.userId) {
                    responce.farmers[counter++] = details.farmers[farmer];
                }
            }
        }
        if(responce.farmers.length === 0){
          res.status(404).end();
        }else {
            res.send(responce.farmers).end();
        }
    });
}

function specificFarmerDetails(requestPrams, res) {
    fs.readFile(FILEPATH, 'utf8', function (err, data) {
        var details = JSON.parse(data);
        var counter = 0;
        for (var farmer in details.farmers) {
            if (details.farmers[farmer].farmerId === requestPrams.farmerId) {
                if(!details.farmers[farmer].crop || details.farmers[farmer].crop == 'undefined'){
                    details.farmers[farmer].crop = "rice";
                }if(!details.farmers[farmer].landPhoto || details.farmers[farmer].landPhoto == 'undefined'){
                    details.farmers[farmer].landPhoto = "land2"
                }
                res.send(details.farmers[farmer]).end();
            }
        }
        if(responce.farmers.length === 0){
            res.status(404).end();
        }
    });
}

function allFarmers(res) {
    fs.readFile(FILEPATH, 'utf8', function (err, data) {
        var details = JSON.parse(data);
        if(details.farmers.length === 0){
            res.status(404).end();
        }
        res.send(details.farmers).end();
    });
}

var farmerPresent = function (name, requestPrams) {
    for (var farmer in name.farmers) {
        if (name.farmers[farmer].farmerId === requestPrams.farmerId) {
            return true;
        }
    }
    return false;
};

function checkIfUserHAsAccess(details, requestPrams, res, name) {
    if (isRoleFEF(name, requestPrams)) {
        details.farmers[details.farmers.length] = requestPrams;

        fs.writeFile(FILEPATH, JSON.stringify(details), function (err) {
            if (err) {
                res.status(500).end();
            }
            paymentStatus.add(requestPrams.farmerId);
        });
        res.send(requestPrams).end();
    }
    res.status(401).end();
}

var userPresent = function (name, requestPrams) {
    for (var user in name.users) {
        if (name.users[user].emailId === requestPrams.FEF) {
            return true;
        }
    }
    return false;
};

var isRoleFEF = function (name, requestPrams) {
    for (var user in name.users) {
        if ((name.users[user].emailId === requestPrams.FEF || name.users[user].emailId === requestPrams.FEF) && (name.users[user].role === "FEF" || name.users[user].role === "SA")) {
            return true;
        }
    }
    return false;
};

function checkIfFEFisRegistered(requestPrams, details, res) {
    fs.readFile(USERFILEPATH, 'utf8', function (err, data) {
        var name = JSON.parse(data);
        if (userPresent(name, requestPrams)) {
            checkIfUserHAsAccess(details, requestPrams, res, name);
        }
        res.status(400).end();
    });
}
module.exports = {
    addFarmer: function (req, res) {
        var requestPrams = req.body;
        fs.readFile(FILEPATH, 'utf8', function (err, data) {
            var details = JSON.parse(data);
            if(farmerPresent(details, requestPrams)){
                res.status(409).end();
            }else {
                checkIfFEFisRegistered(requestPrams, details, res);
            }
        });
    },
    getFarmers: function(req, res){
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var requestPrams = req.query;
        if(requestPrams.FEFId || requestPrams.userId){
            farmerDetailsRelatedToFEF(requestPrams, res);
        }else if(requestPrams.farmerId){
            specificFarmerDetails(requestPrams, res);
        } else {
            allFarmers(res)
        }
    },
    update: function (req, res) {
        var requestPrams = req.body;
        fs.readFile(FILEPATH, 'utf8', function (err, data) {
            var details = JSON.parse(data);
            for (var farmer in details.farmers) {
                if (details.farmers[farmer].farmerId === requestPrams.farmerId) {
                    for (var counter in Object.keys(requestPrams)) {
                        var key = Object.keys(requestPrams)[counter];
                        if (!(key === "aadharCard" || key === "idProof" || key === "farmerId"))
                            details.farmers[farmer][key] = requestPrams[key];
                    }
                }
            }
            fs.writeFile(FILEPATH, JSON.stringify(details), function (err) {
                if (err) {
                    res.status(500).end();
                }
                res.status(200).end();
            });
        });
    },
    primium: function (req, res) {
        var requestPrams = req.body;
        fs.readFile(FILEPATH, 'utf8', function (err, data) {
            var details = JSON.parse(data);
            for (var farmer in details.farmers) {
                if (details.farmers[farmer].farmerId === requestPrams.farmerId) {
                        details.farmers[farmer].donor = requestPrams.emailId;
                        paymentStatus.update(requestPrams.farmerId, res);
                }
            }
            fs.writeFile(FILEPATH, JSON.stringify(details), function (err) {
                if (err) {
                    res.status(500).end();
                }
                res.status(200).end()
            });
        });
    }
};