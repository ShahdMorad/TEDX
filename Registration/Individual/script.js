// Create Greek letter background
const greekLetters = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"];
const bgContainer = document.getElementById('greek-letter-bg');

for (let i = 0; i < 100; i++) {
    const letter = document.createElement('div');
    letter.className = 'greek-letter';
    letter.textContent = greekLetters[Math.floor(Math.random() * greekLetters.length)];
    
    // Random position and animation
    const left = Math.random() * 100;
    const size = 0.5 + Math.random() * 2;
    const duration = 15 + Math.random() * 30;
    const delay = Math.random() * 15;
    
    letter.style.left = `${left}%`;
    letter.style.fontSize = `${size}rem`;
    letter.style.animationDuration = `${duration}s`;
    letter.style.animationDelay = `${delay}s`;
    
    bgContainer.appendChild(letter);
}

// Form validation and success animation
const form = document.getElementById('registrationForm');
const successAnimation = document.getElementById('successAnimation');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error').forEach(el => {
        el.style.display = 'none';
    });
    
    let isValid = true;
    
    // Validate name
    const name = document.getElementById('name');
    if (!name.value.trim()) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
        name.focus();
    }
    
    // Validate email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
        if (isValid) email.focus();
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phone.value.trim() || !phoneRegex.test(phone.value)) {
        document.getElementById('phoneError').style.display = 'block';
        isValid = false;
        if (isValid) phone.focus();
    }
    
    // Validate faculty
    const faculty = document.getElementById('faculty');
    if (!faculty.value.trim()) {
        document.getElementById('facultyError').style.display = 'block';
        isValid = false;
        if (isValid) faculty.focus();
    }
    
    // Validate grade
    const grade = document.getElementById('grade');
    if (!grade.value.trim()) {
        document.getElementById('gradeError').style.display = 'block';
        isValid = false;
        if (isValid) grade.focus();
    }
    
    // Validate transaction number
    const transaction = document.getElementById('transaction');
    if (!transaction.value.trim()) {
        document.getElementById('transactionError').style.display = 'block';
        isValid = false;
        if (isValid) transaction.focus();
    }
    
    // If valid, show success animation
    if (isValid) {

        const attendeeData = {
            name: name.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            faculty: faculty.value.trim(),
            grade: grade.value.trim(),
            transaction: transaction.value.trim(),
            promo: document.getElementById('promo').value.trim() || null,
            status: "not_entered",
            registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
            nameLower: name.value.trim().toLowerCase() // For case-insensitive search
        };
        // Show success animation
        
        
        // Reset form after animation

        try {
            console.log("Attempting to save to Firestore...");
            const docRef = await db.collection("attendees").add(attendeeData);
            console.log("Document written with ID: ", docRef.id);
            
            // Show success animation
            successAnimation.style.display = 'flex';
            setTimeout(() => {
                form.reset();
                successAnimation.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Registration failed. Please check console for details.");
        }
    }
});

// Space theme effect on form elements
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('focus', () => {
        el.style.boxShadow = '0 0 25px rgba(179, 0, 0, 0.7)';
    });
    
    el.addEventListener('blur', () => {
        el.style.boxShadow = '';
    });
});