// utils/updateStreak.js
function updateStreak(user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastReportDate) {
        user.streak = 1;
    } else {
        const last = new Date(user.lastReportDate);
        last.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // already reported today, streak unchanged
        } else if (diffDays === 1) {
            user.streak += 1;
        } else {
            user.streak = 1; // streak broken, restart
        }
    }
    user.lastReportDate = today;
}

export default updateStreak;