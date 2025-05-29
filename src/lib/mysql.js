import {Sequelize} from 'sequelize'

const sequelize = new Sequelize ('TASK', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
    
})

export default sequelize