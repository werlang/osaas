const uuid = require('uuid');
const Port = require('./port');

class User {

    constructor( id = null ) {
        if (!User.redisClient) {
            throw new Error('Redis client not found');
        }
        Port.redisClient = User.redisClient;

        if (id) {
            this.id = id;
            return this;
        }

        if (!User.expires) {
            User.expires = 1000 * 60 * 60 * 24; // 1 day
        }

        this.id = uuid.v4().split('-').join('');
    }

    getData() {
        return {
            clientId: this.id,
            expires: this.expires,
            lastLogin: this.lastLogin,
            port: this.port,
            running: this.running,
        };
    }

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
        this.running = data.running;

        if (this.isExpired()) {
            User.redisClient.del(this.id);
            return false;
        }

        return this;
    }

    isExpired() {
        return Date.now() > this.expires;
    }

    async update() {
        this.expires = Date.now() + User.expires;
        this.lastLogin = Date.now();

        if (!this.port) {
            this.port = await Port.getNew();
        }

        const data = this.getData();
        await User.redisClient.set(this.id, JSON.stringify(data));
        await User.clean();

        return this;
    }

    async setRunning( running ) {
        this.running = running;
        await this.update();
        return this;
    }

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

}

module.exports = User;