async function adminFetchIDs(query = "") {
    const res = await fetch(`http://localhost:5000/api/membersID?search=${query}`);
    const members = await res.json();
  
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
          <td>${user.password}</td>
          <td>${user.role}</td>
          <td>${user.guest_count}</td>
          <td>${user.visibility}</td>
        `;
      
        container.appendChild(row);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    adminFetchIDs();
  
    document.getElementById("search").addEventListener("input", (e) => {
      adminFetchIDs(e.target.value);
    });
  });
  