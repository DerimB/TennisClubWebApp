async function fetchMembers(query = "") {
    const res = await fetch(`http://localhost:5000/api/members?search=${query}`);
    const members = await res.json();
  
    const container = document.getElementById("members-list");
    container.innerHTML = "";
  
    members.forEach(user => {
        const row = document.createElement("tr");
      
        row.innerHTML = `
          <td>${user.first_name}</td>
          <td>${user.last_name}</td>
          <td>${user.email}</td>
          <td>${user.phone_number}</td>
        `;
      
        container.appendChild(row);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    fetchMembers();
  
    document.getElementById("search").addEventListener("input", (e) => {
      fetchMembers(e.target.value);
    });
  });