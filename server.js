console.log("server.js");
/*

https://www.geeksforgeeks.org/how-to-manage-users-in-socket-io-in-node-js/
https://www.youtube.com/watch?v=djMy4QsPWiI

*/

import express from "express";
import cors from "cors";
const app = express();
app.use(cors());

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

//
//     ^ SOCKET.IO SETUP ^
//
//////////////////////////////////////////////////////////////////////////////////////

import { players, disconnectedPlayers, reconnectPlayerByUUID, addPlayer } from "./module-players.js";
import { Missile } from "./module-class-missile.js";
import { startGameLoop } from "./module-game-loop.js";
import { getCos, getSin } from "./module-angles.js";
import { generateAsteroids, generateObstacles} from "./module-generate-game-pieces.js";

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
    // generateObstacles();
    asteroids.length = 0;
    generateObstacles();
    generateAsteroids(50);
    startGameLoop();
};

const emitEndGame = () => {
    io.emit("endGame");
}

const stopSound = (soundString) => {
    io.emit("stopSound", soundString);
};

const emitSound = (soundString) => {
    io.emit("playSound",soundString);
}

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
        // add players: when scoring is implemented
    };
    io.emit("updateGameData", gameData);
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
        // disconnectAllNonPlayerSockets();
    });

    socket.on("rejoin_game", (uuid, clientCallback) => {
        console.log("rejoin_game called");
        console.log("uuid:", uuid);
        console.log("clientCallback:", clientCallback);
        // tells client how long to store connection data

        // receive uuid from client

        // check whether this is a recent player (done in reconnectPlayerByUUID)

        // if yes, update socketId (done in reconnectPlayerByUUID)

        // tell client if reconnection works
        if (uuid && clientCallback) {
            const success = reconnectPlayerByUUID(uuid, socket.id);
            console.log('rejoin success:',success);
            clientCallback({
                success,
                name: players.find((p) => p.id === socket.id)?.name,
            });
            if (success) emitPlayers();
        }
        disconnectAllNonPlayerSockets();
    });

    socket.on("start_game", () => {
        console.log("start_game");
        startGame();
    });

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
            // console.log("shot missile: ",missile);
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
});

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
    emitEndGame
};
