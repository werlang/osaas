const express = require('express');
const app = express();

let port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public/'));

app.get('/', async (req, res) => {
    res.sendFile('index.html');
});

// 404
app.use((req, res) => {
    res.status(404).send({ error: 'Not found' });
});


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});