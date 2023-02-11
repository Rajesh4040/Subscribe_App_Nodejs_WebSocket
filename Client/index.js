const express = require('express');
const server = express()
    .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
    .listen(3001, () => console.log(`Listening on ${3001}`));

