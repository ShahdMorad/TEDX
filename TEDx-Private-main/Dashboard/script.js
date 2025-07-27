// DOM Elements
const loginModal = document.getElementById('loginModal');
const dashboardContent = document.getElementById('dashboardContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const reviewModeContent = document.getElementById('reviewModeContent');
const searchInput = document.getElementById('searchInput');
const searchField = document.getElementById('searchField');
const statusFilter = document.getElementById('statusFilter');
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
const editStatus = document.getElementById('editStatus');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// For demo purposes
const ADMIN_PASSWORD = "tedx123";

// Initialize Firebase (make sure firebase-config.js is properly set up)
// Your Firebase initialization code should be in firebase-config.js

// Firestore reference


// Login Functionality
loginBtn.addEventListener('click', async () => {
    try {
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginModal.style.display = 'none';
            dashboardContent.style.display = 'block';
            reviewModeContent.style.display = 'block';
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
    loginModal.style.display = 'flex';
    dashboardContent.style.display = 'none';
    passwordInput.value = '';
});

// Load and Display Attendees
let unsubscribeAttendees = null;

function loadAttendees() {
    if (unsubscribeAttendees) {
        unsubscribeAttendees();
    }

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
                    email: data.email || '-',
                    faculty: data.faculty || '-',
                    grade: data.grade || '-',
                    promo: data.promo || '-',
                    transaction: data.transaction || '-',
                    status: data.status || 'not_entered',
                    registeredAt: data.registeredAt?.toDate() || new Date(),
                    enteredAt: data.enteredAt?.toDate() || null
                });
            });
            
            updateTable(attendees);
            updateStats(attendees);
        }, error => {
            console.error("Error loading attendees:", error);
            alert("Error loading attendee data");
        });
}

function updateTable(attendees) {
    const tableBody = document.getElementById('attendeesTableBody');
    tableBody.innerHTML = '';
    
    attendees.forEach(attendee => {
        const row = document.createElement('tr');
        const statusClass = attendee.status === 'entered' ? 'status-entered' : 'status-not-entered';
        const statusText = attendee.status === 'entered' ? 'ENTERED' : 'NOT ENTERED';
        const formattedDate = attendee.registeredAt.toLocaleDateString() + ' ' + 
                            attendee.registeredAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Check-in button is always shown but with different styles based on status
        const checkinBtnClass = attendee.status === 'entered' ? 'checked-in-btn' : 'checkin-btn';
        const checkinBtnText = attendee.status === 'entered' ? 'Checked In' : 'Check In';
        const checkinBtnIcon = attendee.status === 'entered' ? 'fa-check' : 'fa-check-circle';
        
        row.innerHTML = `
            <td>${attendee.name}</td>
            <td>${attendee.phone}</td>
            <td>${attendee.email}</td>
            <td>${attendee.promo}</td>
            <td>${attendee.transaction}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${formattedDate}</td>
            <td class="container-action-btn">
                <button class="action-btn ${checkinBtnClass}" data-id="${attendee.id}">
                    <i class="fas ${checkinBtnIcon}"></i> ${checkinBtnText}
                </button>
                <button class="action-btn edit-btn" data-id="${attendee.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" data-id="${attendee.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    // Attach event listeners
    attachCheckinButtonListeners();
    attachEditButtonListeners();
    attachDeleteButtonListeners();
}

function attachCheckinButtonListeners() {
    document.querySelectorAll('.checkin-btn, .checked-in-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const attendeeId = this.getAttribute('data-id');
            const isCheckedIn = this.classList.contains('checked-in-btn');
            
            if (!isCheckedIn) {
                try {
                    await db.collection("attendees").doc(attendeeId).update({
                        status: "entered",
                        enteredAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Update button appearance without reloading
                    this.innerHTML = '<i class="fas fa-check"></i> Checked In';
                    this.classList.remove('checkin-btn');
                    this.classList.add('checked-in-btn');
                    
                    // Update the status badge in the same row
                    const row = this.closest('tr');
                    if (row) {
                        const statusBadge = row.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.textContent = 'ENTERED';
                            statusBadge.classList.remove('status-not-entered');
                            statusBadge.classList.add('status-entered');
                        }
                    }
                    
                    // Update statistics
                    updateStatsAfterCheckin();
                    
                } catch (error) {
                    console.error("Check-in error:", error);
                    alert('Check-in failed: ' + error.message);
                }
            }
        });
    });
}

function updateStatsAfterCheckin() {
    const attendedCount = document.getElementById('attendedCount');
    const remainingCount = document.getElementById('remainingCount');
    const attendancePresent = document.getElementById('attendancePresent');
    const attendanceAbsent = document.getElementById('attendanceAbsent');
    const attendancePercent = document.getElementById('attendancePercent');
    
    if (attendedCount && remainingCount && attendancePresent && attendanceAbsent && attendancePercent) {
        const currentAttended = parseInt(attendedCount.textContent) + 1;
        const currentRemaining = parseInt(remainingCount.textContent) - 1;
        const total = currentAttended + currentRemaining;
        const percent = Math.round((currentAttended/total)*100);
        
        attendedCount.textContent = currentAttended;
        remainingCount.textContent = currentRemaining;
        attendancePresent.textContent = currentAttended;
        attendanceAbsent.textContent = currentRemaining;
        attendancePercent.textContent = `${percent}%`;
    }
}

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
                    editStatus.value = data.status || 'not_entered';
                    editModal.style.display = 'flex';
                }
            } catch (error) {
                console.error("Error loading attendee:", error);
                alert("Failed to load attendee data");
            }
        });
    });
}

function attachDeleteButtonListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const attendeeId = this.getAttribute('data-id');
            const confirmBox = document.createElement('div');
            confirmBox.className = 'delete-confirm';
            confirmBox.innerHTML = `
                <p>Are you sure you want to delete this attendee?</p>
                <button class="delete-confirm-btn delete-confirm-yes" data-id="${attendeeId}">Yes</button>
                <button class="delete-confirm-btn delete-confirm-no">No</button>
            `;
            
            const rect = this.getBoundingClientRect();
            confirmBox.style.left = `${rect.left}px`;
            confirmBox.style.top = `${rect.bottom + 5}px`;
            
            document.body.appendChild(confirmBox);
            confirmBox.style.display = 'block';
            
            confirmBox.querySelector('.delete-confirm-yes').addEventListener('click', async () => {
                try {
                    await db.collection("attendees").doc(attendeeId).delete();
                    confirmBox.remove();
                } catch (error) {
                    console.error("Error deleting attendee:", error);
                    alert("Failed to delete attendee");
                    confirmBox.remove();
                }
            });
            
            confirmBox.querySelector('.delete-confirm-no').addEventListener('click', () => {
                confirmBox.remove();
            });
            
            document.addEventListener('click', function closeConfirmBox(e) {
                if (!confirmBox.contains(e.target) && e.target !== btn) {
                    confirmBox.remove();
                    document.removeEventListener('click', closeConfirmBox);
                }
            });
        });
    });
}

// Save Edit
saveEditBtn.addEventListener('click', async () => {
    try {
        await db.collection("attendees").doc(editId.value).update({
            name: editName.value,
            phone: editPhone.value,
            email: editEmail.value,
            faculty: editFaculty.value,
            grade: editGrade.value,
            promo: editPromo.value,
            transaction: editTransaction.value,
            status: editStatus.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        editModal.style.display = 'none';
        loadAttendees(); // Refresh the table
    } catch (error) {
        console.error("Error updating attendee:", error);
        alert("Failed to update attendee");
    }
});

// Cancel Edit
cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Update Statistics
function updateStats(attendees) {
    const total = attendees.length;
    const attended = attendees.filter(a => a.status === 'entered').length;
    const remaining = total - attended;
    const percent = total > 0 ? Math.round((attended/total)*100) : 0;
    
    // Helper function to safely set text content
    const setTextIfExists = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    setTextIfExists('totalAttendees', total);
    setTextIfExists('attendedCount', attended);
    setTextIfExists('remainingCount', remaining);
    setTextIfExists('attendanceTotal', total);
    setTextIfExists('attendancePresent', attended);
    setTextIfExists('attendanceAbsent', remaining);
    setTextIfExists('attendancePercent', `${percent}%`);
    
    if (attendees.length > 0) {
        const latest = new Date(Math.max(...attendees.map(a => a.registeredAt)));
        setTextIfExists('latestRegistration', latest.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    } else {
        setTextIfExists('latestRegistration', '-');
    }
}

// REVIEW MODE SEARCH FUNCTIONALITY
searchBtn.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim();
    const searchFieldValue = searchField.value;
    const statusFilterValue = statusFilter.value;
    
    try {
        // First get all attendees ordered by registeredAt
        let query = db.collection("attendees").orderBy("registeredAt", "desc");
        const snapshot = await query.get();
        
        // Filter in memory
        const filtered = snapshot.docs.filter(doc => {
            const data = doc.data();
            
            // Apply status filter if not 'all'
            if (statusFilterValue !== 'all' && data.status !== statusFilterValue) {
                return false;
            }
            
            // Apply search term filter if provided
            if (searchTerm) {
                const fieldValue = data[searchFieldValue]?.toString().toLowerCase();
                if (!fieldValue?.includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }
            
            return true;
        });
        
        if (filtered.length === 0) {
            alert('No attendees found matching your criteria');
            return;
        }
        
        const attendees = filtered.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                phone: data.phone,
                email: data.email || '-',
                faculty: data.faculty || '-',
                grade: data.grade || '-',
                promo: data.promo || '-',
                transaction: data.transaction || '-',
                status: data.status || 'not_entered',
                registeredAt: data.registeredAt?.toDate() || new Date()
            };
        });
        
        updateTable(attendees);
        updateStats(attendees);
        
    } catch (error) {
        console.error("Review mode search error:", error);
        alert("Error searching attendees: " + error.message);
    }
});

// Export to CSV
exportBtn.addEventListener('click', async () => {
    try {
        const snapshot = await db.collection("attendees").get();
        let csv = 'Name,Phone,Email,Faculty,Grade,Promo Code,Transaction Code,Status,Registration Date,Entry Date\n';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const regDate = data.registeredAt?.toDate() || new Date();
            const entryDate = data.enteredAt?.toDate() || '';
            csv += `"${data.name}","${data.phone}","${data.email || ''}","${data.faculty || ''}","${data.grade || ''}","${data.promo || ''}","${data.transaction || ''}","${data.status || 'not_entered'}","${regDate.toISOString()}","${entryDate ? entryDate.toISOString() : ''}"\n`;
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
        
        // Create header row
        const headers = [
            "Name", "Phone", "Email", "Faculty", "Grade", 
            "Promo Code", "Transaction Code", "Status", 
            "Registration Date", "Entry Date"
        ];
        data.push(headers);
        
        // Add data rows
        snapshot.forEach(doc => {
            const attendee = doc.data();
            const row = [
                attendee.name,
                attendee.phone,
                attendee.email || '',
                attendee.faculty || '',
                attendee.grade || '',
                attendee.promo || '',
                attendee.transaction || '',
                attendee.status || 'not_entered',
                attendee.registeredAt?.toDate()?.toISOString() || '',
                attendee.enteredAt?.toDate()?.toISOString() || ''
            ];
            data.push(row);
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        
        // Generate XLSX file and trigger download
        XLSX.writeFile(wb, `tedx_attendees_${new Date().toISOString().split('T')[0]}.xlsx`);
        
    } catch (error) {
        console.error("XLSX export error:", error);
        alert("Failed to export XLSX data");
    }
});

// Initialize the dashboard
if (window.location.href.includes('dashboard')) {
    loginModal.style.display = 'flex';
    dashboardContent.style.display = 'none';
}