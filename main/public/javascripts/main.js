var express = require('express');
var app = express();
var cors = require("cors");
var bodyParser = require('body-parser');
var user = require("./user.js");
var farmers = require("./farmers.js");
var faq = require("./faq.js");
var paymentStatus = require("./paymentStatus.js");

app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', function (req, res) {
    user.login(req, res);
});

app.post('/api/register', function (req, res) {
    user.register(req, res);
});

app.post('/api/farmer', function (req, res) {
    farmers.addFarmer(req, res);
});

app.get('/api/farmer', function(req, res){
    farmers.getFarmers(req, res);
});

app.get('/api/faq', function (req, res) {
    faq.faqs(req, res);
});

app.post('/api/getPaymentStatus', function(req, res){
    paymentStatus.getStatus(req, res);
});

app.post('/api/updateFarmer', function(req, res){
   farmers.update(req, res);
});

app.post('/api/pay', function(req, res){
   farmers.primium(req, res);
});

app.post('/api/getPhoto', function(request, responce){
   var requestParams = request.body;
    console.log(requestParams);
    responce.sendFile(__dirname + "/images/" + requestParams.urlName + ".jpg");
});

app.get('/api/getPhoto', function(request, responce){
   var requestParams = request.query;
   // console.log(requestParams);
    responce.sendFile(__dirname + "/images/" + requestParams.urlName + ".jpg");
});

var server = app.listen(8081,  function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("app listening at http://%s:%s", host, port)

});
