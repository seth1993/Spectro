var express = require('express');
var app = require('express')();
var logger = require('morgan');
var template = require('jade').compileFile(__dirname + '/source/templates/homepage.jade');
var serialport = require('serialport');
//var serialPorts = require('./serialport.js');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/fonts'));

//This is to retrieve HomePage
app.get('/', function (req, res, next) {
  try {
    var html = template({ title: 'Home' , dat: "Hello"})
    res.send(html)
  } catch (e) {
    next(e)
  }
})

//Serial Ports
var openPorts = connect();

//This sets up Server Port
server.listen(3000, function () {
  console.log('Listening on http://localhost:' + (3000))
});


function sendData(json) {
  io.on('connection', function (socket){
    socket.emit('client', json);//Send data to user
    socket.on('server', function(data){//Recieving data from user
      console.log(data);
    });
  });
}


function decifierData(data) {
  var incomingData = new Object();
  data = data.toString();
  var arrayData = data.split('@', 3);//Splits at @ symbol, limit 3 splits
  if(arrayData[0]){
      incomingData.unit = arrayData[0];
  } if(arrayData[1]){
      incomingData.command = arrayData[1];
  } if(arrayData[2]){
      incomingData.message = arrayData[2];
  } if(incomingData){
    sendData(incomingData);
  }
}

//I want to send data to client for serial port details


function connect (name, baudRate, dataBits, stopBits, parity, bufferSize) {
      
      //Closes connection & reopens with correct properties
      if(name != 'none' && name != undefined){
          name.close();
          console.log("Closed connection: " + name);
          var portNew = new serialport(port.comName, {baudRate: baudRate, dataBits: dataBits, stopBits: stopBits, parity: parity, bufferSize: bufferSize, parser: serialport.parsers.readline('\n')} ,function (err) {
              if (err) {
                  return console.log('Error: ', err.message);
              }
              portNew.write('TURN ON', function(err) {
                  if (err) {
                      return console.log('Error on write: ', err.message);
                  }
                  console.log('First Packet Sent(TURN ON)');
              });
              portNew.on('data', function (data) {
                  console.log(data);
                  decifierData(data);
              });
          });
      }

      //Sets Defaults
      if(baudRate === undefined){
          baudRate = 9600;
      } 
      if(dataBits === undefined){
          dataBits = 8;
      }
      if(stopBits === undefined){
          stopBits = 1;
      }
      if(parity === undefined){
          parity = "none";
      }
      if(bufferSize === undefined){
          bufferSize = 65536;
      }


      var portsOpen = ["one","two"];


      //Finds available USB connections. Specifically FRDM Board & XBee serial ports
      serialport.list(function (err, ports) {
          ports.forEach(function(port) {

              console.log("Found port info:" + port.comName + "     " + port.pnpId + "     " + port.manufacturer);

              if(port.manufacturer === 'MBED' || port.manufacturer === 'mbed'){//If Freedom Board
                  console.log("Found Freedom Board");

                  var portOne = new serialport(port.comName, {baudRate: baudRate, dataBits: dataBits, stopBits: stopBits, parity: parity, bufferSize: bufferSize, parser: serialport.parsers.readline('\n')} ,function (err) {
                      if (err) {
                          return console.log('Error: ', err.message);
                      }
                      portOne.write('TURN ON', function(err) {
                          if (err) {
                              return console.log('Error on write: ', err.message);
                          }
                          console.log('mbed - First Packet Sent');
                      });
                      portOne.on('data', function (data) {
                          console.log(data);
                          decifierData(data);
                      });
                  });
                  portsOpen[1] = port.comName;

              } if(port.manufacturer === 'FTDI' || port.manufacturer === 'ftdi'){//If XBee dongle or shield
                  console.log("Found XBee Unit");

                  var portTwo = new serialport(port.comName, {baudRate: 230400, dataBits: dataBits, stopBits: stopBits, parity: parity, bufferSize: bufferSize, parser: serialport.parsers.readline('\n')} ,function (err) {
                      if (err) {
                          return console.log('Error: ', err.message);
                      }
                      portTwo.write('TURN ON', function(err) {
                          if (err) {
                              return console.log('Error on write: ', err.message);
                          }
                          console.log('XBEE - First Packet Sent');
                      });
                      portTwo.on('data', function (data) {
                          console.log(data);
                          decifierData(data);
                      });
                  });
                  portsOpen[2] = port.comName;
              }

          });
      });

      return portsOpen;

  }






































