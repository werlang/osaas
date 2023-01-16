import { request } from "./utils.js";

async function main() {
    const clientData = JSON.parse(localStorage.getItem('clientId'));
    const url = `//${ location.hostname }:3000`;
    const args = clientData ? [`${ url }/user/${ clientData.clientId }`] : [`${ url }/user`, { method: 'POST' }];
    const response = await request(...args);
    // console.log(response)

    if (!response.error) {
        console.log('Client:', response.client);
        localStorage.setItem('clientId', JSON.stringify(response.client));
        document.querySelector('#password').value = response.client.clientId;

        document.querySelector('button').addEventListener('click', async () => {
            request('instance', { method: 'POST', clientId: response.client.clientId } );
        });
    }
}
main().catch(console.log);

