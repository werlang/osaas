const uuid = require('uuid');

class User {

    constructor( id = null ) {
        if (!User.redisClient) {
            throw new Error('Redis client not found');
        }

        if (!User.expires) {
            User.expires = 1000 * 60 * 60 * 24; // 1 day
        }

        if (id) {
            this.id = id;
            return this;
        }

        this.id = uuid.v4().split('-').join('');
    }

    // get user data as object
    getData() {
        return {
            clientId: this.id,
            expires: this.expires,
            lastLogin: this.lastLogin,
            port: this.port,
        };
    }

    // get user data from redis
    async get() {
        let data = await User.redisClient.get(this.id);
        if (data === null) {
            return false;
        }
        try {
            data = JSON.parse(data);
        }
        catch (error) {
            console.log(error);
            return false;
        }
        this.expires = data.expires;
        this.lastLogin = data.lastLogin;
        this.port = data.port;

        if (this.isExpired()) {
            User.redisClient.del(this.id);
            return false;
        }

        return this;
    }

    isExpired() {
        return Date.now() > this.expires;
    }

    // update user data
    async update() {
        this.expires = Date.now() + User.expires;
        this.lastLogin = Date.now();

        if (!this.port) {
            this.port = await this.getPort();
        }

        const data = this.getData();
        await User.redisClient.set(this.id, JSON.stringify(data));
        await User.clean();

        return this;
    }

    // remove expired users
    static async clean() {
        const keys = await User.redisClient.keys('*');
        for (const key of keys) {
            const user = new User(key);
            await user.get();
            if (user.isExpired()) {
                await User.redisClient.del(key);
            }
        }
    }

    // get available port
    async getPort(start = 6901) {
        // scan all users
        const keys = await User.redisClient.keys('*');
        
        let portsUsed = await Promise.all(keys.map(async key => {
            const user = await new User(key).get();
            return user.getData().port;
        }));
        portsUsed = portsUsed.filter(e => e).sort((a, b) => a - b);

        // find first available port
        let port = start;
        while (true) {
            if (!portsUsed.includes(port)) return port;
            port++;
        }
    }

}

module.exports = User;