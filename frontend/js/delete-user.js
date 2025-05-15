document.querySelector(".delete-account").addEventListener("click", async () => {
    const userId = document.getElementById("delete-id").value;
    
    if (!userId) {
        alert("Please fill in all fields.");
        return;
    }

    const deleteData = {
        userId: parseInt(userId)
    };

    console.log("Request payload:", deleteData);


    try {
        const response = await fetch("http://localhost:5000/api/delete-user", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deleteData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("User successfully deleted!");
        } else {
            alert("Failed to delete user: " + result.error);
        }
    } catch (error) {
        console.error("Error: ", error);
        alert("An error occurred while deleting the user.");
    }
});