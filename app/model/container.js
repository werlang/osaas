const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class Container {
    constructor( id, port ) {
        this.id = id;
        this.port = port;
    }

    async run() {
        return docker.run('osaas', [], process.stdout, {
            name: `osaas-${ this.id }`,
            Env: [ `VNC_PW=${ this.id }` ],
            HostConfig:{
                AutoRemove: true,
                PortBindings: { "6901/tcp": [{ HostPort: `${ this.port }` }] },
                // have to find a way of binding.
                // Binds: [ `${ __dirname }/userdata/${ userData.clientId }:/home/user`],
            },
            ExposedPorts: { "6901/tcp": {} },
        });
    }

    async isRunning() {
        const containers = await docker.listContainers({
            "limit": 1,
            "filters": `{"name": ["osaas-${ this.id }"]}`
        });
        return containers.length > 0;
    }
}

module.exports = Container;