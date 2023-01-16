const express = require('express');
var cors = require('cors');
const redis = require('redis');
const app = express();
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

let port = 3000;

const User = require('./model/user');

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
    const user = await new User(clientId).get();
    const userData = user?.getData();

    const resp = {
        status: 'ok',
        message: 'Instance already running',
        client: userData,
    };

    if (!userData.running) {
        const port = userData.port;
    
        docker.run('osaas', [], process.stdout, {
            name: `osaas-${clientId}`,
            Env: [ `VNC_PW=${ clientId }` ],
            HostConfig:{
                AutoRemove: true,
                PortBindings: { "6901/tcp": [{ HostPort: `${port}` }] },
                // have to find a way of binding.
                // Binds: [ `${ __dirname }/userdata/${ userData.clientId }:/home/user`],
            },
            ExposedPorts: { "6901/tcp": {} },
        });
    
        resp.message = 'Instance created';
        await user.setRunning(true);
        res.status(201);
    }

    res.send(resp);
});

// 404
app.use((req, res) => {
    res.status(404).send({ error: 'Not found' });
});


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});