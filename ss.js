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

// // Example usage:
// const appid = 570; // Dota 2
// getGameDetails(appid)
//     .then((gameDetails) => {
//         if (gameDetails) {
//             console.log(gameDetails);
//         } else {
//             console.log("Game details not found.");
//         }
//     })
//     .catch((error) => {
//         console.error(error.message);
//     });
// // Example usage:
// const gameName = "Rocket League";
// getGameIdByName(gameName)
//     .then((appId) => {
//         console.log(`App ID for "${gameName}":`, appId);
//     })
//     .catch((error) => {
//         console.error(error.message);
//     });
// Example usage:
const gameName = "Dota 2";

Promise.all([getGameIdByName(gameName), getGameDetails(570)])
    .then((results) => {
        const appid = results[0];
        const gameDetails = results[1];

        if (appid && gameDetails) {
            console.log(gameDetails);
        } else {
            console.log("Game details not found.");
        }
    })
    .catch((error) => {
        console.error(error.message);
    });
