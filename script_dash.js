// DOM Elements
const loginModal = document.getElementById('loginModal');
const dashboardContent = document.getElementById('dashboardContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const searchField = document.getElementById('searchField');
const searchBtn = document.getElementById('searchBtn');
const exportBtn = document.getElementById('exportBtn');
const exportXlsxBtn = document.getElementById('exportXlsxBtn');
const editModal = document.getElementById('editModal');
const editId = document.getElementById('editId');
const editName = document.getElementById('editName');
const editPhone = document.getElementById('editPhone');
const editEmail = document.getElementById('editEmail');
const editFaculty = document.getElementById('editFaculty');
const editGrade = document.getElementById('editGrade');
const editPromo = document.getElementById('editPromo');
const editTransaction = document.getElementById('editTransaction');
const editPaymentStatus = document.getElementById('editPaymentStatus');
const editAttendanceStatus = document.getElementById('editAttendanceStatus');
const editpaymentMethod = document.getElementById('editpaymentMethod');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const verifyTransactionBtn = document.getElementById('verifyTransactionBtn');

// Admin Password
const ADMIN_PASSWORD = "tedx123";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhR-AIGG_1XKYG4KUQhji6cvEoSn2hZ-8",
    authDomain: "tedxmaadi-93eea.firebaseapp.com",
    projectId: "tedxmaadi-93eea",
    storageBucket: "tedxmaadi-93eea.appspot.com",
    messagingSenderId: "831250175205",
    appId: "1:831250175205:web:eb97db765e60434d97f00c",
    measurementId: "G-8P9SL92L9Q"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let unsubscribeAttendees = null;

// Login Functionality
loginBtn.addEventListener('click', async () => {
    try {
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginModal.style.display = 'none';
            dashboardContent.style.display = 'block';
            loadAttendees();
        } else {
            throw new Error("Incorrect password");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert('Login failed: ' + error.message);
        passwordInput.value = '';
    }
});

logoutBtn.addEventListener('click', () => {
    if (unsubscribeAttendees) unsubscribeAttendees();
    loginModal.style.display = 'flex';
    dashboardContent.style.display = 'none';
    passwordInput.value = '';
});

// Load Attendees
function loadAttendees() {
    if (unsubscribeAttendees) unsubscribeAttendees();

    unsubscribeAttendees = db.collection("attendees")
        .orderBy("registeredAt", "desc")
        .onSnapshot(snapshot => {
            const attendees = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                attendees.push({
                    id: doc.id,
                    name: data.name,
                    phone: data.phone,
                    email: data.email || '',
                    faculty: data.faculty || '',
                    grade: data.grade || '',
                    promo: data.promo || '',
                    transaction: data.transaction,
                    paymentMethod: data.paymentMethod || '',
                    paymentStatus: data.paymentStatus || 'not_verified',
                    attendanceStatus: data.attendanceStatus || 'not_entered',
                    registeredAt: data.registeredAt?.toDate() || new Date(),
                    enteredAt: data.enteredAt?.toDate() || null,
                    verifiedAt: data.verifiedAt?.toDate() || null
                });
            });
            updateTable(attendees);
            updateStats(attendees);
        }, error => {
            console.error("Error loading attendees:", error);
            alert("Error loading attendee data");
        });
}

// Update Table
function updateTable(attendees) {
    const tableBody = document.getElementById('attendeesTableBody');
    tableBody.innerHTML = '';
    
    attendees.forEach(attendee => {
        const row = document.createElement('tr');
        
        // Status badges
        const paymentClass = attendee.paymentStatus === 'verified' ? 'status-verified' : 'status-not-verified';
        const paymentText = attendee.paymentStatus === 'verified' ? 'PAID' : 'NOT PAID';
        
        const attendanceClass = attendee.attendanceStatus === 'entered' ? 'status-entered' : 'status-not-entered';
        const attendanceText = attendee.attendanceStatus === 'entered' ? 'CHECKED IN' : 'NOT CHECKED IN';
        
        const formattedDate = attendee.registeredAt.toLocaleDateString() + ' ' + 
                            attendee.registeredAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        row.innerHTML = `
            <td>${attendee.name}</td>
            <td>${attendee.phone}</td>
            <td>${attendee.email}</td>
            <td>${attendee.promo}</td>
            <td>${attendee.paymentMethod}</td>
            <td>${attendee.transaction}</td>
            <td>
                <span class="status-badge ${paymentClass}">${paymentText}</span><br>
                <span class="status-badge ${attendanceClass}">${attendanceText}</span>
            </td>
            <td>${formattedDate}</td>
            <td class="container-action-btn">
                <button class="action-btn ${attendee.attendanceStatus === 'entered' ? 'checked-in-btn' : 'checkin-btn'}" 
                        data-id="${attendee.id}" ${attendee.attendanceStatus === 'entered' ? 'disabled' : ''}>
                    <i class="fas ${attendee.attendanceStatus === 'entered' ? 'fa-check' : 'fa-check-circle'}"></i> 
                    ${attendee.attendanceStatus === 'entered' ? 'Checked In' : 'Check In'}
                </button>
                <button class="action-btn edit-btn" data-id="${attendee.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn ${attendee.paymentStatus === 'verified' ? 'verified-btn' : 'verify-btn'}" 
                        data-id="${attendee.id}" ${attendee.paymentStatus === 'verified' ? 'disabled' : ''}>
                    <i class="fas ${attendee.paymentStatus === 'verified' ? 'fa-check-double' : 'fa-money-bill-wave'}"></i> 
                    ${attendee.paymentStatus === 'verified' ? 'Verified' : 'Mark Paid'}
                </button>
                <button class="action-btn delete-btn" data-id="${attendee.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    attachCheckinButtonListeners();
    attachEditButtonListeners();
    attachVerifyButtonListeners();
    attachDeleteButtonListeners();
}

// Check-In Button
function attachCheckinButtonListeners() {
    document.querySelectorAll('.checkin-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const attendeeId = this.getAttribute('data-id');
            
            try {
                await db.collection("attendees").doc(attendeeId).update({
                    attendanceStatus: "entered",
                    enteredAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update UI
                this.innerHTML = '<i class="fas fa-check"></i> Checked In';
                this.classList.remove('checkin-btn');
                this.classList.add('checked-in-btn');
                this.disabled = true;
                
                // Update status badge
                const row = this.closest('tr');
                if (row) {
                    const statusBadges = row.querySelectorAll('.status-badge');
                    if (statusBadges.length > 1) {
                        statusBadges[1].textContent = 'CHECKED IN';
                        statusBadges[1].className = 'status-badge status-entered';
                    }
                }
            } catch (error) {
                console.error("Check-in error:", error);
                alert('Check-in failed: ' + error.message);
            }
        });
    });
}

// Verify Payment Button
function attachVerifyButtonListeners() {
    document.querySelectorAll('.verify-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const attendeeId = this.getAttribute('data-id');
            
            try {
                await db.collection("attendees").doc(attendeeId).update({
                    paymentStatus: "verified",
                    verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update UI
                this.innerHTML = '<i class="fas fa-check-double"></i> Verified';
                this.classList.remove('verify-btn');
                this.classList.add('verified-btn');
                this.disabled = true;
                
                // Update status badge
                const row = this.closest('tr');
                if (row) {
                    const statusBadges = row.querySelectorAll('.status-badge');
                    if (statusBadges.length > 0) {
                        statusBadges[0].textContent = 'PAID';
                        statusBadges[0].className = 'status-badge status-verified';
                    }
                }
            } catch (error) {
                console.error("Payment verification error:", error);
                alert('Payment verification failed: ' + error.message);
            }
        });
    });
}

// Delete Button
function attachDeleteButtonListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const attendeeId = this.getAttribute('data-id');
            const attendeeName = this.closest('tr').querySelector('td:first-child').textContent;
            
            if (confirm(`Are you sure you want to delete ${attendeeName}? This cannot be undone.`)) {
                db.collection("attendees").doc(attendeeId).delete()
                    .then(() => console.log("Attendee deleted"))
                    .catch(error => {
                        console.error("Delete error:", error);
                        alert('Delete failed: ' + error.message);
                    });
            }
        });
    });
}

// Edit Functionality
function attachEditButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const attendeeId = btn.getAttribute('data-id');
            try {
                const doc = await db.collection("attendees").doc(attendeeId).get();
                if (doc.exists) {
                    const data = doc.data();
                    editId.value = attendeeId;
                    editName.value = data.name;
                    editPhone.value = data.phone;
                    editEmail.value = data.email || '';
                    editFaculty.value = data.faculty || '';
                    editGrade.value = data.grade || '';
                    editPromo.value = data.promo || '';
                    editTransaction.value = data.transaction || '';
                    editpaymentMethod.value = data.paymentMethod || '';
                    editPaymentStatus.value = data.paymentStatus || 'not_verified';
                    editAttendanceStatus.value = data.attendanceStatus || 'not_entered';
                    editModal.style.display = 'flex';
                }
            } catch (error) {
                console.error("Error loading attendee:", error);
                alert("Failed to load attendee data");
            }
        });
    });
}

saveEditBtn.addEventListener('click', async () => {
    try {
        await db.collection("attendees").doc(editId.value).update({
            name: editName.value,
            phone: editPhone.value,
            email: editEmail.value,
            faculty: editFaculty.value,
            grade: editGrade.value,
            promo: editPromo.value,
            paymentMethod: editpaymentMethod.value,
            transaction: editTransaction.value,
            paymentStatus: editPaymentStatus.value,
            attendanceStatus: editAttendanceStatus.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        editModal.style.display = 'none';
    } catch (error) {
        console.error("Error updating attendee:", error);
        alert("Failed to update attendee");
    }
});

cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Update Statistics
function updateStats(attendees) {
    const total = attendees.length;
    const paid = attendees.filter(a => a.paymentStatus === 'verified').length;
    const attended = attendees.filter(a => a.attendanceStatus === 'entered').length;
    
    document.getElementById('totalAttendees').textContent = total;
    document.getElementById('paidCount').textContent = paid;
    document.getElementById('attendedCount').textContent = attended;
    document.getElementById('remainingCount').textContent = total - attended;
}

// Search Functionality
searchBtn.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim();
    const searchFieldValue = searchField.value;
    
    try {
        let query = db.collection("attendees").orderBy("registeredAt", "desc");
        const snapshot = await query.get();
        
        const filtered = snapshot.docs.filter(doc => {
            const data = doc.data();
            if (searchTerm) {
                const fieldValue = data[searchFieldValue]?.toString().toLowerCase();
                return fieldValue?.includes(searchTerm.toLowerCase());
            }
            return true;
        });
        
        const attendees = filtered.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                phone: data.phone,
                email: data.email || '',
                faculty: data.faculty || '',
                grade: data.grade || '',
                promo: data.promo || '',
                transaction: data.transaction || '',
                paymentMethod: data.paymentMethod || '',
                paymentStatus: data.paymentStatus || 'not_verified',
                attendanceStatus: data.attendanceStatus || 'not_entered',
                registeredAt: data.registeredAt?.toDate() || new Date()
            };
        });
        
        updateTable(attendees);
        updateStats(attendees);
        
    } catch (error) {
        console.error("Search error:", error);
        alert("Error searching attendees: " + error.message);
    }
});

// Verify Transaction
verifyTransactionBtn.addEventListener('click', async () => {
    const transaction = prompt("Enter transaction code to verify:");
    if (!transaction) return;
    
    try {
        const query = await db.collection("attendees")
            .where("transaction", "==", transaction)
            .get();
        
        if (query.empty) {
            alert("No attendees found with this transaction code");
            return;
        }
        
        const batch = db.batch();
        query.forEach(doc => {
            batch.update(doc.ref, {
                paymentStatus: "verified",
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        alert(`${query.size} attendee(s) marked as paid`);
        
    } catch (error) {
        console.error("Transaction verification error:", error);
        alert("Failed to verify transaction: " + error.message);
    }
});

// Export to CSV
exportBtn.addEventListener('click', async () => {
    try {
        const snapshot = await db.collection("attendees").get();
        let csv = 'Name,Phone,Email,Faculty,Grade,Promo Code,Payment Method,Transaction Code,Payment Status,Attendance Status,Registration Date,Entry Date,Verification Date\n';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const regDate = data.registeredAt?.toDate() || new Date();
            const entryDate = data.enteredAt?.toDate() || '';
            const verifyDate = data.verifiedAt?.toDate() || '';
            csv += `"${data.name}","${data.phone}","${data.email || ''}","${data.faculty || ''}","${data.grade || ''}","${data.promo || ''}","${data.transaction || ''}","${data.paymentStatus || 'not_verified'}","${data.attendanceStatus || 'not_entered'}","${regDate.toISOString()}","${entryDate ? entryDate.toISOString() : ''}","${verifyDate ? verifyDate.toISOString() : ''}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `tedx_attendees_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Export error:", error);
        alert("Failed to export data");
    }
});

// Export to XLSX
exportXlsxBtn.addEventListener('click', async () => {
    try {
        const snapshot = await db.collection("attendees").get();
        const data = [];
        
        // Header row
        data.push([
            "Name", "Phone", "Email", "Faculty", "Grade", 
            "Promo Code", "Payment Method","Transaction Code", "Payment Status", 
            "Attendance Status", "Registration Date", "Entry Date", "Verification Date"
        ]);
        
        // Data rows
        snapshot.forEach(doc => {
            const attendee = doc.data();
            data.push([
                attendee.name,
                attendee.phone,
                attendee.email || '',
                attendee.faculty || '',
                attendee.grade || '',
                attendee.promo || '',
                attendee.paymentMethod || '',
                attendee.transaction || '',
                attendee.paymentStatus || 'not_verified',
                attendee.attendanceStatus || 'not_entered',
                attendee.registeredAt?.toDate()?.toISOString() || '',
                attendee.enteredAt?.toDate()?.toISOString() || '',
                attendee.verifiedAt?.toDate()?.toISOString() || ''
            ]);
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        XLSX.writeFile(wb, `tedx_attendees_${new Date().toISOString().split('T')[0]}.xlsx`);
        
    } catch (error) {
        console.error("XLSX export error:", error);
        alert("Failed to export XLSX data");
    }
});

// Initialize
loginModal.style.display = 'flex';
dashboardContent.style.display = 'none';