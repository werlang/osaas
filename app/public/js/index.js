import { request } from "./utils.js";

const User = {
    url: `//${ location.hostname }:3000`,

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
        const args = clientData ? [`${ this.url }/user/${ clientData.clientId }`] : [`${ this.url }/user`, { method: 'POST' }];
        let response = await request(...args);
        // console.log(response)

        // client not found, create new
        if (response?.error) {
            response = await request(`${ this.url }/user`, { method: 'POST' });
        }

        this.set(response.client);

        return response.client;
    },

    getInstance: async function() {
        const clientData = this.get();
        // console.log(clientData.clientId)

        // TODO: here... not sending clientId
        const response = await request(`${ this.url }/instance`, {
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
        window.location.href = `https://localhost:6929`;

        // request('instance', { method: 'POST', clientId: response.client.clientId } );
        
        // const response = await request(`https://localhost:6925`, {
        //     method: 'GET',
        //     headers: { "Authorization" : `Basic ${ btoa(`user:4d9b60eae52044d1ab2133306768b870`) }` }
        // });
        // console.log(response);

        // var myHeaders = new Headers();
        // myHeaders.append("Authorization", `Basic ${ btoa(`user:70a910932d244b92ae94635a8f0a5990`) }`);
        // myHeaders.append("Host", "localhost:6929");
        // myHeaders.append("User-Agent", "PostmanRuntime/7.30.0");
        // myHeaders.append("Accept", "*/*");
        // myHeaders.append("Postman-Token", "a7e4fbc9-7622-48eb-92c6-05a3f418007c");
        // myHeaders.append("Accept-Encoding", "gzip, deflate, br");
        // myHeaders.append("Connection", "keep-alive");

        // var urlencoded = new URLSearchParams();

        // var requestOptions = {
        // method: 'GET',
        // headers: myHeaders,
        // // body: urlencoded,
        // mode: 'cors',
        // redirect: 'follow'
        // };

        // fetch("https://localhost:6929", requestOptions)
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));
    });
}
main().catch(console.log);

