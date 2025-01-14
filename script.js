// fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15")
//     .then((response) => response.json())
//     .then((data) => {
//         console.log(data);
//         const charactersDiv = document.getElementById("characters");

//         data.items.forEach((character) => {
//             const card = document.createElement("div");
//             card.classList.add("card");
//             const img = document.createElement("img");
//             img.src = character.image;
//             card.appendChild(img);
//             const h2 = document.createElement("h2");
//             h2.textContent = character.name;
//             card.appendChild(h2);
//             charactersDiv.appendChild(card);
//         });
//     })
//     .catch((error) => console.error(error));
fetch("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15")
    .then((response) => response.json())
    .then((data) => {
        console.log(data.gameID);
    })
    .catch((error) => console.error(error));
