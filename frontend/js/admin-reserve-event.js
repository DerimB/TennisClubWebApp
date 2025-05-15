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
        reservations = await response.json();
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

document.getElementById("date").addEventListener("change", () => {
  populateTimeOptions("start-time"); // Update the start-time options based on the selected date
});


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

  // Define the closing time (e.g., 8:30 PM)
  const closingHour = 20; // 8:00 PM
  const closingMinutes = 30;

  // Generate end-time options starting 30 minutes after the selected start time
  let currentHour = startHour;
  let currentMinutes = startMinutes + 30;

  while (currentHour < closingHour || (currentHour === closingHour && currentMinutes <= closingMinutes)) {
    // Adjust the hour and minutes if minutes exceed 59
    if (currentMinutes >= 60) {
      currentHour += 1;
      currentMinutes -= 60;
    }

    // Format time as HH:MM
    const time = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;
    console.log(`Generated end-time option: ${time}`);

    // Convert to 12-hour format with AM/PM
    const period = currentHour < 12 ? "AM" : "PM";
    const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const displayTime = `${displayHour}:${currentMinutes.toString().padStart(2, "0")} ${period}`;

    // Create and append the option element
    const option = document.createElement("option");
    option.value = time;
    option.textContent = displayTime;
    endTimeSelect.appendChild(option);

    // Increment by 30 minutes for the next option
    currentMinutes += 30;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateTimeOptions("start-time"); // Populate the start time select
  populateTimeOptions("end-time");   // Populate the end time select (initially)

  // Add event listener to update end-time options when start-time changes
  document.getElementById("start-time").addEventListener("change", updateEndTimeOptions);
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

    // Get the selected date
    const date = document.getElementById("date").value;
    if (!date) {
      alert("Please select a date.");
      return;
    }

    // Get the selected start and end times
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (!startTime || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    // Prepare reservation data for all courts (1 to 12)
    const reservations = [];
    for (let courtId = 1; courtId <= 12; courtId++) {
      reservations.push({
        user_id: parseInt(userId),
        court_id: courtId,
        date,
        start_time: startTime,
        end_time: endTime,
        game_type: "event",
        guest_count_used: 0, // No guests for this reservation
        players: [],
      });
    }

    // Send all reservation requests to the backend
    const reservationPromises = reservations.map((reservationData) =>
      fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })
    );

    // Wait for all reservation requests to complete
    const responses = await Promise.all(reservationPromises);

    // Check the results of all requests
    let allSuccessful = true;
    for (const response of responses) {
      if (!response.ok) {
        allSuccessful = false;
        const result = await response.json();
        console.error("Failed to create reservation:", result.error);
      }
    }

    if (allSuccessful) {
      alert("All courts successfully reserved!");
    } else {
      alert("Some reservations failed. Please check the console for details.");
    }
  } catch (error) {
    console.error("Error creating reservations:", error);
    alert("An error occurred while creating the reservations.");
  }
});
