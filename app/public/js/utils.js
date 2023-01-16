const request = async (url, options={}) => {
    if (options.body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = new URLSearchParams(options.body).toString();
    }
    if (!options.method || options.method === 'GET') {
        delete options.method;
        url += '?' + new URLSearchParams(options).toString();
    }

    return fetch(url, options)
    .then(response => {
        if ([200, 201].includes(response.status)) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

export { request };