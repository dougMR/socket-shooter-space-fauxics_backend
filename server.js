console.log("server.js");
/*

https://www.geeksforgeeks.org/how-to-manage-users-in-socket-io-in-node-js/
https://www.youtube.com/watch?v=djMy4QsPWiI

*/

import express from "express";
import cors from "cors";
// import { db, Leader } from "./db/db.js";
const app = express();
app.use(cors());
// app.use(
//     cors({
//         credentials: false,
//         origin: [
//             "http://localhost:5500",
//             "https://mega-space-faceoff.netlify.app",
//             "https://www.mega-space-faceoff.netlify.app",
//             // "https://dougmr-blog-frontend.herokuapp.com",
//         ],
//     })
// );

// socket.io setup
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server, {
    // frontend should ping every 2 secs
    pingInterval: 2000,
    // if we don't hear from client in 5 secs, time out
    pingTimeout: 5000,
    cors: {
        // origin: "http://localhost:3000",
        // origin: "https://socket-shooter.netlify.app"
        methods: ["GET", "POST"],
    },
});
// const sequelize = require('socket.io-sequelize');
// io.use(sequelize(db,))

// db tables

//
//     ^ SOCKET.IO SETUP ^
//
//////////////////////////////////////////////////////////////////////////////////////

import {
    players,
    disconnectedPlayers,
    reconnectPlayerByUUID,
    addPlayer,
    resetPlayers,
    reassignStartingPositions,
} from "./module-players.js";
import { Missile } from "./module-class-missile.js";
import { startGameLoop } from "./module-game-loop.js";
import { getCos, getSin } from "./module-angles.js";
import {
    generateAsteroids,
    generateObstacles,
} from "./module-generate-game-pieces.js";

//
//     ^ IMPORTS ^
//
//////////////////////////////////////////////////////////////////////////////////////

const emitPlayers = () => {
    console.log("emitPlayers()");
    const frontendPlayers = players.map((p) => p.clientVersion);
    io.emit("updatePlayers", frontendPlayers);
};

const startGame = () => {
    console.log("startGame()");
    // generateObstacles();
    asteroids.length = 0;
    obstacles.length = 0;
    resetPlayers();
    generateObstacles();
    generateAsteroids(50);
    io.emit("startGame");
    startGameLoop();
};

const emitEndGame = () => {
    io.emit("endGame");
    setTimeout(reassignStartingPositions, 3000);
};

const stopSound = (soundString) => {
    io.emit("stopSound", soundString);
};

const emitSound = (soundString) => {
    io.emit("playSound", soundString);
};

// const emitDraw = () => {
//     io.emit
// }

const emitTime = (remaining) => {
    io.emit("showTime", remaining);
};

const emitGameState = () => {
    const gameData = {
        asteroids: asteroids.map((a) => a.clientVersion),
        missiles: missiles.map((m) => m.clientVersion),
        debris: debris.map((d) => d.clientVersion),
        obstacles: obstacles.map((o) => o.clientVersion),
        ships: ships.map((s) => s.clientVersion),
        players: players.map((p) => p.clientVersion),
        // add players: when scoring is implemented
    };
    io.emit("updateGameData", gameData);
};

const checkAllPlayersHere = () => {
    return !players.some((p) => p.allHere === false);
};

const checkAllPlayersReady = () => {
    return !players.some((p) => p.ready === false);
};

// POINT OF ENTRY
const asteroids = [];
const missiles = [];
const debris = [];
const obstacles = [];
const ships = [];

/////////////////////////////////////////////
//
//     v SOCKET STUFF v
//

const disconnectAllNonPlayerSockets = () => {
    console.log("   disconnectAllNonPlayerSockets");
    // limit each client to one socket, the one used by their player object
    console.log("sockets:", io.sockets.sockets.size);
    io.sockets.sockets.forEach((s) => {
        console.log("checking", s.id);
        const inPlayers = players.some((p) => p.id === s.id);
        const inDisconnectedPlayers = disconnectedPlayers.some(
            (p) => p.id === s.id
        );
        if (!inPlayers && !inDisconnectedPlayers) {
            // remove this socket
            console.log("disconnect socket:", s.id);
            s.disconnect();
        } else {
            if (inPlayers) {
                console.log("is ", players.find((p) => p.id === s.id).name);
            } else if (inDisconnectedPlayers) {
                console.log(
                    "is ",
                    disconnectedPlayers.find((p) => p.id === s.id).name
                );
            }
        }
    });
    console.log("updated sockets:", io.sockets.sockets.size);
};

io.on("connection", (socket) => {
    console.log("socket connected: ", socket);
    socket.on("join_game", (playerName, uuid, callback) => {
        // Manual join
        console.log("--");
        console.log("socket: ", socket.id);
        console.log(" --> incoming -> join_game", playerName);
        console.log("join_game uuid:", uuid);
        const result = addPlayer(playerName, socket.id, uuid);
        console.log("result: ", result);
        if (result?.success) {
            emitPlayers();
        }
        callback(result);
        // disconnectAllNonPlayerSockets();
    });

    socket.on("rejoin_game", (uuid, clientCallback) => {
        console.log("rejoin_game()");
        console.log("uuid:", uuid);
        console.log("clientCallback:", clientCallback);
        // tells client how long to store connection data

        // receive uuid from client

        // check whether this is a recent player (done in reconnectPlayerByUUID)

        // if yes, update socketId (done in reconnectPlayerByUUID)

        // tell client if reconnection works
        if (uuid && clientCallback) {
            const success = reconnectPlayerByUUID(uuid, socket.id);
            console.log("rejoin success:", success);
            clientCallback({
                success,
                name: players.find((p) => p.id === socket.id)?.name,
            });
            if (success) emitPlayers();
        }
        disconnectAllNonPlayerSockets();
    });

    socket.on("player_ready", (yesOrNo) => {
        console.log("player_ready", yesOrNo);
        // If all connected players are ready, start game
        const socketPlayer = players.find((p) => p.id === socket.id);
        if (!socketPlayer) return;
        socketPlayer.ready = true;
        if (checkAllPlayersReady()) {
            // all players are ready
            if (!checkAllPlayersHere()) {
                // io.emit("pollAllHere");
            } else {
                // everyone here and ready
                startGame();
            }
        }
    });

    socket.on("vote_all_here", (yesOrNo) => {
        console.log("vote_all_here", yesOrNo);
        // set this player's allHere (all must be true to start game)
        console.log("socket.id:", socket.id);
        console.log(
            "players: ",
            players.map((p) => p.name)
        );
        console.log(
            "ids:",
            players.map((p) => p.id)
        );
        players.find((p) => p.id === socket.id).allHere = yesOrNo;
        // check everyone says we're all here
        if (checkAllPlayersHere()) {
            // all here
            // double check we're all ready
            if (checkAllPlayersReady()) {
                // everyone's here and ready

                startGame();
            }
        }
        // else {
        //     setTimeout(() => {
        //         io.emit("pollAllHere");
        //     }, 5000);
        // }
    });

    // socket.on("start_game", () => {
    //     console.log("start_game");
    //     startGame();
    // });

    // Ship

    socket.on("accelerate_ship", (playerId, amount) => {
        const ship = players.find((p) => p.id === playerId)?.ship;
        if (ship) {
            ship.thrust(amount);
            ship.thrusting = true;
        }
    });
    socket.on("stop_ship_thrust", (playerId) => {
        const ship = players.find((p) => p.id === playerId)?.ship;
        if (ship) {
            ship.thrusting = false;
        }
    });

    socket.on("ship_shoot", (playerId) => {
        const ship = players.find((p) => p.id === playerId)?.ship;
        if (ship) {
            // generate projectile at ShipA's nose
            const noseX = ship.x + getCos(ship.facing) * ship.radius * 0.7;
            const noseY = ship.y + getSin(ship.facing) * ship.radius * 0.7;
            // missile constructor(x, y, radius, mass, facing, velocity, color)
            const missile = new Missile(
                noseX,
                noseY,
                0.5,
                0.1,
                ship.facing,
                ship.velocity + 2,
                "#69ff2f"
            );
            missile.type = "missile";
            missile.bornTime = performance.now();
            missile.lifeSpan = 1500;
            missiles.push(missile);
            missile.myArray = missiles;
            missile.myShip = ship;
            // console.log("shot missile - p.id: ",missile.myShip.playerId);
        }
    });

    // socket.on("move_ship", (playerId, distance) => {
    //     const ship = players.find((p) => p.id === playerId)?.ship;
    //     if (ship) {
    //         ship.move(distance);
    //     }
    // });

    socket.on("rotate_ship", (playerId, degChange) => {
        const ship = players.find((p) => p.id === playerId)?.ship;
        if (ship) {
            ship.rotate(degChange);
        }
    });

    socket.on("broadcast_sound", (soundString) => {
        socket.broadcast.emit("playSound", soundString);
    });

    /*
    console.log("user",socket.id,"connected.");
    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        // Emit will send message to the user
        // who had joined
        socket.emit("message", {
            user: "admin",
            text: `${user.name}, 
            welcome to room ${user.room}.`,
        });

        // Broadcast will send message to everyone
        // in the room except the joined user
        socket.broadcast.to(user.room).emit("message", {
            user: "admin",
            text: `${user.name}, has joined`,
        });

        socket.join(user.room);

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("message", { user: user.name, text: message });

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();
    });
*/
    socket.on("disconnect", () => {
        // const user = removeUser(socket.id);
        // if (user) {
        //     io.to(user.room).emit("message", {
        //         user: "admin",
        //         text: `${user.name} had left`,
        //     });
        // }
    });
    //
    // DB "API" Endpoints
    //
    // socket.on("get_leaderboard", async (callback) => {
    //     const leaders = await Leader.findAll();
    //     callback(leaders.sort(sortLeaders));
    // });
    // socket.on("submit_score",async(player)=>{
    //     const leaders = await Leader.findAll();
    //     let addPlayer = false;
    //     if (leaders.length < 10) {
    //         // add this player
    //         addPlayer = true;
    //     } else {
    //         // get leaderboard player with lowest score
    //         const lowestScorePlayer = leaders.reduce((acc, curr) => {
    //             if (curr.score < acc.score) {
    //                 return curr;
    //             }
    //             return acc;
    //         }, leaders[0]);
    //         if (lowestScorePlayer.score < player.score) {
    //             // remove lowestScorePlayer
    //             await Leader.destroy({ where: { id: lowestScorePlayer.id } });
    //             // add this player
    //             addPlayer = true;
    //         }
    //     }
    //     if (addPlayer) {
    //         await Leader.create({
    //             player_name: player.name,
    //             score: player.score,
    //         });
    //         const leaders = await Leader.findAll();
    //         res.send({ leaders: leaders.sort(sortLeaders) });
    //         res.send({
    //             leaderboard: leaders,
    //             success: true,
    //             message: player.name + " added to leaderboard.",
    //         });
    //     } else {
    //         const leaders = await Leader.findAll();
    //         res.send({
    //             leaderboard: leaders.sort(sortLeaders),
    //             success: false,
    //             message: player.name + " not added to leaderboard.",
    //         });
    //     }
    // });
});
//
// API Endpoints
//
const sortLeaders = (a, b) => {
    if (a.score > b.score) {
        return -1;
    }
    if (a.score > b.score) {
        return 1;
    }
    return 0;
};
app.get("/", (req, res) => {
    res.send({ hello: "world" });
});
// app.get("/leaderboard", async (req, res) => {
//     const leaders = await Leader.findAll();
//     res.send({ leaders: leaders.sort(sortLeaders) });
// });
// app.post("/leader", async (req, res) => {
//     const leaders = await Leader.findAll();
//     let addPlayer = false;
//     if (leaders.length < 10) {
//         // add this player
//         addPlayer = true;
//     } else {
//         // get leaderboard player with lowest score
//         const lowestScorePlayer = leaders.reduce((acc, curr) => {
//             if (curr.score < acc.score) {
//                 return curr;
//             }
//             return acc;
//         }, leaders[0]);
//         if (lowestScorePlayer.score < req.body.score) {
//             // remove lowestScorePlayer
//             await Leader.destroy({ where: { id: lowestScorePlayer.id } });
//             // add this player
//             addPlayer = true;
//         }
//     }
//     if (addPlayer) {
//         await Leader.create({
//             player_name: req.body.name,
//             score: req.body.score,
//         });
//         const leaders = await Leader.findAll();
//         res.send({ leaders: leaders.sort(sortLeaders) });
//         res.send({
//             leaderboard: leaders,
//             success: true,
//             message: req.body.name + " added to leaderboard.",
//         });
//     } else {
//         const leaders = await Leader.findAll();
//         res.send({
//             leaderboard: leaders.sort(sortLeaders),
//             success: false,
//             message: req.body.name + " not added to leaderboard.",
//         });
//     }
// });

server.listen(process.env.PORT || 3000, () =>
    console.log(`server running!  It Lives!`)
);

export {
    ships,
    asteroids,
    obstacles,
    debris,
    missiles,
    emitTime,
    emitGameState,
    emitSound,
    stopSound,
    emitEndGame,
};
