
const cardData = [
  { word: "Kangaroo", category: "animal" },
  { word: "Dolphin", category: "animal" },
  { word: "Elephant", category: "animal" },
  { word: "Wombat", category: "animal" },
  { word: "Kookaburra", category: "animal" },

  { word: "Apple", category: "fruit" },
  { word: "Banana", category: "fruit" },
  { word: "Mango", category: "fruit" },
  { word: "Orange", category: "fruit" },
  { word: "Pear", category: "fruit" },

  { word: "Running", category: "action" },
  { word: "Jumping", category: "action" },
  { word: "Swimming", category: "action" },
  { word: "Singing", category: "action" },
  { word: "Dancing", category: "action" },

  { word: "Sarah", category: "name" },
  { word: "Michael", category: "name" },
  { word: "Olivia", category: "name" },
  { word: "James", category: "name" },
  { word: "Emily", category: "name" }
];

const categoryInfo = {
  animal: {
    title: "🐨 Animals",
    text: "Animals are living things. They need food, water and suitable environments to survive. Animals include mammals, birds, fish, reptiles and insects."
  },

  fruit: {
    title: "🍎 Fruit",
    text: "Fruits develop from flowers and usually contain seeds. Many fruits are edible and grow on trees, bushes or other plants. However, not all fruits are safe to eat."
  },

  action: {
    title: "🏃 Actions",
    text: "An action is something that someone or something does. Running, jumping, swimming and singing are all examples of actions."
  },

  name: {
    title: "👧 Names",
    text: "A name identifies a particular person, animal or place. Sarah, Michael, Olivia, James and Emily are examples of people's names."
  }
};

const tray = document.getElementById("card-tray");
const zones = document.querySelectorAll(".drop-zone");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset");

const modal = document.getElementById("info-modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const closeModal = document.getElementById("close-modal");
const modalOK = document.getElementById("modal-ok");

let selectedCard = null;
let draggedCard = null;
let feedbackTimer = null;
let gameComplete = false;

// Shuffle cards into a random order
function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Create an individual draggable card
function createCard(item) {
  const card = document.createElement("button");

  card.className = "card";
  card.type = "button";
  card.textContent = item.word;
  card.draggable = true;

  card.dataset.category = item.category;
  card.setAttribute("aria-pressed", "false");

  // Desktop dragging
  card.addEventListener("dragstart", event => {
    if (gameComplete) {
      event.preventDefault();
      return;
    }

    draggedCard = card;
    selectedCard = card;

    event.dataTransfer.setData("text/plain", item.word);
    event.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("dragend", () => {
    draggedCard = null;

    zones.forEach(zone => {
      zone.classList.remove("drag-over");
    });
  });

  // Touchscreen and mouse selection
  card.addEventListener("click", event => {
    event.stopPropagation();

    if (gameComplete) return;

    if (selectedCard === card) {
      selectedCard = null;
      card.classList.remove("selected");
      card.setAttribute("aria-pressed", "false");
      return;
    }

    selectCard(card);
  });

  return card;
}

// Select a card
function selectCard(card) {
  if (gameComplete) return;

  if (selectedCard) {
    selectedCard.classList.remove("selected");
    selectedCard.setAttribute("aria-pressed", "false");
  }

  selectedCard = card;

  card.classList.add("selected");
  card.setAttribute("aria-pressed", "true");

  clearFeedback();

  message.textContent =
    "Card selected: " + card.textContent +
    ". Now choose a category.";
}

// Remove previous answer colours
function clearFeedback() {
  clearTimeout(feedbackTimer);

  zones.forEach(zone => {
    zone.classList.remove("correct", "incorrect", "drag-over");
  });

  message.classList.remove("success", "encouragement");
}

// Move a card into a new location
function moveCard(card, destination) {
  if (!card || gameComplete) return;

  clearFeedback();

  card.classList.remove("selected");
  card.setAttribute("aria-pressed", "false");

  destination.appendChild(card);

  selectedCard = null;
  draggedCard = null;

  const placedCards = document.querySelectorAll(
    ".zone-cards .card"
  ).length;

  const totalCards = document.querySelectorAll(".card").length;

  if (placedCards === totalCards) {
    message.textContent = "Checking your answers...";
    checkAnswers();
  } else {
    message.textContent =
      "Good work! " + placedCards +
      " of " + totalCards + " cards sorted.";
  }
}

// Check all cards once they have been placed
function checkAnswers() {
  const allCards = document.querySelectorAll(".card");

  const allPlaced = [...allCards].every(card =>
    card.parentElement.classList.contains("zone-cards")
  );

  if (!allPlaced) return;

  let everythingCorrect = true;

  zones.forEach(zone => {
    const category = zone.dataset.category;

    const cardsInZone = zone.querySelectorAll(".card");

    const zoneCorrect =
      cardsInZone.length > 0 &&
      [...cardsInZone].every(card =>
        card.dataset.category === category
      );

    if (zoneCorrect) {
      zone.classList.add("correct");
    } else {
      zone.classList.add("incorrect");
      everythingCorrect = false;
    }
  });

  if (everythingCorrect) {
    celebrate();
  } else {
    message.textContent =
      "Some cards are in the wrong categories.";

    feedbackTimer = setTimeout(() => {
      zones.forEach(zone => {
        zone.classList.remove("correct", "incorrect");
      });

      message.textContent =
        "Keep going! Move the cards you want to change.";

      message.classList.add("encouragement");

    }, 2200);
  }
}

// All answers correct!
function celebrate() {
  gameComplete = true;

  message.classList.remove("encouragement");
  message.classList.add("success");

  message.textContent =
    "🎉 Fantastic work! All 20 cards are correct! 🎉";

  zones.forEach(zone => {
    zone.classList.remove("incorrect");
    zone.classList.add("correct");
  });
}

// Allow dragging into the four categories
zones.forEach(zone => {

  zone.addEventListener("dragover", event => {
    event.preventDefault();

    if (!gameComplete) {
      zone.classList.add("drag-over");
    }
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", event => {
    event.preventDefault();

    zone.classList.remove("drag-over");

    const card = draggedCard || selectedCard;

    if (card) {
      moveCard(card, zone.querySelector(".zone-cards"));
    }
  });

  // Touchscreen: select card, then tap category
  zone.addEventListener("click", () => {
    if (selectedCard && !gameComplete) {
      moveCard(
        selectedCard,
        zone.querySelector(".zone-cards")
      );
    }
  });

  // Keyboard support
  zone.setAttribute("tabindex", "0");

  zone.addEventListener("keydown", event => {
    if (
      selectedCard &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();

      moveCard(
        selectedCard,
        zone.querySelector(".zone-cards")
      );
    }
  });
});

// Allow students to return cards to the card tray
tray.addEventListener("dragover", event => {
  event.preventDefault();
});

tray.addEventListener("drop", event => {
  event.preventDefault();

  const card = draggedCard || selectedCard;

  if (card) {
    moveCard(card, tray);
  }
});

tray.addEventListener("click", () => {
  if (selectedCard && !gameComplete) {
    moveCard(selectedCard, tray);
  }
});

// Category information popup
function showInfo(category) {
  const info = categoryInfo[category];

  if (!info) return;

  modalTitle.textContent = info.title;
  modalText.textContent = info.text;

  modal.hidden = false;
  closeModal.focus();
}

document.querySelectorAll(".category-heading").forEach(button => {

  button.addEventListener("click", event => {
    event.stopPropagation();

    const category = button.closest(".drop-zone").dataset.category;

    showInfo(category);
  });
});

function hideInfo() {
  modal.hidden = true;
}

closeModal.addEventListener("click", hideInfo);
modalOK.addEventListener("click", hideInfo);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    hideInfo();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideInfo();
  }
});

// Start or restart the game
function startGame() {
  clearTimeout(feedbackTimer);

  tray.innerHTML = "";

  zones.forEach(zone => {
    zone.querySelector(".zone-cards").innerHTML = "";
    zone.classList.remove("correct", "incorrect", "drag-over");
  });

  selectedCard = null;
  draggedCard = null;
  gameComplete = false;

  message.className = "message";
  message.textContent = "You have 20 cards to sort. Good luck!";

  modal.hidden = true;

  shuffle(cardData).forEach(item => {
    tray.appendChild(createCard(item));
  });
}

resetButton.addEventListener("click", startGame);

// Start the first game
startGame();
