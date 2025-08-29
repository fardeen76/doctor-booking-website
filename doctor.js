let currentDoctor = null;

document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    loadDoctorProfile();
    setupBookingButton();
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

function getDoctorIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadDoctorProfile() {
    const doctorId = getDoctorIdFromURL();

    const loadingState = document.getElementById('loadingState');
    const doctorProfile = document.getElementById('doctorProfile');
    const errorState = document.getElementById('errorState');

    if (!doctorId) {
        showErrorState();
        return;
    }

    try {
        loadingState.classList.remove('hidden');
        doctorProfile.classList.add('hidden');
        errorState.classList.add('hidden');

        // Fetch local doctors.json
        const response = await fetch('./doctors.json');
        const doctors = await response.json();

        // Find the doctor by ID
        const doctor = doctors.find(d => d.id === doctorId);

        if (doctor) {
            currentDoctor = doctor;
            displayDoctorProfile(currentDoctor);
            loadingState.classList.add('hidden');
            doctorProfile.classList.remove('hidden');
        } else {
            showErrorState();
        }

    } catch (error) {
        console.error('Error loading doctor profile:', error);
        showErrorState();
    }
}

function displayDoctorProfile(doctor) {
    document.getElementById('doctorPhoto').src = doctor.photoURL || 'https://via.placeholder.com/150';
    document.getElementById('doctorPhoto').alt = doctor.name;
    document.getElementById('doctorName').textContent = doctor.name;
    document.getElementById('doctorSpecialization').textContent = doctor.specialization;
    document.getElementById('doctorBranch').innerHTML = `<i class="fas fa-map-marker-alt mr-1"></i>${doctor.branch}`;
    document.getElementById('doctorQualifications').textContent = doctor.qualifications;
    document.getElementById('doctorAvailability').textContent = doctor.availability;

    document.title = `${doctor.name} - MedConnect`;
}

function setupBookingButton() {
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', function() {
            if (currentDoctor) {
                Swal.fire({
                    title: 'Appointment Confirmed',
                    text: `Your appointment with ${currentDoctor.name} has been successfully booked.`,
                    icon: 'success',
                    confirmButtonText: 'Back to Doctors'
                }).then(() => {
                    window.location.href = 'doctors.html';
                });
            }
        });
    }
}


function showErrorState() {
    const loadingState = document.getElementById('loadingState');
    const doctorProfile = document.getElementById('doctorProfile');
    const errorState = document.getElementById('errorState');

    loadingState.classList.add('hidden');
    doctorProfile.classList.add('hidden');
    errorState.classList.remove('hidden');
}