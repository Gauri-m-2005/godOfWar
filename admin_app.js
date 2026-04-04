import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const videos = [];
const usersDict = {};
let currentCategory = "all";
let searchQuery = "";

function requireAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    window.location.href = "login_page.html";
    return false;
  }
  return true;
}

window.logoutAdmin = function() {
    localStorage.removeItem("user");
    window.location.href = "login_page.html";
};

/****************** FILTER CATEGORY AND SEARCH ******************/

window.filterCat = function(category, btn) {
  if (!requireAuth()) return;
  currentCategory = category;

  // active navbar highlight
  document.querySelectorAll(".nav-link").forEach((b) => {
    b.classList.remove("active");
  });

  btn.classList.add("active");

  renderAll();
}

window.doSearch = function() {
  if (!requireAuth()) return;
  const input = document.getElementById("searchBar").value;
  searchQuery = input.toLowerCase();
  renderAll();
}

/****************** FETCH USERS & VIDEOS FROM FIREBASE ******************/

async function loadDataFromFirebase() {
  try {
    // 1. Fetch Users
    const usersSnapshot = await getDocs(collection(db, "users"));
    usersSnapshot.forEach(userDoc => {
        const u = userDoc.data();
        usersDict[userDoc.id] = { name: u.name, email: u.email };
    });

    // 2. Fetch Videos
    const querySnapshot = await getDocs(collection(db, "videos"));

    videos.length = 0; // clear array

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        ...data,
      });
    });

    renderAll();
  } catch (error) {
    console.error("Load Error:", error);
  }
}

/* ================= RENDER DASHBOARD GRID ================= */
function renderAll() {
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = "";

  let filteredVideos = videos;

  // First apply category filter
  if (currentCategory !== "all") {
    filteredVideos = filteredVideos.filter(
      (video) => video.category === currentCategory,
    );
  }

  // Then apply search filter
  if (searchQuery) {
    filteredVideos = filteredVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery) ||
        video.subject.toLowerCase().includes(searchQuery) ||
        video.category.toLowerCase().includes(searchQuery),
    );
  }

  if (filteredVideos.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1 / -1; padding: 20px; font-size: 1.2rem;'>No videos available in this category.</p>";
  }

  // Set Section Title
  if (searchQuery) {
    document.getElementById("sectionTitle").innerText =
      "Results for : " + searchQuery;
  } else {
    document.getElementById("sectionTitle").innerText =
      currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  }

  document.getElementById("sectionCount").innerText =
    filteredVideos.length + " videos";

  filteredVideos.forEach((video) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.minHeight = "300px";

    const uploaderInfo = usersDict[video.uploaderId] || { name: "Unknown", email: "Unknown" };

    div.innerHTML = `
            <div class="card-image">
                <a href="javascript:void(0);">
                    <video src="${video.url}" class="thumb" preload="metadata"></video>
                </a>   
            </div>
            <div class="card-content">
            <h3>${video.title}</h3>
            <p>${video.category} . ${video.subject}</p>
            <p style="font-size: 0.8rem; color: #a1a1aa; margin-bottom: 30px; line-height: 1.4;">
                <strong>Uploader:</strong> ${uploaderInfo.name} <br>
                <strong>Email:</strong> ${uploaderInfo.email}
            </p>                
                <span class="videos-no">${video.uploadedAt && video.uploadedAt.toDate ? video.uploadedAt.toDate().toLocaleDateString() : 'N/A'}</span>
                <button class="delete-btn" onclick="deleteVideo('${video.id}', '${video.uploaderId}', '${video.title.replace(/'/g, "\\'")}', event)">Delete</button>
            </div>
        `;

    div.onclick = (e) => { 
       if (!requireAuth()) return;
       window.location.href = "video_player_page_ui.html?id=" + video.id; 
    };

    grid.appendChild(div);
  });
}

window.deleteVideo = async function (id, uploaderId, videoTitle, event) {
  event.stopPropagation();
  
  if (!requireAuth()) return;

  const reason = prompt("Please write why you want to delete this video:");
  
  if (reason === null) {
      // User pressed cancel
      return;
  }
  
  if (reason.trim() === "") {
      alert("A reason is required to delete a video.");
      return;
  }

  try {
    // 1. Create a notification for the uploader
    if (uploaderId && uploaderId !== "null" && uploaderId !== "undefined") {
        await addDoc(collection(db, "notifications"), {
            userId: uploaderId,
            videoId: id,
            message: `Video "${videoTitle}" was taken down by admin. Reason: ${reason}`,
            createdAt: new Date(),
            read: false
        });
    }

    // 2. Delete the actual video document
    await deleteDoc(doc(db, "videos", id));
    
    // 3. Remove from local array
    const idx = videos.findIndex(v => v.id === id);
    if (idx > -1) videos.splice(idx, 1);
    
    renderAll();
    alert("Video deleted successfully and user notified.");
  } catch (error) {
    console.error("Error deleting video:", error);
    alert("Could not delete video.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (requireAuth()) {
      loadDataFromFirebase();
  }
});
