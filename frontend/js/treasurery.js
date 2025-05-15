async function fetchMembers(query = "") {
    const res = await fetch(`http://localhost:5000/api/members-finances?search=${query}`);
    const members = await res.json();
    console.log("Response from /api/members-finances:", members);

  
    const container = document.getElementById("members-list");
    container.innerHTML = "";
  
    members.forEach(user => {
        const row = document.createElement("tr");
      
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.first_name}</td>
          <td>${user.last_name}</td>
          <td>${user.email}</td>
          <td>${user.phone_number}</td>
          <td>${user.balance}</td>

        `;
      
        container.appendChild(row);
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetchMembers();

    document.getElementById("search").addEventListener("input", (e) => {
        fetchMembers(e.target.value);
    });

    document.querySelector(".charge-400").addEventListener("click", async () => {
        const userId = document.getElementById("id").value;

        const updateData = {
            user_id: parseInt(userId),
            balance: 400
        };

        try {
            const response = await fetch("http://localhost:5000/api/modify-balance", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            if (response.ok) {
                alert("User balance successfully updated!");
                fetchMembers();  // refresh the table to show the new balance
                updateUserInfoDisplay();
            } else {
                alert("Failed to update user balance: " + result.error);
            }
        } catch (error) {
            console.error("Error: ", error);
            alert("An error occurred while updating the user balance.");
        }
    });

    document.querySelector(".charge-1000").addEventListener("click", async () => {
      const userId = document.getElementById("id").value;
  
      const updateData = {
          user_id: parseInt(userId),
          balance: 1000
      };
  
      try {
          const response = await fetch("http://localhost:5000/api/modify-balance", {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(updateData)
          });
  
          const result = await response.json();
          if (response.ok) {
              alert("User charged $1000");
              fetchMembers();  // refresh the table to show the new balance
              updateUserInfoDisplay();
          } else {
              alert("Failed to charge user: " + result.error);
          }
      } catch (error) {
          console.error("Error: ", error);
          alert("An error occurred while charging the user.");
      }
  });

  document.querySelector(".charge-10p").addEventListener("click", async () => {
    const userId = parseInt(document.getElementById("id").value);

    try {
        const res = await fetch("http://localhost:5000/api/members-finances");
        const members = await res.json();
        const user = members.find(m => m.id === userId);

        if (!user) {
            alert("User not found.");
            return;
        }

        const tenPercent = Math.round(user.balance * 0.10 * 100) / 100;

        const updateData = {
            user_id: userId,
            balance: tenPercent
        };

        const response = await fetch("http://localhost:5000/api/modify-balance", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Added 10% fee ($${tenPercent})`);
            fetchMembers();  // refresh the table to show the new balance
            updateUserInfoDisplay();
        } else {
            alert("Failed to apply 10% fee: " + result.error);
        }
    } catch (error) {
        console.error("Error: ", error);
        alert("An error occurred while applying the fee.");
    }
});

document.querySelector(".pay-custom").addEventListener("click", async () => {
    const userId = document.getElementById("id").value;
    const payment = parseFloat(document.getElementById("payment-amount").value);

    if (!userId || isNaN(payment)) {
        alert("Enter a valid user ID and payment amount.");
        return;
    }

    const updateData = {
        user_id: parseInt(userId),
        balance: -payment  // Add negative number to balance (to subtract instead of changing the current modify-balance function)
    };

    try {
        const response = await fetch("http://localhost:5000/api/modify-balance", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Payment applied successfully.");
            fetchMembers();  // refresh the table to show the new balance
            updateUserInfoDisplay();
        } else {
            alert("Failed to apply payment: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error while applying payment.");
    }
});


document.querySelector(".pay-full").addEventListener("click", async () => {
    const userId = document.getElementById("id").value;

    if (!userId) {
        alert("Enter a valid user ID.");
        return;
    }

    const updateData = {
        user_id: parseInt(userId),
        balance: "PAID_FULL"
    };

    try {
        const response = await fetch("http://localhost:5000/api/modify-balance", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Balance set to $0.");
            fetchMembers();  // refresh the table to show the new balance
            updateUserInfoDisplay();
        } else {
            alert("Failed to update balance: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error while updating balance.");
    }
});


document.getElementById("id").addEventListener("input", updateUserInfoDisplay);

async function updateUserInfoDisplay() {
    const userId = parseInt(document.getElementById("id").value);
    if (isNaN(userId)) return;

    try {
        const res = await fetch("http://localhost:5000/api/members-finances");
        const members = await res.json();
        const user = members.find(m => m.id === userId);

        if (!user) {
            document.querySelector(".member-name").textContent = "User not found";
            document.querySelector(".member-amount-due").textContent = "";
            return;
        }

        document.querySelector(".member-name").textContent = `${user.first_name} ${user.last_name}`;
        document.querySelector(".member-amount-due").textContent = `$${user.balance.toFixed(2)}`;
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
}

});

  