document.querySelector(".modify-account").addEventListener("click", async () => {
    const userId = document.getElementById("id").value;
    const elementToModify = document.getElementById("modified-element").value;
    const newValue = document.getElementById("new-input").value;

    if (!userId || !elementToModify || !newValue) {
        alert("Please fill in all fields.");
        return;
    }

    const updateData = {
        id: parseInt(userId),
        field: elementToModify,
        value: newValue
    };

    try {
        const response = await fetch("http://localhost:5000/api/update-member", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("User information successfully updated!");
        } else {
            alert("Failed to update user: " + result.error);
        }
    } catch (error) {
        console.error("Error: ", error);
        alert("An error occurred while updating the user.");
    }
});

document.querySelector(".reset-guest-count").addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:5000/api/reset-guest-count", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert("Guest count successfully reset!");
        } else {
            alert("Failed to reset guest count: " + result.error);
        }
    } catch (error) {
        console.error("Error: ", error);
        alert("An error occurred while resetting the guest count.");
    }
});