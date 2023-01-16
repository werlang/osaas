const express = require('express');
var cors = require('cors');
const redis = require('redis');
const app = express();

let port = 3000;

const User = require('./model/user');
const Container = require('./model/container');

(async () => {
    try {
        User.redisClient = redis.createClient({ url: 'redis://redis:6379' });
        await User.redisClient.connect();
    } catch (error) {
        console.log(error);
    }
})();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post('/user', async (req, res) => {
    const user = await new User().update();
    const userData = user.getData();

    res.status(201).send({
        status: 'ok',
        message: 'Client created',
        client: userData,
    });
});

app.get('/user/:id', async (req, res) => {
    let clientId = req.params.id;
    const user = await new User(clientId).get();

    // client not found
    if (!user) {
        res.status(404).send({ error: 'Client not found' });
        return;
    }

    await user.update();
    
    res.send({
        status: 'ok',
        message: 'Client found',
        client: user.getData(),
    });
    return;
});


app.post('/instance', async (req, res) => {
    const clientId = req.body.clientId;
    const user = new User(clientId);
    await user.get();
    const userData = user?.getData();

    const container = new Container(clientId, userData.port);
    // check if container is running
    if (await container.isRunning()) {
        res.send({
            status: 'exists',
            message: 'Instance already running',
            running: true,
            client: userData,
        });
        return;
    }

    container.run();
    res.status(201).send({
        status: 'ok',
        message: 'Instance created',
        running: true,
        client: userData,
    });
    return;
});

app.get('/instance/:id', async (req, res) => {
    const clientId = req.params.id;
    const user = new User(clientId);
    await user.get();
    const userData = user?.getData();

    const container = new Container(clientId, userData.port);
    // check if container is running
    if (await container.isRunning()) {
        res.send({
            status: 'ok',
            message: 'Instance running',
            running: true,
            client: userData,
        });
        return;
    }

    res.status(404).send({
        status: 'not found',
        message: 'Instance not found',
        running: false,
        client: userData,
    });
    return;
});

// 404
app.use((req, res) => {
    res.status(404).send({ error: 'Not found' });
});


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});