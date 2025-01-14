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

// Example usage:
const gameName = "Rocket League";
getGameIdByName(gameName)
    .then((appId) => console.log(`App ID for "${gameName}":`, appId))
    .catch((error) => console.error(error));
