const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const { count } = require('console');
const port = 6969;
var _count = 0;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection(ws) {
    console.log('New client connected!');
    ws.on('close', () => console.log('Client has disconnected!'));
    ws.on('message', function incoming(data) {
        const _clientdata = data.toString('utf8');
        var Valid_json = isJsonString(_clientdata)
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if (!Valid_json) {
                    wss.clients.forEach((client) => {
                        const _errordata = JSON.stringify({
                            "type": "Error",
                            "error": "Bad formatted payload, non JSON",
                            "updatedAt": new Date().toLocaleString('en-US', { hour12: false })
                        });
                        client.send(_errordata);
                    });
                }
                else {
                    var test = _clientdata.split(":")
                    var _Type = test[1].replace("}", "").replace(/["]+/g, '').toString();
                    if (_Type.trim().toLocaleLowerCase() == 'subscribe') {
                        _count++;
                        setTimeout(() => {
                            wss.clients.forEach((client) => {
                                const _subscribeData = JSON.stringify({
                                    "type": "Subscribe",
                                    "status": "Subscribed",
                                    "updatedAt": new Date().toLocaleString('en-US', { hour12: false })
                                });
                                client.send(_subscribeData);
                            });
                        }, 4000);
                    }
                    else if (_Type.trim().toLocaleLowerCase() == 'unscubscribe') {
                        if (_count > 0) {
                            --_count;
                            setTimeout(() => {
                                wss.clients.forEach((client) => {
                                    const _unscubscribeData1 = JSON.stringify({
                                        "type": "Unscubscribe",
                                        "status": "Unsubscribed",
                                        "updatedAt": new Date().toLocaleString('en-US', { hour12: false })
                                    });
                                    client.send(_unscubscribeData1);
                                })
                            }, 8000);
                        }
                        else if (_count === 0) {
                            wss.clients.forEach((client) => {
                                const _noSubscribersData = JSON.stringify({
                                    "type": "NoSubscribers",
                                    "message": "Atleast 1 subscriber required",
                                });
                                client.send(_noSubscribersData);
                            });
                        }
                    }
                    else if (_Type.trim().toLocaleLowerCase() == 'countsubscribers') {
                        wss.clients.forEach((client) => {
                            const _cuntSubscribersData = JSON.stringify({
                                "type": "CountSubscribers",
                                "count": _count,
                                "updatedAt": new Date().toLocaleString('en-US', { hour12: false })
                            });
                            client.send(_cuntSubscribersData);
                        });
                    }
                    else {

                        wss.clients.forEach((client) => {
                            const _otherRequestData = JSON.stringify({
                                "type": "Error",
                                "error": "Requested method not implemented",
                                "updatedAt": new Date().toLocaleString('en-US', { hour12: false })
                            });
                            client.send(_otherRequestData);
                        });
                    }
                }
            }
        })
    })
})
setInterval(() => {
    wss.clients.forEach((client) => {
        const _heatbeatdata = JSON.stringify({ "type": "Heatbeat", "updatedAt": new Date().toLocaleString('en-US', { hour12: false }) });
        client.send(_heatbeatdata);
    });
}, 1000);
server.listen(port, function () {
    console.log(`Server is listening on ${port}!`)
})

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
