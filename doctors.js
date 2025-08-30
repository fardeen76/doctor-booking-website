let allDoctors = [];

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    loadDoctors();
    setupFilters();
});

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

async function loadDoctors() {
    const loadingState = document.getElementById('loadingState');
    const doctorsGrid = document.getElementById('doctorsGrid');
    const noResults = document.getElementById('noResults');

    try {
        const response = await fetch('./doctors.json');
        allDoctors = await response.json();

        populateFilterOptions(allDoctors);
        displayDoctors(allDoctors);

        loadingState.classList.add('hidden');
        doctorsGrid.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading doctors:', error);
        loadingState.innerHTML = '<p class="text-red-500">Failed to load doctors.</p>';
    }
}

function displayDoctors(doctors) {
    const grid = document.getElementById('doctorsGrid');
    const noResults = document.getElementById('noResults');

    grid.innerHTML = '';

    if (doctors.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    doctors.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md';

        card.innerHTML = `
            <img src="${doc.photoURL || 'https://via.placeholder.com/150'}"
     alt="${doc.name}"
     class="h-40 w-40 object-cover object-center rounded-md mb-4 mx-auto">


            <h2 class="text-xl font-semibold text-gray-900">${doc.name}</h2>
            <p class="text-blue-600 font-medium">${doc.specialization}</p>
            <p class="text-gray-500 text-sm mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${doc.branch}</p>
            <a href="doctor.html?id=${doc.id}" class="mt-4 inline-block text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition">
                View Profile
            </a>
        `;

        grid.appendChild(card);
    });

    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
}

function setupFilters() {
    document.getElementById('searchName').addEventListener('input', applyFilters);
    document.getElementById('filterSpecialization').addEventListener('change', applyFilters);
    document.getElementById('filterBranch').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchName').value = '';
        document.getElementById('filterSpecialization').value = '';
        document.getElementById('filterBranch').value = '';
        displayDoctors(allDoctors);
    });
}

function applyFilters() {
    const name = document.getElementById('searchName').value.toLowerCase();
    const specialization = document.getElementById('filterSpecialization').value;
    const branch = document.getElementById('filterBranch').value;

    const filtered = allDoctors.filter(doc => {
        return (
            (name === '' || doc.name.toLowerCase().includes(name)) &&
            (specialization === '' || doc.specialization === specialization) &&
            (branch === '' || doc.branch === branch)
        );
    });

    displayDoctors(filtered);
}

function populateFilterOptions(doctors) {
    const specializationSet = new Set();
    const branchSet = new Set();

    doctors.forEach(doc => {
        specializationSet.add(doc.specialization);
        branchSet.add(doc.branch);
    });

    const specializationSelect = document.getElementById('filterSpecialization');
    const branchSelect = document.getElementById('filterBranch');

    specializationSelect.innerHTML = '<option value="">All Specializations</option>';
    branchSelect.innerHTML = '<option value="">All Branches</option>';

    Array.from(specializationSet).sort().forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        specializationSelect.appendChild(option);
    });

    Array.from(branchSet).sort().forEach(branch => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        branchSelect.appendChild(option);
    });
}