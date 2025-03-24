function startMemoryGame(containerName, numPictures, timeLimit, turnLimit) {
    const container = document.getElementById(containerName);
    container.innerHTML = ""; // Clear any previous content
    container.style.position = "relative";
    container.style.display = "grid";
    container.style.justifyItems = "center";
    container.style.alignItems = "center";
    
    // Predefined set of picture links
    const allImages = [];
    for (let i = 1; i <= 20; i++) {
        // Convert number to a two-digit string (e.g., 1 becomes "01")
        const padded = i.toString().padStart(2, "0");
        allImages.push(`img/memcard${padded}.jpg`);
    }
    // Limit the number of pictures if needed
    const availableCount = Math.min(numPictures, allImages.length);
    
    // Shuffle and pick a random subset of images
    const selectedImages = shuffleArray(allImages.slice()).slice(0, availableCount);
    
    // Create an array of tile objects; each image appears twice
    const tiles = [];
    selectedImages.forEach(img => {
        tiles.push({ image: img, matched: false, element: null });
        tiles.push({ image: img, matched: false, element: null });
    });
    
    // Shuffle the tiles randomly
    shuffleArray(tiles);
    
    // Calculate grid dimensions based on total number of tiles
    const totalTiles = tiles.length;
    const columns = Math.ceil(Math.sqrt(totalTiles));
    const rows = Math.ceil(totalTiles / columns);
    
    // Here, we compute each card's width from the container's width
    // and set the height to maintain a 300 (width) x 400 (height) ratio (i.e., height = width * (400/300))
    const cardWidth = container.clientWidth / columns;
    const cardHeight = cardWidth * (360 / 640);
    
    // Set the grid layout with fixed sizes for consistency
    container.style.gridTemplateColumns = `repeat(${columns}, ${cardWidth}px)`;
    container.style.gridTemplateRows = `repeat(${rows}, ${cardHeight}px)`;
    
    // Create card elements for each tile
    tiles.forEach((tile, index) => {
        const card = document.createElement("div");
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
        card.style.border = "1px solid #ccc";
        card.style.boxSizing = "border-box";
        card.style.cursor = "pointer";
        card.style.backgroundColor = "#888"; // Back face color
        card.style.display = "flex";
        card.style.justifyContent = "center";
        card.style.alignItems = "center";
        card.style.fontSize = "2em";
        card.dataset.index = index;
        
        // Click handler to flip the card
        card.addEventListener("click", function() {
            if (card.classList.contains("flipped") || tile.matched || !gameActive) return;
            flipTile(tile, card);
        });
        
        container.appendChild(card);
        tile.element = card;
    });
    
    // Game state variables
    let turnsUsed = 0;
    let flippedCards = []; // Track currently flipped cards
    let gameActive = true;
    
    // Create an infoBox to display remaining turns and time
    const infoBox = document.createElement("div");
    infoBox.style.position = "absolute";
    infoBox.style.top = "5px";
    infoBox.style.left = "50%";
    infoBox.style.transform = "translateX(-50%)";
    infoBox.style.color = "white";
    infoBox.style.backgroundColor = "rgba(0,0,0,0.7)";
    infoBox.style.padding = "5px 10px";
    infoBox.style.borderRadius = "5px";
    container.appendChild(infoBox);
    updateInfoBox();
    
    // Countdown timer
    const timerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLimit--;
        updateInfoBox();
        if (timeLimit <= 0) {
            endGame(false, "Aika loppui!");
        }
    }, 1000);
    
    function updateInfoBox() {
        infoBox.innerHTML = `Siirtoja jäljellä: ${turnLimit - turnsUsed} | Aikaa jäljellä: ${timeLimit}s`;
    }
    
    // Function to flip a card and reveal its image
    function flipTile(tile, card) {
        card.classList.add("flipped");
        card.style.backgroundImage = `url(${tile.image})`;
        card.style.backgroundSize = "cover";
        flippedCards.push({ tile, card });
        
        // When two cards are flipped, check for a match
        if (flippedCards.length === 2) {
            turnsUsed++;
            updateInfoBox();
            if (flippedCards[0].tile.image === flippedCards[1].tile.image) {
                
                flippedCards[0].tile.matched = true;
                flippedCards[1].tile.matched = true;
                flippedCards = [];
                // Check if the player has matched all pairs
                if (tiles.every(t => t.matched)) {
                    endGame(true, "Sinä voitit!");
                }
            } else {
                // No match: flip the cards back after a short delay
                setTimeout(() => {
                    flippedCards.forEach(item => {
                        item.card.classList.remove("flipped");
                        item.card.style.backgroundImage = "";
                        item.card.style.backgroundColor = "#888";
                    });
                    flippedCards = [];
                    if (turnsUsed >= turnLimit) {
                        endGame(false, "Vuorot loppuivat!");
                    }
                }, 1000);
            }
        }
    }
    
    function endGame(success, message) {
        gameActive = false;
        clearInterval(timerInterval); // Stop the timer
        infoBox.innerHTML = message;
         
        // After 2 seconds, reserved for saving etc.
        //setTimeout(() => {
        //    alert("2");
        //}, 2000);
    }

    // Utility function to shuffle an array in place
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}