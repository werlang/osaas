import { request } from "./utils.js";

const User = {
    get: function() {
        try {
            return JSON.parse(localStorage.getItem('clientId'));
        }
        catch (error) {
            console.log(error);
            return false;
        }
    },

    set: function(data) {
        localStorage.setItem('clientId', JSON.stringify(data));
    },
    
    fetch: async function() {
        const clientData = this.get();

        // client found in local storage, get data, else create new
        const args = clientData ? [`/user/${ clientData.clientId }`] : [`/user`, { method: 'POST' }];
        let response = await request(...args);
        // console.log(response)

        // client not found, create new
        if (response?.error) {
            response = await request(`/user`, { method: 'POST' });
        }

        this.set(response.client);

        return response.client;
    },

    getInstance: async function() {
        const clientData = this.get();
        // console.log(clientData)

        // TODO: here... not sending clientId
        const response = await request(`/instance`, {
            method: 'POST',
            body: { clientId: clientData.clientId },
        });
        console.log(response)
    },

}


async function main() {
    const client = await User.fetch();
    console.log('Client:', client);
    document.querySelector('#password').value = client.clientId;
    document.querySelector('#port').value = client.port;

    User.getInstance();

    document.querySelector('button').addEventListener('click', async () => {
        location.href = `vnc?id=${ client.clientId }&port=${ client.port }`;

    });
}
main().catch(console.log);

