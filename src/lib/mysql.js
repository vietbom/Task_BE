import {Sequelize} from 'sequelize'

const connectionString = process.env.DATABASE_URL
const sequelize = connectionString
    ? new Sequelize(connectionString, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            }
        }
    })
    
    : new Sequelize ('TASK', 'root', '', {
        host: 'localhost',
        dialect: 'mysql',
        logging: false
        
    })

export default sequelize