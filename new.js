async function getGameIdByName(gameName) {
    const url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const apps = data.applist.apps;

            // Find the game by name (case-insensitive)
            const game = apps.find(
                (app) => app.name.toLowerCase() === gameName.toLowerCase(),
            );

            if (game) {
                return game.appid; // Return the app ID if found
            } else {
                return `Game "${gameName}" not found.`;
            }
        } else {
            return `Failed to fetch data. Status code: ${response.status}`;
        }
    } catch (error) {
        return `An error occurred: ${error.message}`;
    }
}
async function getGameDetails(appid) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const gameDetails = data[appid];
            if (gameDetails.success) {
                // console.log(gameDetails.data); // Game details object
                return gameDetails.data;
            } else {
                console.error("Game details not available.");
                return null;
            }
        } else {
            console.error(`Failed to fetch data. Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        return null;
    }
}

// Example usage:
console.log(getGameIdByName("Paladins"));

// getGameDetails() // Replace 570 with the desired app ID
//     .then((data) => {
//         if (data) {
//             console.log("Game Details:", data["name"]);
//         }
//     });
