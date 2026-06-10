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

const cleanupEvents = [
  {
    id: "sr419-june",
    date: null,
    title: "State Road 419 Cleanup",
    location: "711 Lockwood Blvd, Oviedo, FL 32765",
    note: "Roadside cleanup focused on litter near SR-419. Bring water and closed-toe shoes."
  },
  {
    id: "jamestown-june",
    date: null,
    title: "Jamestown Park Cleanup",
    location: "2135 South St, Oviedo, FL 32765",
    note: "Park cleanup around shared walking and play areas."
  },
  {
    id: "roundlake-july",
    date: null,
    title: "Round Lake Park Cleanup",
    location: "891 E Broadway St, Oviedo, FL 32765",
    note: "Volunteer cleanup for park paths, grass areas, and nearby litter spots."
  },
  {
    id: "sweetwater-july",
    date: null,
    title: "Sweetwater Park Cleanup",
    location: "201 E Magnolia St, Oviedo, FL 32765",
    note: "Cleanup near playground and picnic areas to keep the park welcoming."
  }
];

const signupUrl = "https://docs.google.com/forms/d/e/1FAIpQLScb3mp0ICJyc5-p12lUCVlRZeCVkxLiDZQP1HpJUx7Z0FE2fQ/viewform?usp=publish-editor";
let visibleMonth = new Date(2026, 5, 1);

const selectedName = document.querySelector("#selected-name");
const selectedAddress = document.querySelector("#selected-address");
const selectedMapLink = document.querySelector("#selected-map-link");
const pins = document.querySelectorAll(".map-pin");
const cards = document.querySelectorAll("[data-location-card]");
const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector("#calendar-grid");
const prevMonth = document.querySelector("#prev-month");
const nextMonth = document.querySelector("#next-month");
const eventTitle = document.querySelector("#event-title");
const eventDate = document.querySelector("#event-date");
const eventLocation = document.querySelector("#event-location");
const eventNote = document.querySelector("#event-note");
const eventSignup = document.querySelector("#event-signup");

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

function formatEventDate(dateString) {
  if (!dateString) return "Date to be determined";

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function selectEvent(eventId) {
  const event = cleanupEvents.find((item) => item.id === eventId);
  if (!event) return;

  eventTitle.textContent = event.title;
  eventDate.textContent = formatEventDate(event.date);
  eventLocation.textContent = event.location;
  eventNote.textContent = event.note;
  eventSignup.href = signupUrl;

  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.classList.toggle("active", day.dataset.eventId === eventId);
  });
}

function renderCalendar() {
  if (!calendarGrid || !calendarTitle) return;

  calendarGrid.innerHTML = "";
  calendarGrid.classList.remove("tbd-list");

  const datesAreTbd = cleanupEvents.every((event) => !event.date);
  if (datesAreTbd) {
    calendarTitle.textContent = "Dates to be determined";
    prevMonth.disabled = true;
    nextMonth.disabled = true;
    calendarGrid.classList.add("tbd-list");

    cleanupEvents.forEach((event) => {
      const eventButton = document.createElement("button");
      eventButton.type = "button";
      eventButton.className = "calendar-day has-event";
      eventButton.dataset.eventId = event.id;
      eventButton.setAttribute("aria-label", `${event.title}, date to be determined`);
      eventButton.innerHTML = `
        <span class="calendar-tbd">TBD</span>
        <span class="calendar-event-dot"></span>
        <span class="calendar-event-label">${event.title}</span>
      `;
      eventButton.addEventListener("click", () => selectEvent(event.id));
      calendarGrid.appendChild(eventButton);
    });

    selectEvent(cleanupEvents[0].id);
    return;
  }

  prevMonth.disabled = false;
  nextMonth.disabled = false;
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthEvents = cleanupEvents.filter((event) => {
    if (!event.date) return false;
    const [eventYear, eventMonth] = event.date.split("-").map(Number);
    return eventYear === year && eventMonth === month + 1;
  });

  calendarTitle.textContent = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day is-empty";
    calendarGrid.appendChild(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const event = monthEvents.find((item) => item.date === dateKey);
    const dayButton = document.createElement(event ? "button" : "div");
    dayButton.className = event ? "calendar-day has-event" : "calendar-day";
    dayButton.innerHTML = `<span class="calendar-day-number">${day}</span>`;

    if (event) {
      dayButton.type = "button";
      dayButton.dataset.eventId = event.id;
      dayButton.setAttribute("aria-label", `${event.title}, ${formatEventDate(event.date)}`);
      dayButton.innerHTML += `<span class="calendar-event-dot"></span><span class="calendar-event-label">${event.title.replace(" Cleanup", "")}</span>`;
      dayButton.addEventListener("click", () => selectEvent(event.id));
    }

    calendarGrid.appendChild(dayButton);
  }

  const firstEvent = monthEvents[0] || cleanupEvents[0];
  if (firstEvent) selectEvent(firstEvent.id);
}

prevMonth?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonth?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();
