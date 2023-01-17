const request = async (url, options={}) => {
    options.headers = new Headers(options.headers || {});
    options.redirect = 'follow';

    if (options.body) {
        options.headers.append('Content-Type', 'application/json');
        options.body = new URLSearchParams(options.body).toString();
    }
    if (!options.method || options.method === 'GET' && options.query) {
        url += '?' + new URLSearchParams(options.query).toString();
    }

    try {
        const response = await fetch(url, options);
        const data = await response.text();

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