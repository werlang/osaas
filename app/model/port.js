const server = require('net').createServer();

const Port = {
    expireTime: 1000 * 60 * 5, // 5 minutes

    add: async function(port) {
        const portsUsed = await this.getAll();
        portsUsed[port] = {
            expire: Date.now() + this.expireTime,
        }
        await this.redisClient.set('ports', JSON.stringify(portsUsed));
    },

    getAll: async function() {
        return JSON.parse(await this.redisClient.get('ports') || '{}');
    },

    getList: async function() {
        let portsUsed = await this.getAll();
        return Object.keys(portsUsed).map(port => parseInt(port));
    },

    clean: async function() {
        let ports = await this.getAll();

        // remove expired ports
        ports = Object.fromEntries(Object.entries(ports).filter(([port, data]) => data.expire > Date.now()));

        await this.redisClient.set('ports', JSON.stringify(ports));
    },

    check: async function(port) {
        const portsUsed = await this.getList();
        if (portsUsed.includes(port)) {
            return false;
        }
        return new Promise(resolve => {
            server.once('error', function (err) {
                if (err.code === 'EADDRINUSE') {
                    // console.log(`Port ${ port } is already in use`);
                    resolve(false);
                }
            });
            
            server.once('listening', function () {
                // console.log(`Listening on port ${ port }. No errors found.`);
                server.close();
                resolve(true);
            });
            
            server.listen(port);
        });        
    },

    getNew: async function(start = 6901) {
        let port = start;
        
        // clean up expired ports before checking
        await this.clean();

        // check if port is available
        while (true) {
            this.add(port);
            if (await this.check(port)) return port;
            port++;
        }
    },

}

module.exports = Port;