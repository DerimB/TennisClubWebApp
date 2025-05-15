const contentDiv = document.getElementById("admin-tab");
const contentDiv2 = document.getElementById("treasurer-tab");
const contentDiv3 = document.getElementById("member-direct-tab");
const contentDiv4 = document.getElementById("court-res-tab");
const contentDiv5 = document.getElementById("login-tab");
const contentDiv6 = document.getElementById("logout-tab");

const isUserAdmin = localStorage.getItem("userRole") === "admin";
const isUserTreasurer = localStorage.getItem("userRole") === "treasurer";
const isSignedIn = localStorage.getItem("isSignedIn") === "true";

if(isUserAdmin) {
    contentDiv.innerHTML = `
    <li><a href="admin.html">Admin</a></li>
`;
}

if(isUserTreasurer || isUserAdmin) {
    contentDiv2.innerHTML = `
    <li><a href="treasurer.html">Treasurer</a></li>
`;
}

if(isSignedIn) {
    contentDiv3.innerHTML = `
        <li><a href="member-directory.html">Member Directory</a></li>
    `;
    contentDiv4.innerHTML = `
        <li><a href="reservations.html">Court Reservations</a></li>
    `;
    contentDiv6.innerHTML = `
        <li><a href="index.html" id="logout">Logout</a></li>
    `;
} else {
    contentDiv5.innerHTML = `
        <li><a href="index.html">Login</a></li>
    `;
}

// Add event
