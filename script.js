
const card = document.getElementById("card");
const home = document.getElementById("card-home");
const zones = document.querySelectorAll(".zone");
const message = document.getElementById("message");
const reset = document.getElementById("reset");

let selected = false;

card.addEventListener("dragstart", event => {
  event.dataTransfer.setData("text/plain", "card");
});

zones.forEach(zone => {

  zone.addEventListener("dragover", event => {
    event.preventDefault();
  });

  zone.addEventListener("drop", event => {
    event.preventDefault();
    placeCard(zone);
  });

  zone.addEventListener("click", () => {
    if (selected) placeCard(zone);
  });
});

card.addEventListener("click", () => {
  selected = !selected;
  message.textContent = selected
    ? "Now select a box!"
    : "Card deselected.";
});

function placeCard(zone) {
  zone.appendChild(card);
  selected = false;

  message.textContent =
    "You placed the card in " +
    zone.dataset.answer.toUpperCase() + "! 🎉";
}

reset.addEventListener("click", () => {
  home.appendChild(card);
  selected = false;
  message.textContent = "Waiting for you...";
});
