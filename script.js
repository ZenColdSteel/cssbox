const apiKey = "bd5d0b340aa24e8bb1c6c5d8c6a49ebc";
const generateButton = document.getElementById("generate-btn");
const displayDiv = document.getElementById("display");

function fetchMeal() {
    return fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then((response) => response.json())
        .then((data) => {
            const meal = data.meals[0];
            return {
                title: meal.strMeal,
                image: meal.strMealThumb,
                link:
                    meal.strSource ||
                    `https://www.themealdb.com/meal/${meal.idMeal}`,
            };
        });
}

function fetchDessert() {
    return fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=dessert&number=10&apiKey=${apiKey}`,
    )
        .then((response) => response.json())
        .then((data) => {
            const desserts = data.results;
            const randomDessert =
                desserts[Math.floor(Math.random() * desserts.length)];
            return {
                title: randomDessert.title,
                image: randomDessert.image,
                link: `https://spoonacular.com/recipes/${randomDessert.title}-${randomDessert.id}`,
            };
        });
}

function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.className = "recipe";

    const title = document.createElement("h2");
    title.textContent = recipe.title;

    const image = document.createElement("img");
    image.src = recipe.image;
    image.alt = recipe.title;

    const link = document.createElement("a");
    link.href = recipe.link;
    link.textContent = "Voir la recette complète";
    link.target = "_blank";

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(link);

    return card;
}

generateButton.addEventListener("click", () => {
    displayDiv.innerHTML = "";

    Promise.all([fetchMeal(), fetchDessert()])
        .then(([meal, dessert]) => {
            const mealCard = createRecipeCard(meal);
            const dessertCard = createRecipeCard(dessert);

            displayDiv.appendChild(mealCard);
            displayDiv.appendChild(dessertCard);
        })
        .catch((error) => {
            console.error("Erreur:", error);
            displayDiv.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
        });
});
