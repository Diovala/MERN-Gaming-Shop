const express = require('express');
const app = express();
app.get('/', (req, res) => res.json({ msg: 'Express chạy ổn' }));
app.listen(5000, () => console.log('✅ Server listening on 5000'));