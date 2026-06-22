document.addEventListener("DOMContentLoaded", () => {
    fetchLeaderboardData();
});

async function fetchLeaderboardData() {
    try {
        // Fetch from your dynamic leaderboard route endpoint
        const response = await fetch("/route/reports/leaderboard");
        const data = await response.json();

        if (!response.ok) throw new Error("Could not retrieve standings");

        // Assuming endpoint passes { currentUserId: "id", users: [...] }
        const currentUserId = data.currentUserId; 
        const competitors = data.users || [];

        // Find logged-in user profile if provided in array to update Topbar components
        const currentUserProfile = competitors.find(u => u._id === currentUserId);
        if (currentUserProfile) {
            document.getElementById("totalPoints2").textContent = currentUserProfile.points.toLocaleString();
            document.getElementById("userCity").textContent = currentUserProfile.city;
            document.getElementById("tobar-left-u").textContent = 
                (currentUserProfile.firstName[0] + (currentUserProfile.lastName ? currentUserProfile.lastName[0] : "")).toUpperCase();
        }

        const rowsContainer = document.getElementById("leaderboard-rows");
        rowsContainer.innerHTML = "";

        // Iterate through rankings and match visualization architecture
        competitors.forEach((user, index) => {
            const rank = index + 1;
            const tr = document.createElement("tr");
            
            // Apply highlighting style to the active user's table row
            if (user._id === currentUserId) {
                tr.className = "current-user-row";
            }

            // Assign customized badges to podium ranks (1, 2, 3)
            let rankBadgeClass = "rank-norm";
            if (rank === 1) rankBadgeClass = "rank-1";
            if (rank === 2) rankBadgeClass = "rank-2";
            if (rank === 3) rankBadgeClass = "rank-3";

            const fullName = `${user.firstName} ${user.lastName || ""}`;
            const isYouTag = user._id === currentUserId ? " (You)" : "";

            tr.innerHTML = `
                <td><span class="rank-badge ${rankBadgeClass}">${rank}</span></td>
                <td><strong>${fullName}</strong>${isYouTag}</td>
                <td>${user.city || "General Zone"}</td>
                <td style="color: #c2410c; font-weight: 600;">🔥 ${user.streak || 0}d</td>
                <td><strong>${(user.points || 0).toLocaleString()} pts</strong></td>
            `;

            rowsContainer.appendChild(tr);
        });

        // Toggle visibility viewports
        document.getElementById("loading").style.display = "none";
        document.getElementById("table-container").style.display = "block";

    } catch (error) {
        console.error("Leaderboard component runtime failure:", error);
        document.getElementById("loading").textContent = "Failed to load dynamic standings. Please log in.";
    }
}