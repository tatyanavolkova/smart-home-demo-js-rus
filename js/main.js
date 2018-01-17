var module_addresses = [
	"devices/6lowpan/02124B000C467985", // lamp on the first floor 
	"devices/6lowpan/02124b000c468d07"  // lamp on the second floor
	]

var client;
var message;

var BROKER_ADDRESS = "106.109.128.213"; //if connected by wifi, then it will be 192.168.4.254
var BROKER_PORT = 1884;
var CLIENT_ID = "tatyana";
function start_connection() {
	if(client===undefined) {
		client = new Paho.MQTT.Client(BROKER_ADDRESS, BROKER_PORT, CLIENT_ID);
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;
		client.connect({onSuccess:onConnect});	
	}	
	else
		alert("Connection is already open");
}

function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe(module_address + "/#");
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
	console.log("onConnectionLost:"+responseObject.errorMessage);
  }
};

function onMessageArrived(message) {
  var str = message.payloadString;
  console.log("onMessageArrived:"+str);
  try {
	  obj = JSON.parse(str);
  } 
  catch (e) {
	  console.log("Not a valid JSON: " + str);
  }

  if(obj.data!==undefined) {
	  var sensorData=0;
	  var element_id = "null"
	  if(obj.data.luminocity!==undefined) {
	  	sensorData=obj.data.luminocity
	  }
	  if(obj.status.devEUI!==undefined) {
		if (obj.status.devEUI==module_addresses[0]) //can be refactored
			element_id = "luminocity_string_0";
		else if (obj.status.devEUI==module_addresses[1])
			element_id = "luminocity_string_1";

		if (element_id!="null")			
			document.getElementById(element_id).innerHTML = sensorData;
	  }

	  	 
  }
};


function send_message(destination, text) {
	if(client !== null) {
		var message = new Paho.MQTT.Message(text);
		message.destinationName = destination;
		client.send(message);
		console.log("Sent message " + text + " to " + destination);	
	}
	else	
		alert("Client is not connected!");
}


function ask_luminocity(module_number) {
	if (module_number<length)
		send_message(module_addresses[module_number] + "/mosi/opt3001", "get");
}	


window.onload = function() {
	start_connection();
}

function refresh_all() {
	ask_luminocity(0);
	ask_luminocity(1);
}

