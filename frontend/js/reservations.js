// Function to fetch and display the user's guest count
async function loadGuestCount() {
  try {
    const userId = localStorage.getItem("user_id"); // Get the current user's ID
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      const guestCount = userData.guest_count; // Get the guest count from the response
      console.log(`Guest Count for User ${userId}:`, guestCount);

      // Update the guest count display
      const guestCountElement = document.querySelector(".guest-count-number");
      guestCountElement.textContent = guestCount;
    } else {
      console.error("Failed to fetch user data:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

function refreshUpcomingReservationsDisplay() {
  const container = document.querySelector(".display-upcoming-reservations");
  container.innerHTML = `
    <div class="upcoming-reservations-title">Upcoming Reservations</div>
  `;
  loadUpcomingReservations();
}

// Function to generate time options
async function populateTimeOptions(selectElementId) {
  const selectElement = document.getElementById(selectElementId);
  if (!selectElement) {
    console.error(`Element with id "${selectElementId}" not found.`);
    return;
  }

  // Clear existing options
  selectElement.innerHTML = "";
  console.log(`Cleared existing options for ${selectElementId}`);

  // Add the initial placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Please select time";
  placeholderOption.disabled = true; // Make it unselectable
  placeholderOption.selected = true; // Set it as the default selected option
  selectElement.appendChild(placeholderOption);
  console.log("Added placeholder option");

  const startTime = 6; // Start time in hours (6:00 AM)
  const endTime = 20; // End time in hours (8:30 PM)

  // Fetch existing reservations
  const date = document.getElementById("date").value;
  document.getElementById("date").addEventListener("change", function () {
    const selectedDate = this.value; // Get the selected date
    const dateDisplay = document.getElementById("display-date"); // Select the display-date element
    dateDisplay.textContent = selectedDate; // Update the text content with the selected date
  });
  let reservations = [];
  if (date) {
    try {
      console.log(`Fetching reservations for date: ${date}`);
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const reservations = await response.json();
        console.log("Fetched reservations:", reservations);
      } else {
        console.error("Failed to fetch reservations:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  } else {
    console.log("No date selected, skipping reservation fetch");
  }

  // Filter out unavailable times
  for (let hour = startTime; hour <= endTime; hour++) {
    for (let minutes = hour === startTime ? 30 : 0; minutes < 60; minutes += 30) {
      // Stop at 2:30 PM
      if (hour === 14 && minutes > 30) break;

      // Format time as HH:MM
      const time = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      console.log(`Checking availability for time: ${time}`);

      // Check if the time is available
      const isAvailable = !reservations.some(reservation => {
        const reservationStart = reservation.start_time;
        const reservationEnd = reservation.end_time;

        // Rule: Remove the start-time option if it overlaps with any reservation on the same day
        if (reservation.date === date) {
          if (
            (time >= reservationStart && time < reservationEnd) || // Overlaps with an existing reservation
            (parseTimeToMinutes(time) < parseTimeToMinutes(reservationEnd) + 30 && // Within 30 minutes after reservation end time
             parseTimeToMinutes(time) >= parseTimeToMinutes(reservationEnd))
          ) {
            console.log(`Removing start-time option: ${time} because it overlaps with an existing reservation or is within 30 minutes after.`);
            return true;
          }
        }

        return false;
      });

      console.log(`Time: ${time}, Available: ${isAvailable}`);

      if (isAvailable) {
        // Convert to 12-hour format with AM/PM
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayTime = `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;

        // Create and append the option element
        const option = document.createElement("option");
        option.value = time;
        option.textContent = displayTime;
        selectElement.appendChild(option);
        console.log(`Added time option: ${displayTime}`);
      }
    }
  }
}

// Helper function to parse time (HH:MM) to minutes
function parseTimeToMinutes(time) {
  const [hour, minutes] = time.split(":").map(Number);
  return hour * 60 + minutes;
}

// Function to populate end-time options based on selected start-time
async function updateEndTimeOptions() {
  console.log("updateEndTimeOptions called");

  const startTimeSelect = document.getElementById("start-time");
  const endTimeSelect = document.getElementById("end-time");

  // Clear existing options in the end-time select
  endTimeSelect.innerHTML = "";
  console.log("Cleared existing end-time options");

  // Add the initial placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Please select time";
  placeholderOption.disabled = true; // Make it unselectable
  placeholderOption.selected = true; // Set it as the default selected option
  endTimeSelect.appendChild(placeholderOption);
  console.log("Added placeholder option to end-time dropdown");

  // Get the selected start time
  const selectedStartTime = startTimeSelect.value;
  if (!selectedStartTime) {
    console.log("No start time selected, exiting function");
    return;
  }
  console.log(`Selected start time: ${selectedStartTime}`);

  // Parse the selected start time into hours and minutes
  const [startHour, startMinutes] = selectedStartTime.split(":").map(Number);
  console.log(`Parsed start time: ${startHour} hour(s), ${startMinutes} minute(s)`);

  // Fetch existing reservations
  const date = document.getElementById("date").value;
  let reservations = [];
  if (date) {
    try {
      console.log(`Fetching reservations for date: ${date}`);
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        reservations = await response.json();
        console.log("Fetched reservations:", reservations);
      } else {
        console.error("Failed to fetch reservations:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  } else {
    console.log("Date not selected, skipping reservation fetch");
  }

  // Check if there is a reservation 1 hour and 30 minutes before the selected start time across all courts
  let isOneAndHalfHoursBeforeReserved = false;

  reservations.forEach(reservation => {
    if (reservation.date === date) { // Check across all courts
      const reservationStartMinutes = parseTimeToMinutes(reservation.start_time);
      const selectedStartMinutes = parseTimeToMinutes(selectedStartTime);
      const timeDifference = selectedStartMinutes - reservationStartMinutes;

      console.log(`Reservation Start Time (minutes): ${reservationStartMinutes}`);
      console.log(`Selected Start Time (minutes): ${selectedStartMinutes}`);
      console.log(`Time Difference: ${timeDifference}`);

      if (timeDifference === 90) { // 1 hour and 30 minutes before
        console.log(`Reservation found 1 hour and 30 minutes before: ${reservation.start_time}`);
        isOneAndHalfHoursBeforeReserved = true;
      }
    }
  });

  console.log(`Is 1 hour and 30 minutes before reserved: ${isOneAndHalfHoursBeforeReserved}`);

  // Generate end-time options
  const endTimes = [];
  if (isOneAndHalfHoursBeforeReserved) {
    console.log("Reservation 1 hour and 30 minutes before detected, restricting end-time to 1.5 hours after start time");
    // If there is a reservation 1 hour and 30 minutes before, only allow 1.5 hours after the start time
    endTimes.push({
      hour: startHour + Math.floor((startMinutes + 90) / 60),
      minutes: (startMinutes + 90) % 60,
    });
  } else {
    console.log("No restrictions, adding 1.5 hours and 2 hours after start time");
    // Add 1.5 hours after the start time
    const oneAndHalfHoursLater = {
      hour: startHour + Math.floor((startMinutes + 90) / 60),
      minutes: (startMinutes + 90) % 60,
    };

    // Add 2 hours after the start time
    const twoHoursLater = {
      hour: startHour + Math.floor((startMinutes + 120) / 60),
      minutes: (startMinutes + 120) % 60,
    };

    endTimes.push(oneAndHalfHoursLater, twoHoursLater);
  }

  console.log("Generated end-time options:", endTimes);

  // Add the generated end times to the dropdown
  for (const endTime of endTimes) {
    // Format time as HH:MM
    const time = `${endTime.hour.toString().padStart(2, "0")}:${endTime.minutes.toString().padStart(2, "0")}`;
    // Convert to 12-hour format with AM/PM
    const period = endTime.hour < 12 ? "AM" : "PM";
    const displayHour = endTime.hour % 12 === 0 ? 12 : endTime.hour % 12;
    const displayTime = `${displayHour}:${endTime.minutes.toString().padStart(2, "0")} ${period}`;

    console.log(`Adding end-time option: ${displayTime}`);
    // Create and append the option element
    const option = document.createElement("option");
    option.value = time;
    option.textContent = displayTime;
    endTimeSelect.appendChild(option);
  }
}

// Function to fetch and log all reservations
async function logAllReservations() {
  try {
    const response = await fetch("http://localhost:5000/api/reservations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const reservations = await response.json();
      console.log("All Reservations:", reservations);
    } else {
      console.error("Failed to fetch reservations:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching reservations:", error);
  }
}

// Function to fetch reservations and highlight taken time slots for the selected date and court range
async function highlightReservationsForSelectedDate(courtRangeStart, courtRangeEnd) {
  try {
    const selectedDate = document.getElementById("date").value; // Get the selected date
    if (!selectedDate) {
      console.log("No date selected, skipping reservation highlighting.");
      return;
    }

    console.log("Selected Date:", selectedDate);

    const response = await fetch("http://localhost:5000/api/reservations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const reservations = await response.json();
      console.log("Fetched Reservations:", reservations);

      // Reset all time slots to their default background
      const timeSlots = document.querySelectorAll(".display-reservations-time");
      timeSlots.forEach((slot) => {
        slot.style.backgroundColor = ""; // Reset background color
      });

      // Highlight time slots for the selected date and court range
      reservations.forEach((reservation) => {
        if (
          reservation.date === selectedDate &&
          reservation.court_id >= courtRangeStart &&
          reservation.court_id <= courtRangeEnd
        ) {
          console.log(
            `Processing reservation for court_id: ${reservation.court_id}, start_time: ${reservation.start_time}, end_time: ${reservation.end_time}`
          );

          // Map courts 5–8 to 1–4 for display purposes
          let mappedCourtId = reservation.court_id;
          if (reservation.court_id >= 5 && reservation.court_id <= 8) {
            mappedCourtId = reservation.court_id - 4; // Map 5–8 to 1–4
          } else if (reservation.court_id >= 9 && reservation.court_id <= 12) {
            mappedCourtId = reservation.court_id - 8; // Map 9–12 to 1–4
          }

          // Find the corresponding court column
          const courtColumn = document.querySelector(
            `.display-reservations-collumn:nth-child(${mappedCourtId})`
          );

          if (courtColumn) {
            // Loop through all time slots in the court column
            const courtTimeSlots = courtColumn.querySelectorAll(
              ".display-reservations-time"
            );
            courtTimeSlots.forEach((slot) => {
              const slotTime = slot.id; // Use the text content of the time slot (e.g., "6:30 - 7:00")

              // Split the time into start and end times
              const [slotStart, slotEnd] = slotTime.split(" - ");

              if (
                (slotStart >= reservation.start_time &&
                  slotStart < reservation.end_time) || // Slot starts within the reservation
                (slotEnd > reservation.start_time &&
                  slotEnd <= reservation.end_time) // Slot ends within the reservation
              ) {
                console.log(`Highlighting slot: ${slotTime} for court_id: ${mappedCourtId}`);
                // Highlight in light green if the reservation belongs to the current user, otherwise in red
                const currentUserId = parseInt(
                  localStorage.getItem("user_id")
                );
                slot.style.backgroundColor =
                  reservation.user_id === currentUserId
                    ? "#90EE90"
                    : "red";
              }
            });
          } else {
            console.error(
              `Court column not found for mapped court_id: ${mappedCourtId}`
            );
          }
        }
      });
    } else {
      console.error("Failed to fetch reservations:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching reservations:", error);
  }
}

// Function to fetch and display all reservations in the upcoming reservations display
async function loadUpcomingReservations() {
  try {
    const response = await fetch("http://localhost:5000/api/reservations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const reservations = await response.json();
      console.log("Fetched Reservations:", reservations);

      // Add each reservation to the upcoming reservations display
      reservations.forEach((reservation) => {
        addUpcomingReservation({
          reservation_id: reservation.reservation_id,
          court: reservation.court_id,
          date: reservation.date,
          time: `${reservation.start_time} - ${reservation.end_time}`,
          gameType: reservation.game_type.charAt(0).toUpperCase() + reservation.game_type.slice(1), // Capitalize game type
          players: reservation.players || "N/A", // Replace with actual player names if available
        });
      });
    } else {
      console.error("Failed to fetch reservations:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching reservations:", error);
  }
}

// Function to add a new reservation to the upcoming reservations display
function addUpcomingReservation({ court, date, time, gameType, players, reservation_id }) {
  const upcomingReservationsContainer = document.querySelector(".display-upcoming-reservations");

  const reservationElement = document.createElement("div");
  reservationElement.className = "upcoming-reservation";

  reservationElement.innerHTML = `
    <div class="upcoming-reservation-table">
      <div class="upcoming-reservation-court">Court : ${court}</div>
      <div class="upcoming-reservation-date">Date : ${date}</div>
      <div class="upcoming-reservation-time">Time : ${time}</div>
      <div class="upcoming-reservation-game-type">Type : ${gameType}</div>
      <div class="upcoming-reservation-players">Players : ${players}</div>
    </div>
    <div class="upcoming-reservation-table-2">
      <button class="cancel-reservation-button" data-reservation-id="${reservation_id}">Cancel</button>
    </div>
  `;

  // Add listener to cancel button
  const cancelButton = reservationElement.querySelector(".cancel-reservation-button");
  cancelButton.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to cancel this reservation?");
    if (!confirmed) return;

    try {
      const res = await fetch("http://localhost:5000/api/delete-reservation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id })
      });

      const result = await res.json();
      if (res.ok) {
        alert("Reservation canceled!");
        refreshUpcomingReservationsDisplay();
        highlightReservationsForSelectedDate(1, 4);
        loadGuestCount();
      } else {
        alert("Failed to cancel: " + result.error);
      }
    } catch (error) {
      console.error("Error canceling:", error);
      alert("Error occurred while canceling reservation.");
    }
  });

  upcomingReservationsContainer.appendChild(reservationElement);
}

// Function to send email from backend
async function sendEmailFromBackend(email, subject, body) {
  try {
    const response = await fetch("http://localhost:5000/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, subject, body }),
    });

    if (response.ok) {
      console.log("Email sent successfully");
    } else {
      console.error("Failed to send email:", await response.text());
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to send a sample email
async function sendSampleEmail() {
  const email = "moddedsnipping3@gmail.com";
  const subject = "Welcome to the Reservation System!";
  const body = "This is a test email sent from the Reservation System on startup.";

  try {
    const response = await fetch("http://localhost:5000/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, subject, body }),
    });

    if (response.ok) {
      console.log("Sample email sent successfully to", email);
    } else {
      console.error("Failed to send sample email:", await response.text());
    }
  } catch (error) {
    console.error("Error sending sample email:", error);
  }
}

// Call the function on startup
document.addEventListener("DOMContentLoaded", () => {
  sendSampleEmail(); // Send the sample email on startup
  loadUpcomingReservations(); // Load upcoming reservations on startup
  loadGuestCount(); // Load guest count on startup
  logAllReservations(); // Log all reservations on startup
  populateTimeOptions("start-time"); // Populate the start time select
  populateTimeOptions("end-time");   // Populate the end time select (initially)
  highlightReservationsForSelectedDate(1, 4); // Highlight reservations for the default date and court range

  // Add event listener to update end-time options when start-time changes
  document.getElementById("start-time").addEventListener("change", updateEndTimeOptions);

  // Add event listener to update start-time options when court changes
  document.getElementById("court").addEventListener("change", () => {
    populateTimeOptions("start-time"); // Update the start-time options based on the selected court
  });
});

// Call the function when the date is selected
document.getElementById("date").addEventListener("change", () => {
  populateTimeOptions("start-time"); // Update the start-time options based on the selected date
  highlightReservationsForSelectedDate(1, 4);
});

// Call the function when the submit button is clicked
document.getElementById("submit-reservation").addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent the form from submitting

  try {
    // Get the user ID from localStorage
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("User not logged in. Please log in first.");
      return;
    }

    loadGuestCount(); // Load guest count on startup

    // Get the selected date
    const date = document.getElementById("date").value;
    if (!date) {
      alert("Please select a date.");
      return;
    }

    // Fetch the user's existing reservations for the selected date
    let userReservations = [];
    try {
      const response = await fetch(`http://localhost:5000/api/reservations?user_id=${userId}&date=${date}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        userReservations = await response.json();
        console.log(`User's reservations for ${date}:`, userReservations);
      } else {
        alert("Failed to fetch user reservations. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      alert("An error occurred while fetching user reservations.");
      return;
    }

    // Check if the user already has 2 reservations on the same day
    if (userReservations.length >= 2) {
      alert("You cannot place more than 2 reservations on the same day.");
      return;
    }

    // Collect reservation data
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
    const gameType = document.getElementById("game-type").value;
    const court = document.getElementById("court").value;

    if (!startTime || !endTime || !gameType || !court) {
      alert("Please fill in all required fields.");
      return;
    }

    // Collect player entries and emails
    const playerEntries = [];
    const emails = []; // Array to store emails
    document.querySelectorAll(".player-entry").forEach((entry) => {
      const isGuest = entry.querySelector("input[type='checkbox']").checked;

      let playerName = null;
      let email = null;
      if (isGuest) {
        // Get the guest name and email
        const textInput = entry.querySelector("input[type='text']");
        const emailInput = entry.querySelector(".email-input");
        if (textInput) {
          playerName = textInput.value.trim();
        }
        if (emailInput) {
          email = emailInput.value.trim();
        }
      } else {
        // Get the member name and email from the connected user account
        const selectInput = entry.querySelector("input[type='hidden']");
        if (selectInput) {
          playerName = selectInput.dataset.name;
          email = selectInput.dataset.email; // Assume the email is stored in a data attribute
        }
      }

      if (playerName) {
        playerEntries.push({
          player_name: playerName,
          is_guest: isGuest,
          email: email,
        });

        if (email) {
          emails.push(email); // Add the email to the emails array
        }
      }
    });

    // Save emails to a constant
    const allEmails = emails;
    console.log("Collected Emails:", allEmails);

    // Count the number of guest checkboxes that are checked
    const guestCheckboxes = document.querySelectorAll(".player-entry input[type='checkbox']:checked");
    const guestCountUsed = guestCheckboxes.length; // Calculate the guest count used

    // Prepare the reservation data
    const reservationData = {
      user_id: parseInt(userId),
      court_id: parseInt(court),
      date,
      start_time: startTime,
      end_time: endTime,
      game_type: gameType.toLowerCase(),
guest_count_used: guestCountUsed, // Set the guest count used here
      players: playerEntries, // Include player entries
    };

    // Send the reservation data to the backend
    const response = await fetch("http://localhost:5000/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });

    if (response.ok) {
      alert("Reservation successfully created!");
      refreshUpcomingReservationsDisplay();
      highlightReservationsForSelectedDate(1, 4); // Refresh the reservation display


      // Send emails with reservation details
      const emailResponse = await fetch("http://localhost:5000/api/send-reservation-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: allEmails,
          reservation_details: {
            user_id: userId, // Include user_id for backend to fetch the user's email
            date,
            start_time: startTime,
            end_time: endTime,
            court: court,
            game_type: gameType,
          },
        }),
      });
console.log("Sending reservation emails:", allEmails);
      if (emailResponse.ok) {
        console.log("Reservation emails sent successfully");
      } else {
        console.error("Failed to send reservation emails:", await emailResponse.text());
      }
    } else {
      const result = await response.json();
      alert("Failed to create reservation: " + result.error);
    }
  } catch (error) {
    console.error("Error creating reservation:", error);
    alert("An error occurred while creating the reservation.");
  }
});

document.querySelectorAll(".player-entry input[type='checkbox']").forEach((checkbox, index) => {
  checkbox.addEventListener("change", async function () {
    const playerEntry = this.closest(".player-entry"); // Get the parent `.player-entry` div
    const playerInputContainer = playerEntry.querySelector(".player-input-container"); // Container for the input/select

    // Check if the checkbox is checked
    if (this.checked) {
      // Change to a text input for guest names
      playerInputContainer.innerHTML = `
        <input type="text" placeholder="Enter Guest Name" class="player-input" />
      `;

      // Add an email input for guests
      if (!playerEntry.querySelector(".email-input")) {
        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.placeholder = "Enter Email for Guest";
        emailInput.className = "email-input";
        emailInput.style.marginTop = "10px"; // Add some spacing
        emailInput.required = true; // Make it required
        playerEntry.appendChild(emailInput);
      }
    } else {
      // Change to a dropdown for member selection
      playerInputContainer.innerHTML = `
        <select class="player-select">
          <option value="" disabled selected>Select a Member</option>
        </select>
      `;

      // Remove the email input if it exists
      const emailInput = playerEntry.querySelector(".email-input");
      if (emailInput) {
        playerEntry.removeChild(emailInput);
      }

      // Fetch the list of members and populate the dropdown
      try {
        const response = await fetch("http://localhost:5000/api/members");
        if (response.ok) {
          const members = await response.json();
          const playerSelect = playerInputContainer.querySelector(".player-select");

          members.forEach((member) => {
            const option = document.createElement("option");
            option.value = `${member.first_name} ${member.last_name}`;
            option.textContent = `${member.first_name} ${member.last_name}`;
            playerSelect.appendChild(option);
          });
        } else {
          console.error("Failed to fetch members:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
  });
});

document.getElementById("court").addEventListener("change", function () {
  const selectedCourt = parseInt(this.value); // Get the selected court number
  const displayReservationsBox = document.querySelector(".display-reservations-box");

  // Determine the range of courts to display
  let courtRangeStart, courtRangeEnd;
  if (selectedCourt >= 1 && selectedCourt <= 4) {
    courtRangeStart = 1;
    courtRangeEnd = 4;
    console.log("Displaying reservations for courts 1–4.");
    highlightReservationsForSelectedDate(courtRangeStart, courtRangeEnd);
  } else if (selectedCourt >= 5 && selectedCourt <= 8) {
    courtRangeStart = 5;
    courtRangeEnd = 8;
    console.log("Displaying reservations for courts 5–8.");
    highlightReservationsForSelectedDate(courtRangeStart, courtRangeEnd);
  } else if (selectedCourt >= 9 && selectedCourt <= 12) {
    courtRangeStart = 9;
    courtRangeEnd = 12;
    console.log("Displaying reservations for courts 9–12.");
    highlightReservationsForSelectedDate(courtRangeStart, courtRangeEnd);
  }

  // Clear the background styling of all time slots
  const timeSlots = displayReservationsBox.querySelectorAll(".display-reservations-time");
  timeSlots.forEach((slot) => {
    slot.style.backgroundColor = ""; // Reset background color
  });

  // Update court titles dynamically
  const courtColumns = displayReservationsBox.querySelectorAll(".display-reservations-collumn");
  courtColumns.forEach((courtColumn, index) => {
    const courtTitle = courtColumn.querySelector(".court-title");

    // Map courts 1–4, 5–8, and 9–12 to their respective titles
    if (selectedCourt <= 4) {
      courtTitle.textContent = `Court ${index + 1}`;
    } else if (selectedCourt >= 5 && selectedCourt <= 8) {
      courtTitle.textContent = `Court ${index + 5}`;
    } else if (selectedCourt >= 9 && selectedCourt <= 12) {
      courtTitle.textContent = `Court ${index + 9}`;
    }
  });
});

document.getElementById("game-type").addEventListener("change", function () {
  const gameType = this.value.toLowerCase(); // Get the selected game type
  const playerEntries = document.querySelectorAll(".player-entry"); // Select all player entry fields

  if (gameType === "singles") {
    // Add a class to hide all but the first player entry
    playerEntries.forEach((entry, index) => {
      if (index === 0) {
        entry.classList.remove("hidden"); // Show the first player entry
      } else {
        entry.classList.add("hidden"); // Hide all other player entries
        const checkbox = entry.querySelector("input[type='checkbox']");
        const emailInput = entry.querySelector(".email-input");

        // Uncheck the checkbox and remove the email input if it exists
        if (checkbox) checkbox.checked = false;
        if (emailInput) entry.removeChild(emailInput);
      }
    });
  } else if (gameType === "doubles") {
    // Remove the hidden class from all player entries
    playerEntries.forEach((entry) => {
      entry.classList.remove("hidden"); // Show all player entries
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch members on startup
  let members = [];
  try {
    const response = await fetch("http://localhost:5000/api/members");
    if (response.ok) {
      members = await response.json();
    } else {
      console.error("Failed to fetch members:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching members:", error);
  }

  // Populate the dropdowns with members
  document.querySelectorAll(".player-select").forEach((select) => {
    select.innerHTML = `<option value="" disabled selected>Select a Member</option>`;
    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = `${member.first_name} ${member.last_name}`;
      option.textContent = `${member.first_name} ${member.last_name}`;
      select.appendChild(option);
    });
  });

  // Add event listeners to checkboxes for dynamic input switching
  document.querySelectorAll(".player-entry input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const playerEntry = this.closest(".player-entry");
      const playerInputContainer = playerEntry.querySelector(".player-input-container");

      if (this.checked) {
        // Switch to text input for guest names
        playerInputContainer.innerHTML = `
          <input type="text" placeholder="Enter Guest Name" class="player-input" />
        `;

        // Add an email input for guests
        if (!playerEntry.querySelector(".email-input")) {
          const emailInput = document.createElement("input");
          emailInput.type = "email";
          emailInput.placeholder = "Enter Email for Guest";
          emailInput.className = "email-input";
          emailInput.style.marginTop = "10px"; // Add some spacing
          emailInput.required = true; // Make it required
          playerEntry.appendChild(emailInput);
        }
      } else {
        // Switch back to dropdown for member selection
        playerInputContainer.innerHTML = `
          <select class="player-select">
            <option value="" disabled selected>Select a Member</option>
          </select>
        `;

        // Populate the dropdown with members again
        const playerSelect = playerInputContainer.querySelector(".player-select");
        members.forEach((member) => {
          const option = document.createElement("option");
          option.value = `${member.first_name} ${member.last_name}`;
          option.textContent = `${member.first_name} ${member.last_name}`;
          playerSelect.appendChild(option);
        });

        // Remove the email input if it exists
        const emailInput = playerEntry.querySelector(".email-input");
        if (emailInput) {
          playerEntry.removeChild(emailInput);
        }
      }
    });
  });
});
