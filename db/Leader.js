// const { DataTypes } = require("sequelize");
import { DataTypes } from "sequelize";
// module.exports = (db) => {

const Leader = (db) => {
    return db.define("leader", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        created_at: DataTypes.TIME,
        player_name: DataTypes.STRING,
        score: DataTypes.INTEGER,
    });
};

export { Leader };
