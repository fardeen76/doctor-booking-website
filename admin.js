document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupLogin();
});

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const loginFormElement = document.getElementById('loginFormElement');
    const passwordInput = document.getElementById('adminPassword');
    const passwordError = document.getElementById('passwordError');

    const ADMIN_PASSWORD = 'admin123';

    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginForm.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadDoctorCount();
        } else {
            passwordError.classList.remove('hidden');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        location.reload();
    });
}

async function loadDoctorCount() {
    try {
        const doctorsRes = await fetch('/doctors.json');
        const doctors = await doctorsRes.json();

        document.getElementById('totalDoctors').textContent = doctors.length;
    } catch (error) {
        console.error('Failed to load doctors data:', error);
        Swal.fire('Error', 'Failed to load doctor data', 'error');
    }
}