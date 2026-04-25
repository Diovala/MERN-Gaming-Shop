const bcrypt = require('bcryptjs');
const password = '$2b$10$.hohkya8UflWrG0zTX4evOLN9GisyU.pG6/Cn5zuxhrv.q4Vs6Ec2';
bcrypt.hash(password, 10).then(hash => console.log('Hashed password:', hash));