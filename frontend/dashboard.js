async function render() {

    const resp = await fetch("/route/reports/dashboard", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const data = await resp.json();
    const user = data.u;
    const reports = data.r;

    const totalPoints2  = document.querySelector("#totalPoints2");
    const userShort     = document.querySelector("#tobar-left-u");
    const userFirstName = document.querySelector("#userFirstName");
    const userCity       = document.querySelector("#userCity");
    const totalPoints    = document.querySelector("#totalPoints");
    const cityRank        = document.querySelector("#cityRank");
    const userCity2       = document.querySelector("#userCity2");
    const verifiedNum     = document.querySelector("#verifiedNum");
    const streak          = document.querySelector("#streak");
    const rightPannel_body = document.querySelector(".rightPannel_body");

    totalPoints2.textContent  = user.points;
    totalPoints.textContent   = user.points;
    userFirstName.textContent = user.firstName;
    userCity.textContent      = user.city;
    userCity2.textContent     = user.city;
    cityRank.textContent      = `#${user.cityRank}`;
    verifiedNum.textContent   = user.verifiedNum;
    streak.textContent        = user.streak;
    userShort.textContent     = (user.firstName[0] + user.lastName[0]).toUpperCase();

    const verifyIcons = {
        "Verified": "check",
        "Partial Match": "half",
        "AI Verifying": "clock",
        "Rejected": "flag",
    };

    let feedHTML = "";
reports.forEach(rep => {
    const icon = verifyIcons[rep.status] || "check";
    const author = rep.userId; // populated { firstName, lastName }
    const initials = author ? (author.firstName[0] + author.lastName[0]).toUpperCase() : "?";
    const authorName = author ? `${author.firstName} ${author.lastName}` : "Unknown user";

    feedHTML += `<div class="feed_item">
                    <span class="feed_item_avtr">${initials}</span>
                    <div class="feed_item_data">
                        <div class="feed_item_top">
                            <span style="font-size: 14px;color: #102017;font-weight: 600">${authorName}</span>
                            <span style="color: #a9bbaf;font-size: 12px;">${new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p class="feed_item_text">Cleaned <span style="color: #33473c;font-size: 14px;font-weight: 600">${rep.category}</span> at ${rep.landmark || "an unspecified location"}</p>
                        <div class="feed_item_metadata">
                            <span id="feed_item_metadata_i" style="font-size: 12px;padding: 5px 10px; background: #f2fbd8;border-radius: 12px; display: flex; gap:8px">
                                <svg class="icon" style="width: 10px; height:10px;"><use href="#i-${icon}" /></svg>${rep.status}
                            </span>
                            <span style="color: #235400;font-size: 12px;">+${rep.pointsAwarded} pts</span>
                        </div>
                    </div>
                </div>`;
});

rightPannel_body.innerHTML = feedHTML;
}

render();