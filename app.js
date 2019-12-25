const express = require('express');
const expressWs = require('express-ws');

const app = new express();
expressWs(app);

const wsClients = {}
app.wsClients = wsClients;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./static'));

app.ws('/ws/:wid',  (ws, req) => {
    if(!wsClients[req.params.wid]) {
        wsClients[req.params.wid] = []
    }
    // 将连接记录在连接池中
    wsClients[req.params.wid].push(ws);
    ws.onclose = () => {
        // 连接关闭时，wsClients进行清理
        wsClients[req.params.wid] = wsClients[req.params.wid].filter((client) => {
            return client !== ws;
        });
        if(wsClients[req.params.wid].length === 0) {
            delete wsClients[req.params.wid];
        }
    }
});

app.post('/rest/message', (req, res) => {
    const to = req.body.to; // 接收方id
    const from = req.body.from; // 发送发id
    const result = { succeed: true };
    if(wsClients[to] !== undefined) {
        wsClients[to].forEach((client) => {
            client.send(JSON.stringify({
                from,
                content: req.body.content
            }));
        });
    } else {
        // 如果消息接收方没有连接，则返回错误信息
        result.succeed = false;
        result.msg = '对方不在线';
    }
    res.json(result);
});

setInterval(() => {
    // 定时打印连接池数量
    console.log('websocket connection counts:')
    Object.keys(wsClients).forEach(key => {
        console.log(key, ':', wsClients[key].length);
    })
    console.log('-----------------------------');
}, 5000);

app.listen(3000, () => {
    console.log('visit http://localhost:3000');
    // child_process.execSync('start http://localhost:3000');
});