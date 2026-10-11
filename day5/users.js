const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

async function loadUsers() {
    // Disable the button while loading
    loadButton.disabled = true;

    
    statusMessage.textContent = "Loading users...";

    try {
       
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error("Failed to load users. Please try again.");
        }

        users = await response.json();

        renderUsers(users);

        statusMessage.textContent =
            `Successfully loaded ${users.length} users.`;

    } catch (error) {
  
        statusMessage.textContent =
            "Error loading users. Please check your connection and try again.";

        console.error(error);

    } finally {
        loadButton.disabled = false;
    }
}

function renderUsers(list) {
    usersList.textContent = "";

    if (list.length === 0) {
        const message = document.createElement("li");
        message.textContent = "No users match your filter.";
        usersList.appendChild(message);
        return;
    }

    list.forEach(function (user) {
        const listItem = document.createElement("li");

        const name = document.createElement("h3");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = "Email: " + user.email;

        const city = document.createElement("p");
        city.textContent = "City: " + user.address.city;

        const company = document.createElement("p");
        company.textContent = "Company: " + user.company.name;

        listItem.appendChild(name);
        listItem.appendChild(email);
        listItem.appendChild(city);
        listItem.appendChild(company);

        usersList.appendChild(listItem);
    });
}
loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", function () {
    const searchText = filterInput.value.toLowerCase().trim();


    const filteredUsers = users.filter(function (user) {
        return user.name.toLowerCase().includes(searchText);
    });

    renderUsers(filteredUsers);
});

