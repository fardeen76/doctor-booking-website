let currentDoctor = null;

document.addEventListener('DOMContentLoaded', function() {

    setupMobileMenu();
    loadDoctorForBooking();
    setupForm();
    setMinimumDate();
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
    return urlParams.get('doctorId');
}

async function loadDoctorForBooking() {
    const doctorId = getDoctorIdFromURL();

    if (!doctorId) {
        showErrorState();
        return;
    }

    const loadingState = document.getElementById('loadingState');
    const appointmentForm = document.getElementById('appointmentForm');
    const errorState = document.getElementById('errorState');

    try {

        loadingState.classList.remove('hidden');
        appointmentForm.classList.add('hidden');
        errorState.classList.add('hidden');


        const doctorDoc = window.firebaseUtils.doc(window.db, 'doctors', doctorId);
        const doctorSnapshot = await window.firebaseUtils.getDoc(doctorDoc);

        if (doctorSnapshot.exists()) {
            currentDoctor = {
                id: doctorSnapshot.id,
                ...doctorSnapshot.data()
            };

            displayDoctorInfo(currentDoctor);
            document.getElementById('doctorId').value = doctorId;

            loadingState.classList.add('hidden');
            appointmentForm.classList.remove('hidden');
        } else {
            showErrorState();
        }

    } catch (error) {
        console.error('Error loading doctor information:', error);
        showErrorState();
    }
}

function displayDoctorInfo(doctor) {
    document.getElementById('doctorPhoto').src = doctor.photoURL || 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400';
    document.getElementById('doctorPhoto').alt = doctor.name;
    document.getElementById('doctorName').textContent = doctor.name;
    document.getElementById('doctorSpecialization').textContent = doctor.specialization;
    document.getElementById('doctorBranch').textContent = doctor.branch;
}

function setMinimumDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateInput = document.getElementById('preferredDate');
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

function setupForm() {
    const form = document.getElementById('bookingForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (validateForm()) {
            await submitAppointment();
        }
    });


    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateForm() {
    let isValid = true;


    const patientName = document.getElementById('patientName');
    if (!patientName.value.trim()) {
        showFieldError('patientName', 'Please enter patient name');
        isValid = false;
    }
    const contactNumber = document.getElementById('contactNumber');
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    if (!contactNumber.value.trim()) {
        showFieldError('contactNumber', 'Please enter contact number');
        isValid = false;
    } else if (!phonePattern.test(contactNumber.value.replace(/[\s\-\(\)]/g, ''))) {
        showFieldError('contactNumber', 'Please enter a valid contact number');
        isValid = false;
    }

    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showFieldError('email', 'Please enter email address');
        isValid = false;
    } else if (!emailPattern.test(email.value)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }

    const preferredDate = document.getElementById('preferredDate');
    const selectedDate = new Date(preferredDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!preferredDate.value) {
        showFieldError('preferredDate', 'Please select a date');
        isValid = false;
    } else if (selectedDate <= today) {
        showFieldError('preferredDate', 'Please select a future date');
        isValid = false;
    }

    const preferredTime = document.getElementById('preferredTime');
    if (!preferredTime.value) {
        showFieldError('preferredTime', 'Please select a time');
        isValid = false;
    }

    return isValid;
}

function validateField(e) {
    const field = e.target;
    const fieldName = field.id;

    switch (fieldName) {
        case 'patientName':
            if (!field.value.trim()) {
                showFieldError(fieldName, 'Please enter patient name');
            }
            break;
        case 'contactNumber':
            const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
            if (!field.value.trim()) {
                showFieldError(fieldName, 'Please enter contact number');
            } else if (!phonePattern.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
                showFieldError(fieldName, 'Please enter a valid contact number');
            }
            break;
        case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!field.value.trim()) {
                showFieldError(fieldName, 'Please enter email address');
            } else if (!emailPattern.test(field.value)) {
                showFieldError(fieldName, 'Please enter a valid email address');
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');

    field.classList.add('border-red-500');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function clearFieldError(e) {
    const field = e.target;
    const fieldName = field.id;
    const errorElement = document.getElementById(fieldName + 'Error');

    field.classList.remove('border-red-500');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

async function submitAppointment() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    try {
        submitBtn.disabled = true;
        submitText.textContent = 'Booking...';
        submitSpinner.classList.remove('hidden');

        const appointmentData = {
            doctorId: document.getElementById('doctorId').value,
            doctorName: currentDoctor.name,
            doctorSpecialization: currentDoctor.specialization,
            doctorBranch: currentDoctor.branch,
            patientName: document.getElementById('patientName').value.trim(),
            contactNumber: document.getElementById('contactNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            preferredDate: document.getElementById('preferredDate').value,
            preferredTime: document.getElementById('preferredTime').value,
            notes: document.getElementById('notes').value.trim(),
            bookedAt: window.firebaseUtils.Timestamp.now(),
            status: 'pending'
        };

        const appointmentsCollection = window.firebaseUtils.collection(window.db, 'appointments');
        await window.firebaseUtils.addDoc(appointmentsCollection, appointmentData);

        await Swal.fire({
            icon: 'success',
            title: 'Appointment Booked!',
            text: 'Your appointment has been successfully booked. We will contact you soon to confirm.',
            confirmButtonColor: '#3B82F6'
        });

        window.location.href = 'doctors.html';

    } catch (error) {
        console.error('Error booking appointment:', error);


        await Swal.fire({
            icon: 'error',
            title: 'Booking Failed',
            text: 'There was an error booking your appointment. Please try again.',
            confirmButtonColor: '#3B82F6'
        });

    } finally {

        submitBtn.disabled = false;
        submitText.textContent = 'Book Appointment';
        submitSpinner.classList.add('hidden');
    }
}

function showErrorState() {
    const loadingState = document.getElementById('loadingState');
    const appointmentForm = document.getElementById('appointmentForm');
    const errorState = document.getElementById('errorState');

    loadingState.classList.add('hidden');
    appointmentForm.classList.add('hidden');
    errorState.classList.remove('hidden');
}