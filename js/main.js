// main.js for Farmers' Market Hub

// --- Registration & Login Logic ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'register.html';
}

document.addEventListener('DOMContentLoaded', function () {
  // Registration
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!registerForm.checkValidity()) {
        registerForm.classList.add('was-validated');
        return;
      }
      const users = getUsers();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const role = document.getElementById('regRole').value;
      const password = document.getElementById('regPassword').value;
      if (users.find(u => u.email === email)) {
        alert('User already exists!');
        return;
      }
      const user = { name, email, role, password };
      users.push(user);
      setUsers(users);
      setCurrentUser(user);
      window.location.href = 'dashboard.html';
    });
  }
  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!loginForm.checkValidity()) {
        loginForm.classList.add('was-validated');
        return;
      }
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Invalid credentials!');
        return;
      }
      setCurrentUser(user);
      window.location.href = 'dashboard.html';
    });
  }

  // --- Dashboard Logic ---
  const dashboardContent = document.getElementById('dashboardContent');
  if (dashboardContent) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'register.html';
      return;
    }
    if (user.role === 'farmer') {
      dashboardContent.innerHTML = `
        <h2>Welcome, ${user.name} (Farmer)</h2>
        <button class="btn btn-outline-danger float-end mb-3" onclick="logout()">Logout</button>
        <h4>Add New Produce</h4>
        <form id="produceForm" class="mb-4" novalidate>
          <div class="row g-2">
            <div class="col-md-4"><input type="text" class="form-control" id="prodName" placeholder="Product Name" required></div>
            <div class="col-md-3"><input type="number" class="form-control" id="prodQty" placeholder="Quantity" required min="1"></div>
            <div class="col-md-3"><input type="number" class="form-control" id="prodPrice" placeholder="Price (RWF)" required min="1"></div>
            <div class="col-md-2"><button type="submit" class="btn btn-success w-100">Add</button></div>
          </div>
          <div class="invalid-feedback">Please fill all fields correctly.</div>
        </form>
        <h4>Your Produce</h4>
        <div id="farmerProduceList" class="row"></div>
      `;
      renderFarmerProduce();
      document.getElementById('produceForm').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!this.checkValidity()) {
          this.classList.add('was-validated');
          return;
        }
        const prodName = document.getElementById('prodName').value.trim();
        const prodQty = document.getElementById('prodQty').value;
        const prodPrice = document.getElementById('prodPrice').value;
        const produce = getProduce();
        produce.push({
          name: prodName,
          quantity: prodQty,
          price: prodPrice,
          farmer: user.name,
          farmerEmail: user.email
        });
        setProduce(produce);
        this.reset();
        this.classList.remove('was-validated');
        renderFarmerProduce();
      });
    } else {
      dashboardContent.innerHTML = `
        <h2>Welcome, ${user.name} (Buyer)</h2>
        <button class="btn btn-outline-danger float-end mb-3" onclick="logout()">Logout</button>
        <h4>Browse Available Produce</h4>
        <div id="buyerProduceList" class="row"></div>
      `;
      renderBuyerProduce();
    }
  }

  // --- Produce Listing Page ---
  const produceList = document.getElementById('produceList');
  if (produceList) {
    renderProduceList();
    document.getElementById('searchInput').addEventListener('input', renderProduceList);
    document.getElementById('maxPriceInput').addEventListener('input', renderProduceList);
  }
});

// --- Produce Data Logic ---
function getProduce() {
  return JSON.parse(localStorage.getItem('produce') || '[]');
}
function setProduce(produce) {
  localStorage.setItem('produce', JSON.stringify(produce));
}

// --- Farmer Produce Render ---
function renderFarmerProduce() {
  const user = getCurrentUser();
  const produce = getProduce().filter(p => p.farmerEmail === user.email);
  const list = document.getElementById('farmerProduceList');
  if (!list) return;
  if (produce.length === 0) {
    list.innerHTML = '<p>No produce added yet.</p>';
    return;
  }
  list.innerHTML = produce.map((p, i) => `
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">Quantity: ${p.quantity}<br>Price: ${p.price} RWF</p>
          <button class="btn btn-danger btn-sm" onclick="deleteProduce(${i})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}
function deleteProduce(index) {
  const user = getCurrentUser();
  let produce = getProduce();
  const userProduce = produce.filter(p => p.farmerEmail === user.email);
  const globalIndex = produce.findIndex((p, i) => p.farmerEmail === user.email && i === index);
  if (globalIndex > -1) {
    produce.splice(globalIndex, 1);
    setProduce(produce);
    renderFarmerProduce();
  }
}

// --- Buyer Produce Render ---
function renderBuyerProduce() {
  const produce = getProduce();
  const list = document.getElementById('buyerProduceList');
  if (!list) return;
  if (produce.length === 0) {
    list.innerHTML = '<p>No produce available at the moment.</p>';
    return;
  }
  list.innerHTML = produce.map(p => `
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">Quantity: ${p.quantity}<br>Price: ${p.price} RWF<br>Farmer: ${p.farmer}</p>
          <a href="mailto:${p.farmerEmail}" class="btn btn-success btn-sm">Contact Farmer</a>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Produce Listing Page Render ---
function renderProduceList() {
  const produce = getProduce();
  const list = document.getElementById('produceList');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const maxPrice = parseFloat(document.getElementById('maxPriceInput').value);
  let filtered = produce;
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  }
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter(p => parseFloat(p.price) <= maxPrice);
  }
  if (filtered.length === 0) {
    list.innerHTML = '<p>No produce matches your search.</p>';
    return;
  }
  list.innerHTML = filtered.map(p => `
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">Quantity: ${p.quantity}<br>Price: ${p.price} RWF<br>Farmer: ${p.farmer}</p>
          <a href="mailto:${p.farmerEmail}" class="btn btn-success btn-sm">Contact Farmer</a>
        </div>
      </div>
    </div>
  `).join('');
} 