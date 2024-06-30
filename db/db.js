import { Sequelize } from "sequelize";

let connectionString = `postgres://postgres:jiOgVbCclRvQ9tj@socket-shooter-space-fauxics-backend-db.flycast:5432`;

let local = false;
if (local === true) {
    connectionString = `postgres://postgres:jiOgVbCclRvQ9tj@127.0.0.1:5433`;
}

const db = new Sequelize(connectionString);

const connectToDB = async () => {
    try {
        await db.authenticate();
        console.log("Successfully connected");
    } catch (err) {
        console.error(err);
        console.error("DB Connection issue");
    }
};

connectToDB();

// Models
// const LeaderModel = require("./Leader");

import { Leader as LeaderModel } from "./Leader.js";
const Leader = LeaderModel(db);
export { db, Leader };

// to access remote db locally - eg. use beekeeper
// fly proxy 5433:5432 -a socket-shooter-space-fauxics-backend-db

// create a postgres cluster
// https://fly.io/docs/postgres/getting-started/create-pg-cluster/
// Default DB in beekeeper
// postgres:jiOgVbCclRvQ9tj@socket-shooter-space-fauxics-backend-db.flycast:5433
