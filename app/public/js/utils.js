const request = async (endpoint, options={}) => {
    options.headers = options.headers || {};
    options.redirect = 'follow';

    if (options.body) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = new URLSearchParams(options.body).toString();
    }
    if (!options.method || options.method === 'GET' && options.query) {
        endpoint += '?' + new URLSearchParams(options.query).toString();
    }

    try {
        const url = `${ window.location.protocol }//api.${ window.location.host }`;
        const data = await fetch(`${url}${endpoint}`, options).then(data => data.text());

        try {
            return JSON.parse(data);
        }
        catch (error) {
            return new Error(data);
        }
    }
    catch (error) {
        throw new Error(error);
    }

}

export { request };