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

// Paste your Google Apps Script Web App URL here after setup.
// Until then, the site uses the fallback cleanup opportunities below.
const EVENTS_API_URL = "https://script.google.com/macros/s/AKfycbyDtWNn2yjAJH5SOyQ-ethm21GXtYdRfz6hv6BLixc4dVJRyunNJL4IoXwhQPERpY8/exec";

let cleanupEvents = [
  {
    id: "sr419-june",
    date: null,
    title: "State Road 419 Cleanup",
    location: "711 Lockwood Blvd, Oviedo, FL 32765",
    note: "Roadside cleanup focused on litter near SR-419. Bring water and closed-toe shoes.",
    participantCount: 0
  },
  {
    id: "jamestown-june",
    date: null,
    title: "Jamestown Park Cleanup",
    location: "2135 South St, Oviedo, FL 32765",
    note: "Park cleanup around shared walking and play areas.",
    participantCount: 0
  },
  {
    id: "roundlake-july",
    date: null,
    title: "Round Lake Park Cleanup",
    location: "891 E Broadway St, Oviedo, FL 32765",
    note: "Volunteer cleanup for park paths, grass areas, and nearby litter spots.",
    participantCount: 0
  },
  {
    id: "sweetwater-july",
    date: null,
    title: "Sweetwater Park Cleanup",
    location: "201 E Magnolia St, Oviedo, FL 32765",
    note: "Cleanup near playground and picnic areas to keep the park welcoming.",
    participantCount: 0
  }
];

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
const eventParticipants = document.querySelector("#event-participants");
const eventSignup = document.querySelector("#event-signup");
const signupForm = document.querySelector("#cleanup-signup-form");
const signupStatus = document.querySelector("#signup-status");
const hostForm = document.querySelector("#host-cleanup-form");
const hostStatus = document.querySelector("#host-status");
const showHostForm = document.querySelector("#show-host-form");
let selectedEventId = cleanupEvents[0]?.id;

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
  const normalizedDate = normalizeEventDate(dateString);
  if (!normalizedDate) return "Date to be determined";

  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function normalizeEventDate(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }

  const text = String(value).trim();
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return null;
}

function selectEvent(eventId) {
  const event = cleanupEvents.find((item) => item.id === eventId);
  if (!event) return;

  selectedEventId = event.id;
  eventTitle.textContent = event.title;
  eventDate.textContent = formatEventDate(event.date);
  eventLocation.textContent = event.location;
  eventNote.textContent = event.note;
  eventParticipants.textContent = `${event.participantCount || 0} participants signed up`;
  eventSignup.href = "#cleanup-signup-form";
  signupForm?.classList.toggle("is-ready", Boolean(EVENTS_API_URL));

  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.classList.toggle("active", day.dataset.eventId === eventId);
  });
}

function renderCalendar() {
  if (!calendarGrid || !calendarTitle) return;

  calendarGrid.innerHTML = "";
  calendarGrid.classList.remove("tbd-list");
  calendarGrid.closest(".calendar-panel")?.classList.remove("tbd-mode");

  const datesAreTbd = cleanupEvents.every((event) => !normalizeEventDate(event.date));
  if (datesAreTbd) {
    calendarTitle.textContent = "Dates to be determined";
    prevMonth.disabled = true;
    nextMonth.disabled = true;
    calendarGrid.classList.add("tbd-list");
    calendarGrid.closest(".calendar-panel")?.classList.add("tbd-mode");

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
        <span class="calendar-participants">${event.participantCount || 0} signed up</span>
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
    const normalizedDate = normalizeEventDate(event.date);
    if (!normalizedDate) return false;
    const [eventYear, eventMonth] = normalizedDate.split("-").map(Number);
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
    const event = monthEvents.find((item) => normalizeEventDate(item.date) === dateKey);
    const dayButton = document.createElement(event ? "button" : "div");
    dayButton.className = event ? "calendar-day has-event" : "calendar-day";
    dayButton.innerHTML = `<span class="calendar-day-number">${day}</span>`;

    if (event) {
      dayButton.type = "button";
      dayButton.dataset.eventId = event.id;
      dayButton.setAttribute("aria-label", `${event.title}, ${formatEventDate(event.date)}`);
      dayButton.innerHTML += `<span class="calendar-event-dot"></span><span class="calendar-event-label">${event.title.replace(" Cleanup", "")}</span>`;
      dayButton.innerHTML += `<span class="calendar-participants">${event.participantCount || 0} signed up</span>`;
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

eventSignup?.addEventListener("click", (event) => {
  event.preventDefault();
  signupForm?.classList.add("is-ready");
  signupForm?.scrollIntoView({ behavior: "smooth", block: "center" });
  signupForm?.querySelector("input")?.focus({ preventScroll: true });
});

function submitToApi(payload) {
  if (!EVENTS_API_URL) {
    return Promise.reject(new Error("The event backend is not connected yet."));
  }

  return fetch(EVENTS_API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });
}

async function loadEventsFromApi() {
  if (!EVENTS_API_URL) return;

  return new Promise((resolve) => {
    const callbackName = `sweepEvents${Date.now()}`;
    const script = document.createElement("script");
    const separator = EVENTS_API_URL.includes("?") ? "&" : "?";

    window[callbackName] = (data) => {
      if (Array.isArray(data.events) && data.events.length > 0) {
        cleanupEvents = data.events.map((event) => ({
          id: event.id,
          date: normalizeEventDate(event.date),
          title: event.title,
          location: event.location,
          note: event.note || "Details will be shared before the cleanup.",
          participantCount: Number(event.participantCount || 0)
        }));

        const firstDatedEvent = cleanupEvents.find((event) => normalizeEventDate(event.date));
        if (firstDatedEvent) {
          const [year, month] = normalizeEventDate(firstDatedEvent.date).split("-").map(Number);
          visibleMonth = new Date(year, month - 1, 1);
        }
      }

      delete window[callbackName];
      script.remove();
      resolve();
    };

    script.onerror = () => {
      console.warn("Could not load cleanup events.");
      delete window[callbackName];
      script.remove();
      resolve();
    };

    script.src = `${EVENTS_API_URL}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  signupStatus.textContent = "Submitting signup...";

  try {
    await submitToApi({
      action: "signup",
      eventId: selectedEventId,
      name: formData.get("name"),
      email: formData.get("email")
    });

    signupForm.reset();
    signupStatus.textContent = "Signup sent. The participant count will update after the sheet refreshes.";
    const selectedEvent = cleanupEvents.find((item) => item.id === selectedEventId);
    if (selectedEvent) {
      selectedEvent.participantCount = Number(selectedEvent.participantCount || 0) + 1;
      renderCalendar();
      selectEvent(selectedEvent.id);
    }
  } catch (error) {
    signupStatus.textContent = error.message;
  }
});

showHostForm?.addEventListener("click", () => {
  hostForm?.classList.toggle("is-open");
  hostForm?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

hostForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(hostForm);
  hostStatus.textContent = "Submitting cleanup request...";

  try {
    await submitToApi({
      action: "host",
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      organizerName: formData.get("organizerName"),
      organizerEmail: formData.get("organizerEmail"),
      note: formData.get("note")
    });

    hostForm.reset();
    hostStatus.textContent = "Request sent. Nathan will review it before it appears on the calendar.";
  } catch (error) {
    hostStatus.textContent = error.message;
  }
});

loadEventsFromApi().finally(renderCalendar);
