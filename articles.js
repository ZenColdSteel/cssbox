import { logError } from "../utils/logger.js";
import { openDb } from "../utils/db.js";

// Route principale pour gérer les requêtes
export async function handleRequest(req, res) {
    const urlParts = req.url.split("/").filter(Boolean); // Divise l'URL en segments
    const id = urlParts.length > 1 ? urlParts[1] : null;

    try {
        if (req.method === "GET" && !id) {
            await getAllArticles(req, res);
        } else if (req.method === "GET" && id) {
            await getArticleById(req, res, id);
        } else if (req.method === "POST") {
            await createArticle(req, res);
        } else if (req.method === "PUT" && id) {
            await updateArticle(req, res, id);
        } else if (req.method === "DELETE" && id) {
            await deleteArticle(req, res, id);
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

// Récupérer tous les articles avec les infos de l’auteur
async function getAllArticles(req, res) {
    try {
        const db = await openDb();
        const articles = await db.all(`
            SELECT articles.*, users.name 
            FROM articles 
            LEFT JOIN users ON articles.user_id = users.id
        `);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(articles));
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to fetch articles" }));
    }
}

// Récupérer un article par ID avec l’auteur
async function getArticleById(req, res, id) {
    try {
        const db = await openDb();
        const article = await db.get(
            `
            SELECT articles.*, users.name
            FROM articles 
            LEFT JOIN users ON articles.user_id = users.id 
            WHERE articles.id = ?
        `,
            [parseInt(id) || id],
        );

        if (!article) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Article not found" }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(article));
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to fetch article" }));
    }
}

// Créer un nouvel article (avec user_id)
async function createArticle(req, res) {
    try {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            const { title, content, user_id } = JSON.parse(body);

            if (!title || !content || !user_id) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: "Title, content, and user_id are required",
                    }),
                );
                return;
            }

            const db = await openDb();

            // Vérifier que l'utilisateur existe
            const user = await db.get("SELECT * FROM users WHERE id = ?", [
                user_id,
            ]);
            if (!user) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid user_id" }));
                return;
            }

            const result = await db.run(
                "INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)",
                [title, content, user_id],
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({ id: result.lastID, title, content, user_id }),
            );
        });
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to add article" }));
    }
}

// Mettre à jour un article existant (avec user_id)
async function updateArticle(req, res, id) {
    try {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            const { title, content, user_id } = JSON.parse(body);

            if (!title || !content || !user_id) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: "Title, content, and user_id are required",
                    }),
                );
                return;
            }

            const db = await openDb();

            // Vérifier que l'utilisateur existe
            const user = await db.get("SELECT * FROM users WHERE id = ?", [
                user_id,
            ]);
            if (!user) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid user_id" }));
                return;
            }

            const result = await db.run(
                "UPDATE articles SET title = ?, content = ?, user_id = ? WHERE id = ?",
                [title, content, user_id, id],
            );

            if (result.changes === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: "Article not found" }));
                return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ id, title, content, user_id }));
        });
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to update article" }));
    }
}

// Supprimer un article
async function deleteArticle(req, res, id) {
    try {
        const db = await openDb();
        const result = await db.run("DELETE FROM articles WHERE id = ?", [id]);

        if (result.changes === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Article not found" }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ message: "Article deleted successfully" }));
    } catch (error) {
        await logError(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to delete article" }));
    }
}
