console.log("module-players.js");
import { Ship } from "./module-class-ship.js";
import { getCos, getSin } from "./module-angles.js";
import { ships } from "./server.js";
import { gameInProgress } from "./module-game-loop.js";

const maxPlayers = 8;
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
        // p.allHere = false;
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
        // ships.push(ship);
        const newPlayer = {
            id: socketId,
            name,
            uuid,
            score: 0,
            ship,
            ready: false,
            // allHere: false,
            connected: true,
            removalTimer: null,
            onDeck: false,
            startRemovalTimer() {
                // flag for removal
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
                    onDeck: this.onDeck,
                    connected: this.connected,
                    ready: this.ready
                };
            },
        };
        addPlayerToGame(newPlayer);
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
    let playerIndex = players.findIndex((p) => (p.uuid = uuid));
    if (playerIndex > -1) {
        // remove player's ship
        players[playerIndex].ship.destroy();
        // remove player
        players.splice(playerIndex, 1);
    }
};

const addPlayerToGame = (player) => {
    console.log("addPlayerToGame()");
    console.log("gameInProgress:", gameInProgress);
    if (gameInProgress) {
        // add to waiting
        player.onDeck = true;
    }
    // add to players (if no player of this id alreay in players)
    if (!players.find((p) => p.id === player.id)) players.push(player);
    // set all ship colors
    for(let i = 0; i < ships.length; i++){
        ships[i].color = shipColors[i];
    }
};

const findPlayerByUuid = (uuid) => {
    console.log("findPlayerByUuid()");
    const foundPlayer = players.find((p) => p.uuid === uuid);
    return foundPlayer;
};
const findPlayerById = (id) => {
    const foundPlayer = players.find((p) => p.id === id);
    // }
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

const playersConnected = () => {
    // get list of connected players
    return players.filter((p) => p.connected);
};

const playersInGame = () => {
    // get list of connected players not on deck
    return players.filter((p) => !p.onDeck && p.connected);
};

export {
    createPlayer,
    reconnectPlayerByUUID,
    players,
    playersConnected,
    playersInGame,
    findPlayerByUuid,
    findPlayerById,
    resetPlayers,
    reassignStartingPositions,
};
