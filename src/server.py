import asyncio
import websockets
import json
import random
from enum import Enum
import ssl

conns = dict()

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("./ssl/certs/cert.crt", "./ssl/private/cert.key")

print("wasd")

class Status(Enum):
	OK = 0
	BAD_REQUEST = 1
	NAME_TAKEN = 2

def generate_uid():
	alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$!?"
	n = 8
	return "".join(random.choices(alphabet, k=n))
	
async def send(uid, msg):
	try:
		await conns[uid].send(msg)
	except websockets.exceptions.ConnectionClosed:
		await close_comm(uid)
	
async def broadcast(uid, msg):
	for key in conns:
		if key != uid:
			await send(key, msg)
	
async def broadcast_enter(uid):
	msg = json.dumps({
		"msg_type": "enter",
		"uid":		uid,
	})
	await broadcast(uid, msg)
	
async def broadcast_leave(uid):
	msg = json.dumps({
		"msg_type": "leave",
		"uid":		uid,
	})
	await broadcast(uid, msg)
	
async def send_user_list(uid):
	msg = json.dumps({
		"msg_type":		"user_list",
		"user_list":	[key for key in conns]
	})
	await send(uid, msg)
	
async def respond(ws, status):
	msg = json.dumps({
		"msg_type":	"status",
		"status":	status.value,
	})
	await ws.send(msg)
	
async def close_comm(uid):
	if uid != "" and uid in conns:
		await conns[uid].close()
		del conns[uid]
		await broadcast_leave(uid)
	
async def listen(websocket, path):
	uid = ""
	print("Starting Server")
	
	try:
		async for message in websocket:
			print("jausa")
			data = json.loads(message)
			msg_type = data["msg_type"]

			if msg_type == "hello":
				print("a")
				if "uid" in data and data["uid"] != "":
					if data["uid"] in conns:
						await respond(websocket, Status.NAME_TAKEN)
					else:
						uid = data["uid"]
						await respond(websocket, Status.OK)
						conns[uid] = websocket
						await broadcast_enter(uid)
						await send_user_list(uid)
				else:
					await respond(websocket, Status.BAD_REQUEST)
					
			elif msg_type == "msg":
				print("b")
				if "uid" in data and data["uid"] != "" and "msg" in data:
					await broadcast(data["uid"], message)
				else:
					await respond(websocket, Status.BAD_REQUEST)
			
	except websockets.exceptions.ConnectionClosedError:
		await close_comm(uid)
	

start_server = websockets.server.serve(listen, "0.0.0.0", 5000, ssl=ssl_context)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
