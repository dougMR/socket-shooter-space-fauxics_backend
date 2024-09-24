console.log("module-players.js");
import { Ship } from "./module-class-ship.js";
import { getCos, getSin } from "./module-angles.js";
import { ships } from "./server.js";
import { gameInProgress } from "./module-game-loop.js";

const maxPlayers = 8;
// players waiting to join game
// as well as disconnected players
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

// getPlayers = () => {
//     return players.filter(p=>p.connected === true);
// }

const resetPlayers = () => {
    // resest existing players for new game
    ships.length = 0;
    for (const p of players) {
        p.score = 0;
        if (p.connected) {
            p.ship.alive = true;
            if (!ships.find((s) => s.playerId === p.id)) ships.push(p.ship);
            addPlayerToGame(p);
        } else {
            // player not connected
            const shipIndex = ships.findIndex((s) => s.playerId === p.id);
            if (shipIndex > -1) {
                ships.splice(shipIndex, 1);
            }
        }

        p.ready = false;
        p.allHere = false;
    }
    reassignStartingPositions();
};

const reassignStartingPositions = () => {
    console.log(
        "reassignStartingPositions()",
        players.map((p) => p.name)
    );
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

const createPlayer = (name, socketId, uuid) => {
    console.log("createPlayer()", name);

    if (players.length >= maxPlayers) {
        return { error: "Maximum players reached.  Can't add more." };
    }

    if (
        name &&
        !players.some(
            (player) => player.name?.toLowerCase() === name?.toLowerCase()
        )
    ) {
        // Name is available
        let ship = new Ship(50, 95, 1, 2, 270, 0, shipColors[ships.length]);
        ship.myArray = ships;
        ships.push(ship);
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
                // move me to waitingPlayers
                const playerIndex = players.findIndex((p) => p.id === this.id);
                players.splice(playerIndex, 1);
                waitingPlayers.push(this);
                // remove altogether in 2 mins
                console.log(this.name, "startRemovalTimer()");
                this.connected = false;
                this.removalTimer = setTimeout(() => {
                    console.log("removing", this.name);
                    console.log("players before removal", players.length);
                    removePlayer(this.uuid);
                    console.log("players after removal", players.length);
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
        addPlayerToGame(newPlayer);
        newPlayer.ship.playerId = socketId;
        // reassign all seats
        reassignStartingPositions(players);
        console.log("newPlayer:", newPlayer.name);
        console.log("players#:", players.length);
        console.log("waitingPlayers#:", waitingPlayers.length);
        return { success: `${newPlayer.name} added to game.` };
    }
    console.log("name already in use.");
    return { error: "Please choose another name." };
};

const removePlayer = (uuid) => {
    let playerIndex = players.findIndex((p) => (p.uuid = uuid));
    if (playerIndex > -1) {
        // remove player's ship
        players[playerIndex].ship.destroy();
        // remove player
        players.splice(playerIndex, 1);
    } else {
        // not in players, try waitinPlayers
        playerIndex = waitingPlayers.findIndex((p) => p.uuid === uuid);
        if (playerIndex > -1) {
            // remove player's ship
            waitingPlayers[playerIndex].ship.destroy();
            // remove player
            waitingPlayers.splice(playerIndex, 1);
        }
    }
};

const addPlayerToGame = (player) => {
    console.log("addPlayerToGame()");
    console.log("gameInProgress:", gameInProgress);
    if (gameInProgress) {
        // add to waiting
        if (!waitingPlayers.find((p) => p.id === player.id))
            waitingPlayers.push(player);
    } else {
        // add to players
        if (!players.find((p) => p.id === player.id)) players.push(player);
    }
};

const findPlayerByUuid = (uuid) => {
    console.log("findPlayerByUuid()")
    let foundPlayer;
    let playerIndex = waitingPlayers.findIndex((p) => p.uuid === uuid);
    if (playerIndex > -1) {
        // found them in waiting players
        foundPlayer = waitingPlayers[playerIndex];
        // only add to players[] if game is not in progress
        if (!gameInProgress) {
            // take them out and put them in players
            waitingPlayers.splice(playerIndex, 1);
            players.push(foundPlayer);
        }
    } else {
        // not in waiting players, check in players
        foundPlayer = players.find((p) => p.uuid === uuid);
    }
    console.log('foundPlayer:',foundPlayer);
    return foundPlayer;
};
const findPlayerById = (id) => {
    let foundPlayer;
    let playerIndex = waitingPlayers.findIndex((p) => p.id === id);
    if (playerIndex > -1) {
        // found them in waiting players
        foundPlayer = waitingPlayers[playerIndex];
        // only add to players[] if game is not in progress
        if (!gameInProgress) {
            // take them out and put them in players
            waitingPlayers.splice(playerIndex, 1);
            players.push(foundPlayer);
        }
    } else {
        // not in waiting players, check in players
        foundPlayer = players.find((p) => p.id === id);
    }
    return foundPlayer;
};

const reconnectPlayerByUUID = (uuid, socketId) => {
    console.log("reconnectPlayerByUUID()");
    const foundPlayer = findPlayerByUuid(uuid);
    if (foundPlayer) {
        // player found
        console.log("found player.", foundPlayer.name);
        foundPlayer.id = foundPlayer.ship.playerId = socketId;
        foundPlayer.stopRemovalTimer();
        return true;
    } else {
        // player not found
        console.log("player not found");
        return false;
    }
};

export {
    createPlayer,
    reconnectPlayerByUUID,
    players,
    waitingPlayers,
    // disconnectedPlayers,
    findPlayerByUuid,
    findPlayerById,
    resetPlayers,
    reassignStartingPositions,
};
