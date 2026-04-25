import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

const Publisher = sequelize.define('Publisher', {
    // id: {
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     primaryKey: true,
    // },
    publisher_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: "publishers"
})

export default Publisher;