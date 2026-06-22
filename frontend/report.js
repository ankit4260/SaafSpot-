const reportForm = document.querySelector("#reportForm");
const afterPhotoField = document.querySelector("#afterPhotoField");
const videoField = document.querySelector("#videoField");
const actionRadios = document.querySelectorAll('input[name="action"]');
const locateBtn = document.querySelector("#locateBtn");
const mapCoords = document.querySelector("#mapCoords");

let lat = null;
let lng = null;
let marker = null;

// ---- map setup ----
const map = L.map("reportMap").setView([26.9124, 75.7873], 13); // Jaipur default
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

map.on("click", function (e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    mapCoords.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
});

locateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
        mapCoords.textContent = "Geolocation not supported";
        return;
    }
    navigator.geolocation.getCurrentPosition(function (pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        map.setView([lat, lng], 16);
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map);
        mapCoords.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    }, function () {
        mapCoords.textContent = "Could not fetch location";
    });
});

// ---- toggle after photo / video fields based on action ----
actionRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        if (this.value === "clean") {
            afterPhotoField.hidden = false;
            videoField.hidden = false;
        } else {
            afterPhotoField.hidden = true;
            videoField.hidden = true;
        }
    });
});

// ---- submit ----
reportForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (lat === null || lng === null) {
        alert("please drop a pin on the map");
        return;
    }

    const title = reportForm.title.value;
    const category = reportForm.category.value;
    const description = reportForm.description.value;
    const landmark = reportForm.landmark.value;
    const beforePhoto = reportForm.beforePhoto.files[0];
    const afterPhoto = reportForm.afterPhoto.files[0];
    const video = reportForm.videoProof.files[0];

    const fd = new FormData();
    fd.append("title", title);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("landmark", landmark);
    fd.append("location", JSON.stringify({
        type: "Point",
        coordinates: [lat, lng]
    }));

    if (beforePhoto) fd.append("beforePhoto", beforePhoto);
    if (afterPhoto) fd.append("afterPhoto", afterPhoto);
    if (video) fd.append("video", video);

    try {
        const resp = await fetch("/route/reports/report", {
            method: "POST",
            body: fd
        });
        const data = await resp.json();

        if (data.msg === "success") {
            alert("report submitted");
            reportForm.reset();
        } else {
            alert(data.msg || "something went wrong");
        }
    }
    catch (err) {
        console.error("error while submitting report :", err);
        alert("err while submitting report");
    }
});
