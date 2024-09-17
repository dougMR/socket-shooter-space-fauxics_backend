console.log("module-players.js");
import { Ship } from "./module-class-ship.js";
import { getCos, getSin } from "./module-angles.js";
import { ships } from "./server.js";

const maxPlayers = 8;
// ?? Is disconnectedPlayers being used any longer?
// const disconnectedPlayers = [];
// players waiting to join game
const waitingPlayers = [];
const players = [];
const shipColors = [
    "red",
    "orange",
    "yellow",
    "limegreen",
    "blue",
    "purple",
    "violet",
    "#444",
];

const resetPlayers = () => {
    // resest existing players for new game
    ships.length = 0;
    for (const p of players) {
        p.score = 0;
        if (p.connected) {
            p.ship.alive = true;
            if (!ships.find((s) => s.playerId === p.id)) ships.push(p.ship);
        } else {
            // if(p.ship){
            const shipIndex = ships.findIndex((s) => s.playerId === p.id);
            if (shipIndex > -1) {
                ships.splice(shipIndex, 1);
            }
            // }
        }

        p.ready = false;
        p.allHere = false;
    }
    reassignStartingPositions();
};

const reassignStartingPositions = () => {
    // put players in circle at edge of playing field, facing towards center
    const degIncrement = 360 / players.length;
    let playerIndex = 0;
    for (const player of players) {
        const positionDeg = 90 + degIncrement * playerIndex;
        const ship = player.ship;
        playerIndex++;
        ship.facing = (positionDeg % 360) - 180;
        ship.x = 50 + getCos(positionDeg) * 45;
        ship.y = 50 + getSin(positionDeg) * 45;
    }
};

const addPlayer = (name, socketId, uuid) => {
    console.log("addPlayer()", name);
    // console.log("new player uuid:", uuid);

    if (players.length >= maxPlayers) {
        return { error: "Maximum players reached.  Can't add more." };
    }

    // console.log("players.length:", players.length);
    // console.log(
    //     "players: ",
    //     players.map((p) => p.name)
    // );

    if (
        name &&
        !players.some(
            (player) => player.name?.toLowerCase() === name?.toLowerCase()
        )
    ) {
        let ship = new Ship(50, 95, 1, 2, 270, 0, shipColors[players.length]);
        ship.myArray = ships;
        ships.push(ship);

        // Name is available
        const newPlayer = {
            id: socketId,
            name,
            uuid,
            score: 0,
            ship,
            ready: false,
            allHere: false,
            connected: true,
            removalTimer: null,
            startRemovalTimer() {
                // remove from players in 2 mins
                console.log(this.name, "startRemovalTimer()");
                this.connected = false;
                this.removalTimer = setTimeout(() => {
                    console.log("removing", this.name);
                    console.log("players0", players.length);
                    removePlayer(this.uuid);
                    console.log("players1", players.length);
                }, 120000);
            },
            stopRemovalTimer() {
                console.log(this.name, "stopRemovalTimer()");
                clearTimeout(this.removalTimer);
                this.connected = true;
            },
            get clientVersion() {
                return {
                    id: this.id,
                    name: this.name,
                    uuid: this.uuid,
                    score: this.score,
                    ship: this.ship.clientVersion,
                };
            },
        };
        players.push(newPlayer);
        newPlayer.ship.playerId = socketId;
        // reassign all seats
        reassignStartingPositions(players);
        console.log("newPlayer:", newPlayer.name);
        console.log("players#:", players.length);
        return { success: `${newPlayer.name} added to game.` };
    }
    console.log("name already in use.");
    return { error: "Please choose another name." };
};

const removePlayer = (uuid) => {
    const playerIndex = players.findIndex((p) => (p.uuid = uuid));
    if (playerIndex > -1) players.splice(playerIndex, 1);
};

const reconnectPlayerByUUID = (uuid, socketId) => {
    console.log("reconnectPlayerByUUID()");
    // let foundPlayer = disconnectedPlayers.find((p) => p.uuid === uuid);
    // if (foundPlayer === undefined) {

    // check in connected players
    let foundPlayer = players.find((p) => p.uuid === uuid);
    // } else {
    //     // found player in disconnectedPlayers, take them out
    //     disconnectedPlayers.splice(disconnectIndex, 1);
    // }

    if (foundPlayer === undefined) {
        // player not found
        console.log("player not found");
        return false;
    } else {
        // player found
        console.log("found player.", foundPlayer.name);
        foundPlayer.id = foundPlayer.ship.playerId = socketId;
        foundPlayer.stopRemovalTimer();
        // if we found them in disconnectedPlayers, put them in players
        // if (!players.includes(foundPlayer)) players.push(foundPlayer); // <- can't use .includes to find an object
        return true;
    }
};

export {
    addPlayer,
    reconnectPlayerByUUID,
    players,
    // disconnectedPlayers,
    resetPlayers,
    reassignStartingPositions,
};
