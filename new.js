const fs = require("fs");

function getGameIdByName(gameName) {
    return fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch data. Status code: ${response.status}`,
                );
            }

            return response.json();
        })
        .then((data) => {
            if (!data.applist || !data.applist.apps) {
                throw new Error("Invalid response data");
            }

            const apps = data.applist.apps;

            const game = apps.find(
                (app) => app.name.toLowerCase() === gameName.toLowerCase(),
            );

            if (game) {
                return game.appid;
            } else {
                throw new Error(`Game "${gameName}" not found.`);
            }
        })
        .catch((error) => {
            throw new Error(`An error occurred: ${error.message}`);
        });
}

function getGameDetails(appid) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;

    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch data. Status: ${response.status}`,
                );
            }

            return response.json();
        })
        .then((data) => {
            const gameDetails = data[appid];

            if (!gameDetails || !gameDetails.success) {
                throw new Error("Game details not available.");
            }

            return gameDetails.data;
        })
        .catch((error) => {
            console.error(`An error occurred: ${error.message}`);
            return null;
        });
}

function saveToFile(appId, data) {
    const fileName = `info//${appId}.json`;
    fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(`Failed to save data to ${fileName}:`, err.message);
        } else {
            console.log(`Data successfully saved to ${fileName}`);
        }
    });
}

// Example usage:
const gameName = "Rocket League";
getGameIdByName(gameName)
    .then((appId) => {
        console.log(`App ID for "${gameName}":`, appId);
        return getGameDetails(appId).then((gameDetails) => {
            if (gameDetails) {
                saveToFile(appId, gameDetails); // Save using app ID as filename
            } else {
                console.log("Game details not found.");
            }
        });
    })
    .catch((error) => {
        console.error(error.message);
    });
module.exports = getGameDetails;
