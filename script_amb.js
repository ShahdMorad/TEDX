        // DOM Elements
        const promoCodeInput = document.getElementById('promoCodeInput');
        const searchPromoBtn = document.getElementById('searchPromoBtn');
        const referralsList = document.getElementById('referralsList');
        const noReferralsMessage = document.getElementById('noReferralsMessage');
        const resultsTitle = document.getElementById('resultsTitle');
        const totalReferralsEl = document.getElementById('totalReferrals');
        const paidReferralsEl = document.getElementById('paidReferrals');
        const attendedReferralsEl = document.getElementById('attendedReferrals');
        const conversionRateEl = document.getElementById('conversionRate');

        // Firebase Configuration - Replace with your actual config
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

        // Search for referrals by promo code
        searchPromoBtn.addEventListener('click', async () => {
            const promoCode = promoCodeInput.value;
            
            if (!promoCode) {
                alert("Please enter your promo code");
                return;
            }
            
            try {
                showLoading();
                
                // Query Firestore for referrals with this promo code
                const querySnapshot = await db.collection("attendees")
                    .where("promo", "==", promoCode)
                    .get();
                
                if (querySnapshot.empty) {
                    showNoReferrals(`No referrals found for promo code: ${promoCode}`);
                    updateStats([]);
                    return;
                }
                
                const referrals = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    referrals.push({
                        id: doc.id,
                        name: data.name || 'No Name',
                        email: data.email || 'No Email',
                        phone: data.phone || 'No Phone',
                        faculty: data.faculty || '',
                        grade: data.grade || '',
                        promo: data.promo || '',
                        transaction: data.transaction || '',
                        paymentStatus: data.paymentStatus || 'not_verified',
                        attendanceStatus: data.attendanceStatus || 'not_entered',
                        registeredAt: data.registeredAt ? data.registeredAt.toDate() : new Date()
                    });
                });
                
                displayReferrals(referrals, promoCode);
                updateStats(referrals);
                
            } catch (error) {
                console.error("Error searching for referrals:", error);
                showNoReferrals("Error loading referrals. Please try again.");
            }
        });

        // Allow Enter key to trigger search
        promoCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPromoBtn.click();
            }
        });

        // Display referrals in the UI
        function displayReferrals(referrals, promoCode) {
            referralsList.innerHTML = '';
            noReferralsMessage.style.display = 'none';
            
            resultsTitle.textContent = `YOUR REFERRALS (${referrals.length}) - ${promoCode}`;
            
            referrals.forEach(referral => {
                const referralItem = document.createElement('div');
                referralItem.className = 'referral-item';
                
                // Format registration date
                const regDate = referral.registeredAt.toLocaleDateString();
                
                // Status badges
                const paymentClass = referral.paymentStatus === 'verified' ? 'status-verified' : 'status-not-verified';
                const paymentText = referral.paymentStatus === 'verified' ? 'PAID' : 'NOT PAID';
                
                const attendanceClass = referral.attendanceStatus === 'entered' ? 'status-entered' : 'status-not-entered';
                const attendanceText = referral.attendanceStatus === 'entered' ? 'ATTENDED' : 'NOT ATTENDED';
                
                referralItem.innerHTML = `
                    <div class="referral-info">
                        <div class="referral-name">${referral.name}</div>
                        <div class="referral-details">
                            <span class="referral-detail">
                                <i class="fas fa-envelope"></i> ${referral.email}
                            </span>
                            <span class="referral-detail">
                                <i class="fas fa-phone"></i> ${referral.phone}
                            </span>
                            <span class="referral-detail">
                                <i class="fas fa-calendar"></i> Registered: ${regDate}
                            </span>
                        </div>
                    </div>
                    <div class="referral-status">
                        <span class="status-badge ${paymentClass}">${paymentText}</span>
                        <span class="status-badge ${attendanceClass}">${attendanceText}</span>
                    </div>
                `;
                
                referralsList.appendChild(referralItem);
            });
        }

        // Show loading state
        function showLoading() {
            referralsList.innerHTML = '';
            noReferralsMessage.style.display = 'none';
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Searching for referrals...</p>
            `;
            
            referralsList.appendChild(loadingDiv);
        }

        // Show no referrals message
        function showNoReferrals(message) {
            referralsList.innerHTML = '';
            noReferralsMessage.innerHTML = `
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; color: #e50914;"></i>
                <p>${message}</p>
            `;
            noReferralsMessage.style.display = 'block';
            resultsTitle.textContent = 'YOUR REFERRALS';
        }

        // Update statistics
        function updateStats(referrals) {
            const total = referrals.length;
            const paid = referrals.filter(r => r.paymentStatus === 'verified').length;
            const attended = referrals.filter(r => r.attendanceStatus === 'entered').length;
            const conversionRate = total > 0 ? Math.round((paid / total) * 100) : 0;
            
            totalReferralsEl.textContent = total;
            paidReferralsEl.textContent = paid;
            attendedReferralsEl.textContent = attended;
            conversionRateEl.textContent = `${conversionRate}%`;
        }

        // Initialize
        window.onload = function() {
            // No default promo code - user needs to enter their own
        };