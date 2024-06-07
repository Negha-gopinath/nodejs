

const { Sequelize } = require('sequelize');



let sequelize;
sequelize = new Sequelize('mydb', 'username', 'mypassword', {
    host: 'localhost',
    dialect: 'postgres'
});

const connect = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error(`db connection failure : ${error}`);
    }
}

module.exports = { sequelize, connect };
