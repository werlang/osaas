const express = require('express');
const app = express();

const port = 80;
const host = '0.0.0.0';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public/'));

app.get('/', async (req, res) => {
    res.sendFile('index.html');
});

app.get('/vnc', async (req, res) => {
    res.cookie('Authorization', 'Basic ' + Buffer.from(`user:${ req.query.id }`).toString('base64'));
    res.redirect(`//localhost:${ req.query.port }`);
});

// 404
app.use((req, res) => {
    res.status(404).send({ error: 'Web: Not found' });
});


app.listen(port, host, () => {
    console.log(`Web: Listening on http://${ host }:${ port }`);
});