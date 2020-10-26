uid = ""
colors = {}
users = []
var ws

const CONTEXT_NONE = 0
const CONTEXT_CONNECT = 1
const CONTEXT_RUNNING = 2
var ctxt = CONTEXT_NONE

var ws;

$(function() {
	
	$("#connectForm").submit(connect)
	$("#msgForm").submit(sendMsg)
	$("#main").hide()

});

function update_users() {
	var ul = $("#users")
	ul.html("")
	for(var i in users) {
		var t_uid = users[i];
		ul.append("<li style='color:"+uidColor(t_uid)+"'>"+t_uid+"</li>");
	}
}

function postMsg(uid, text) {
	$("#msgs").append("<div><span style='color:"+uidColor(uid)+"; width:20px;'>" + uid + ":   </span><span>" + text + "</span></div>");
}

function connect(event) {
	event.preventDefault();

	var ip = "wss://" + document.domain + ":5000";//$("#serverIP").val(); "ws://localhost:5000";
	ws = createWebsocket(ip);
	uid = $("#connectUID").val();
	ctxt = CONTEXT_CONNECT;

	ws.onopen = function(event) {
		$("#serverIndicator").html(uid + " @ " + ip);
		ws.send(JSON.stringify({
			msg_type:	"hello",
			uid:		uid
		}));
	};

	window.onbeforeunload = function() {
		ws.close();
	};
}

function createWebsocket(ip) {
	tws = new WebSocket(ip);
	tws.onmessage = handleMessage
	return tws
}

function handleMessage(event) {
	const payload = JSON.parse(event.data);
	const msg_type = payload["msg_type"];
	if(ctxt == CONTEXT_CONNECT) {
		console.assert(msg_type == "status");
		const status = payload["status"];
		if(status == 0) {
			ctxt = CONTEXT_RUNNING;
			$("#connectRow").remove();
			$("#main").show();
			postMsg("Server", "You joined");
		} else {
			console.log("ALARM: "+status);
		}
	} else if(ctxt == CONTEXT_RUNNING) {
		if(msg_type == "user_list") {
			users = payload["user_list"];
			update_users();
		} else if(msg_type == "enter") {
			users.push(payload["uid"]);
			update_users();
			postMsg("Server", payload["uid"] + " joined");
		} else if(msg_type == "leave") {
			users = users.filter(d => d != payload["uid"]);
			update_users();
			postMsg("Server", payload["uid"] + " left");
		} else if(msg_type == "msg") {
			postMsg(payload["uid"], payload["msg"]);
		} else {
			postMsg("misc", event.data);
		}
	} else {
		console.log("Undefined context")
	}
}

function sendMsg(event) {
	event.preventDefault();
	
	const input = $("#msgInput").val()
	if(input !="") {
		const payload = JSON.stringify({
			msg_type:	"msg",
			uid:		uid,
			msg:		input
		});
		ws.send(payload);
		$("#msgInput").val("");
		postMsg(uid, input);
	}
}

function getRandomColor() {
  var letters = '0123456789ABCD';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 14)];
  }
  return color;
}

function uidColor(uid) {
	if(!(uid in colors)) {
		colors[uid] = getRandomColor();
	}
	return colors[uid];
}
