async function render() {

    const resp = await fetch("/route/reports/mySubmissions", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await resp.json();
    const div = document.querySelector(".submissionList");

    const userIcons={
        "Garbage dump":"leaf",
        "Overflowing bin":"pin",
        "Open drainage":"leaf",
        "Plastic waste":"pin",
        "Stagnant water":"leaf",
        "Construction debris":"leaf",
        "Other":"pin"
    }
     const verifyIcons={
        "Verified":"check",
        "Partial Match":"half",
        "AI Verifying":"clock",
        "Rejected":"flag",
    }

    let html = "";
    data.forEach(r => {
        html += `<div class="sub_card"><span class="sub_card_svg"><svg class="icon"><use href="#i-${userIcons[r.category]}" /></svg></span>
            <div class="sub_card_body"><p style="font-size: 15px;color: #102017;font-weight: 600;">${r.title}</p>
            <div class="sub_card_body_data">
            <span>${r.category}</span>
            <span>${r.landmark || ""}</span>
            <span>${new Date(r.createdAt).toLocaleDateString()}</span></div>
            </div>
            <div class="sub_card_metadata"><span id="sub_card_metadata_i"
            style="font-size: 12px; background: #f2fbd8;border-radius: 12px; display: flex; gap :8px"><svg class="icon" style="width: 13px; height: 13px;"><use href="#i-${verifyIcons[r.status]}" /></svg>
            <span>${r.status}</span></span><span style="color: #235400;font-size: 12px;">+${r.pointsAwarded}</span></div></div>`;
    });
    div.innerHTML = html;

}
render()