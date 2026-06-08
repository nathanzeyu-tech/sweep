const locations = {
  sr419: {
    name: "State Road 419",
    address: "711 Lockwood Blvd, Oviedo, FL 32765",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=711%20Lockwood%20Blvd%2C%20Oviedo%2C%20FL%2032765"
  },
  jamestown: {
    name: "Jamestown Park",
    address: "2135 South St, Oviedo, FL 32765",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=2135%20South%20St%2C%20Oviedo%2C%20FL%2032765"
  },
  roundlake: {
    name: "Round Lake Park",
    address: "891 E Broadway St, Oviedo, FL 32765",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=891%20E%20Broadway%20St%2C%20Oviedo%2C%20FL%2032765"
  },
  sweetwater: {
    name: "Sweetwater Park",
    address: "201 E Magnolia St, Oviedo, FL 32765",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=201%20E%20Magnolia%20St%2C%20Oviedo%2C%20FL%2032765"
  }
};

const selectedName = document.querySelector("#selected-name");
const selectedAddress = document.querySelector("#selected-address");
const selectedMapLink = document.querySelector("#selected-map-link");
const pins = document.querySelectorAll(".map-pin");
const cards = document.querySelectorAll("[data-location-card]");

function selectLocation(locationId) {
  const location = locations[locationId];
  if (!location) return;

  selectedName.textContent = location.name;
  selectedAddress.textContent = location.address;
  selectedMapLink.href = location.mapUrl;

  pins.forEach((pin) => {
    pin.classList.toggle("active", pin.dataset.location === locationId);
  });

  cards.forEach((card) => {
    card.classList.toggle("active", card.dataset.locationCard === locationId);
  });
}

pins.forEach((pin) => {
  pin.addEventListener("click", () => selectLocation(pin.dataset.location));
});

cards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    selectLocation(card.dataset.locationCard);
  });
});
