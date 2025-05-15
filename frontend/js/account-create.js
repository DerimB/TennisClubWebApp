document.querySelector(".add-account").addEventListener("click", async () => {
    //Get inputted data
    const firstname = document.getElementById("first_name").value;
    const lastname = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const phonenum = document.getElementById("phone_number").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const visibilityRaw = document.getElementById("visibility").value;
    const visibility = ["true", "1"].includes(visibilityRaw.toString().toLowerCase());

    if (!firstname || !lastname || !email || !password) {
        alert("Please fill in all required fields.");
        return;
    }

    const user = {
        firstname,
        lastname,
        email,
        phonenum,
        password,
        role,
        visibility
    };
    console.log(user);

    try {
        const response = await fetch("http://localhost:5000/api/create-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const result = await response.json();
        if (response.ok) {
            alert("User successfully added!");
        } else {
            alert("Failed to add user: " + result.error);
        }
    } catch (error) {
        console.error("Error: ", error);
        alert("An error occured while creating a user");
    }
  });
  