// Initialize Firebase (make sure you have this configured)


// Create Greek letter background (same as before)
const greekLetters = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"];
const bgContainer = document.getElementById('greek-letter-bg');

for (let i = 0; i < 100; i++) {
    const letter = document.createElement('div');
    letter.className = 'greek-letter';
    letter.textContent = greekLetters[Math.floor(Math.random() * greekLetters.length)];
    
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

// Generate a unique group ID
function generateGroupId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GRP-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Form validation and submission
const form = document.getElementById('registrationForm');
const successAnimation = document.getElementById('successAnimation');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error').forEach(el => {
        el.style.display = 'none';
    });
    
    let isValid = true;
    const groupMembers = [];
    
    // Validate all 5 persons and collect their data
    for (let i = 1; i <= 5; i++) {
        const name = document.getElementById(`name${i}`);
        const email = document.getElementById(`email${i}`);
        const phone = document.getElementById(`phone${i}`);
        const faculty = document.getElementById(`faculty${i}`);
        const grade = document.getElementById(`grade${i}`);
        
        // Validate name
        if (!name.value.trim()) {
            document.getElementById(`name${i}Error`).style.display = 'block';
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            document.getElementById(`email${i}Error`).style.display = 'block';
            isValid = false;
        }
        
        // Validate phone
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phone.value.trim() || !phoneRegex.test(phone.value)) {
            document.getElementById(`phone${i}Error`).style.display = 'block';
            isValid = false;
        }
        
        // Validate faculty
        if (!faculty.value.trim()) {
            document.getElementById(`faculty${i}Error`).style.display = 'block';
            isValid = false;
        }
        
        // Validate grade
        if (!grade.value.trim()) {
            document.getElementById(`grade${i}Error`).style.display = 'block';
            isValid = false;
        }
        
        // If valid, add to group members array
        if (isValid) {
            groupMembers.push({
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                faculty: faculty.value.trim(),
                grade: grade.value.trim(),
                nameLower: name.value.trim().toLowerCase()
                
            });
        }
    }
    
    // Validate transaction number
    const transaction = document.getElementById('transaction');
    if (!transaction.value.trim()) {
        document.getElementById('transactionError').style.display = 'block';
        isValid = false;
    }
    
    const promo = document.getElementById('promo').value.trim() || null;
    
    // If valid, proceed with registration
    if (isValid && groupMembers.length === 5) {
        try {
            // Generate a unique group ID
            const groupId = generateGroupId();
            
            // Create the group document
            const groupData = {
                groupId: groupId,
                transaction: transaction.value.trim(),
                promoCode: promo,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: "not_entered",
                memberCount: 5
            };
            
            // Start a batch write to ensure all operations succeed or fail together
            const batch = db.batch();
            
            // Add group document to 'groups' collection
            const groupRef = db.collection('groups').doc(groupId);
            batch.set(groupRef, groupData);
            
            // Add each member to 'attendees' collection and link to group
            groupMembers.forEach((member, index) => {
                const attendeeRef = db.collection('attendees').doc();
                batch.set(attendeeRef, {
                    ...member,
                    groupId: groupId,
                    groupRole: index === 0 ? 'leader' : 'member', // First member is leader
                    transaction: transaction.value.trim(),
                    status: "not_entered",
                    registeredAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            // Commit the batch
            await batch.commit();
            
            // Show success message with group ID
            successAnimation.querySelector('.success-text').textContent = 
                `Registration Complete! `;
            successAnimation.style.display = 'flex';
            
            // Reset form after animation
            setTimeout(() => {
                form.reset();
                successAnimation.style.display = 'none';
            }, 5000);
            
        } catch (error) {
            console.error("Error saving group registration: ", error);
            alert("Registration failed. Please check console for details.");
        }
    }
});

// Focus effect on form elements
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('focus', () => {
        el.style.boxShadow = '0 0 25px rgba(179, 0, 0, 0.7)';
        const personContainer = el.closest('.person-container');
        if (personContainer) {
            personContainer.style.borderColor = '#b30000';
            personContainer.style.boxShadow = '0 0 30px rgba(179, 0, 0, 0.6)';
        }
    });
    
    el.addEventListener('blur', () => {
        el.style.boxShadow = '';
        const personContainer = el.closest('.person-container');
        if (personContainer) {
            personContainer.style.borderColor = 'rgba(179, 0, 0, 0.4)';
            personContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        }
    });
});







// Function to fill form with test data
