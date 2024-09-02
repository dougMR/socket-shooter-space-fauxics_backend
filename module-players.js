console.log("module-players.js");
import { Ship } from "./module-class-ship.js";
import { getCos, getSin } from "./module-angles.js";
import { ships } from "./server.js";

const maxPlayers = 8;
const disconnectedPlayers = [];
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
    for(const p of players){
        p.score = 0;
        ships.push(p.ship);
        p.ready = false;
        p.allHere = false;
    }
    reassignStartingPositions();
}

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
    // All players will be Client once Server is implemented
    console.log("addPlayer()", name);
    console.log("new player uuid:", uuid);
    if (players.length >= maxPlayers) {
        return { error: "Maximum players reached.  Can't add more." };
    }
    console.log("players.length:",players.length);
    console.log('players: ',players.map(p=>p.name));
    if (
        name &&
        !players.some(
            (player) => player.name?.toLowerCase() === name?.toLowerCase()
        )
    ) {
        let ship = new Ship(50, 95, 1, 2, 270, 0, shipColors[players.length]);
        ship.myArray = ships;
        // ship.type = "ship";
        ships.push(ship);
        // const shipImage = new Image(); // Create new img element
        // shipImage.src = "./images/spaceship.png"; // Set source path
        // ShipA.image = shipImage;
        // ^ Can't have images on the back end?  Add ship image on frontend?
        //  maybe an array of ship images on front end and backend stores an index reference?

        // Name is available
        const newPlayer = {
            id: socketId,
            name,
            uuid,
            score: 0,
            ship,
            ready: false,
            allHere: false,
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
        console.log("newPlayer:", newPlayer);
        return { success: `${newPlayer.name} added to game.` };
    }
    console.log("name already in use.");
    return { error: "Please choose another name." };
};

const reconnectPlayerByUUID = (uuid, socketId) => {
    console.log("reconnectPlayerByUUID()");
    console.log("disconnectedPlayers.length:", disconnectedPlayers.length);
    let foundPlayer = disconnectedPlayers.find((p) => p.uuid === uuid);
    if (foundPlayer === undefined) {
        // check in connected players
        foundPlayer = players.find((p) => p.uuid === uuid);
    } else {
        // found player in disconnectedPlayers, take them out
        disconnectedPlayers.splice(disconnectIndex, 1);
    }
    console.log("foundPlayer:", foundPlayer);
    if (foundPlayer === undefined) {
        // player not found
        return false;
    } else {
        // player found
        foundPlayer.id = foundPlayer.ship.playerId = socketId;
        clearTimeout(foundPlayer.disconnectTimer);
        // if we found them in disconnectedPlayers, put them in players
        if (!players.includes(foundPlayer)) players.push(foundPlayer);
        return true;
    }
};

export { addPlayer, reconnectPlayerByUUID, players, disconnectedPlayers, resetPlayers, reassignStartingPositions };
