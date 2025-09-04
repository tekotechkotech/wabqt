const express = require('express');
const app = express();
const routes = require('./route');

app.use(express.json());
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log('Server running on port', PORT);
});
