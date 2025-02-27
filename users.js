import { logError } from "../utils/logger.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Connexion à la base de données
async function getDBConnection() {
    return open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });
}

// Route principale pour gérer les requêtes utilisateurs
export async function handleUserRequest(req, res) {
    const urlParts = req.url.split("/").filter(Boolean);
    const id = urlParts.length > 1 ? urlParts[1] : null;

    try {
        if (req.method === "GET" && !id) {
            await getAllUsers(req, res);
        } else if (req.method === "GET" && id && urlParts[2] === "articles") {
            await getUserWithArticles(req, res, id);
        } else if (req.method === "GET" && id) {
            await getUserById(req, res, id);
        } else if (req.method === "POST") {
            await createUser(req, res);
        } else if (req.method === "PUT" && id) {
            await updateUser(req, res, id);
        } else if (req.method === "DELETE" && id) {
            await deleteUser(req, res, id);
        } else if (req.method === "OPTIONS") {
            // Gérer les options si nécessaire
        } else {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
        }
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

// Récupérer tous les utilisateurs
async function getAllUsers(req, res) {
    try {
        const db = await getDBConnection();
        const users = await db.all("SELECT * FROM users");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
    } catch (error) {
        console.error("database error", error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to fetch users" }));
    }
}

// Récupérer un utilisateur par ID
async function getUserById(req, res, id) {
    try {
        const db = await getDBConnection();
        const user = await db.get("SELECT * FROM users WHERE id = ?", [
            parseInt(id),
        ]);

        if (!user) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "User not found" }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to fetch user" }));
    }
}

// Créer un nouvel utilisateur
async function createUser(req, res) {
    try {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            const { name, email } = JSON.parse(body);

            if (!name || !email) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: "name and email are required",
                    }),
                );
                return;
            }

            const db = await getDBConnection();
            const result = await db.run(
                "INSERT INTO users (name, email) VALUES (?, ?)",
                [name, email],
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ id: result.lastID, name, email }));
        });
    } catch (error) {
        console.error("database error", error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to create user" }));
    }
}

// Mettre à jour un utilisateur existant
async function updateUser(req, res, id) {
    try {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            const { name, email } = JSON.parse(body);

            if (!name || !email) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: "name and email are required",
                    }),
                );
                return;
            }

            const db = await getDBConnection();
            const result = await db.run(
                "UPDATE users SET name = ?, email = ? WHERE id = ?",
                [name, email, id],
            );

            if (result.changes === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: "User not found" }));
                return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ id, name, email }));
        });
    } catch (error) {
        console.error("database error", error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to update user" }));
    }
}

// Supprimer un utilisateur
async function deleteUser(req, res, id) {
    try {
        const db = await getDBConnection();
        const result = await db.run("DELETE FROM users WHERE id = ?", [
            parseInt(id),
        ]);

        if (result.changes === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "User not found" }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ message: "User deleted successfully" }));
    } catch (error) {
        console.error("database error", error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to delete user" }));
    }
}
// Récupérer un utilisateur avec ses articles par ID
async function getUserWithArticles(req, res, id) {
    try {
        const db = await getDBConnection();

        // Récupérer l'utilisateur
        const user = await db.get("SELECT * FROM users WHERE id = ?", [
            parseInt(id),
        ]);
        if (!user) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "User not found" }));
            return;
        }

        // Récupérer les articles de l'utilisateur
        const articles = await db.all(
            "SELECT * FROM articles WHERE user_id = ?",
            [parseInt(id)],
        );

        // Envoyer la réponse avec l'utilisateur et ses articles
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ...user, articles }));
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to fetch user and articles" }));
    }
}
