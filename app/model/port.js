const Port = {

    getAll: async function() {
        let ports = await Port.redisClient.get('ports');
        if (ports === null) {
            return [];
        }
        try {
            ports = JSON.parse(ports);
        }
        catch (error) {
            console.log(error);
            return false;
        }
        
        return ports;
    },

    add: async function(port) {
        const ports = await this.getAll();
        if (!ports) {
            return false;
        }

        ports.push(port);
        Port.redisClient.set('ports', JSON.stringify(ports));
    },

    new: async function() {
        const ports = await this.getAll();
        if (!ports) {
            return false;
        }

        if (!ports.length) {
            this.add(6901);
            return 6901;
        }

        const min = Math.min(...ports);
        const max = Math.max(...ports);

        const filled = new Array(max - min + 1).fill(0).map((e,i) => max + i - 1);
        const available = filled.filter(e => !ports.includes(e));
        const port = available.length ? available[0] : max + 1;

        this.add(port);
        return port;
    },

    remove: async function(port) {
        let ports = await this.getAll();
        if (!ports) {
            return false;
        }

        if (!ports.find(e => e === port)) {
            return false;
        }

        ports = ports.filter(e => e !== port);
        Port.redisClient.set('ports', JSON.stringify(ports));
    },

}

module.exports = Port;