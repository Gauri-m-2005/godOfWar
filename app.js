import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const videos = [];
let selectedFile = null;
let currentCategory = "all";
let searchQuery = "";

function requireAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login_page.html";
    return false;
  }
  return true;
}

window.checkLogin = function () {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    alert("Already Logged In");
  } else {
    window.location.href = "login_page.html";
  }
};

/****************** FILTER CATEGORY AND SEARCH ******************/

function filterCat(category, btn) {
  if (!requireAuth()) return;
  currentCategory = category;

  // active navbar highlight
  document.querySelectorAll(".nav-link").forEach((b) => {
    b.classList.remove("active");
  });

  btn.classList.add("active");

  renderAll();
}

function doSearch() {
  if (!requireAuth()) return;
  const input = document.getElementById("searchBar").value;
  searchQuery = input.toLowerCase();
  renderAll();
}

/****************** FETCH VIDEOS FROM FIREBASE ******************/

async function loadVideosFromFirebase() {
  try {
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
    renderSidebar();
  } catch (error) {
    console.error("Load Error:", error);
  }
}

/* ================= RENDER DASHBOARD GRID ================= */
function renderAll() {
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = "";

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    grid.innerHTML = "<p style='grid-column: 1 / -1; padding: 20px; font-size: 1.2rem; text-align: center;'>Please log in to view videos.</p>";
    document.getElementById("sectionCount").innerText = "0 videos";
    document.getElementById("sectionTitle").innerText = "Login Required";
    return;
  }

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
  /*          */

  if (filteredVideos.length === 0) {
    grid.innerHTML = "<p>No videos uploaded</p>";
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

  const isAdmin = user && user.role === 'admin';

  filteredVideos.forEach((video) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
            <div class="card-image">
                <a href="javascript:void(0);">
                    <video src="${video.url}" class="thumb"></video>
                </a>   
            </div>
            <div class="card-content">
            <h3>${video.title}</h3>
            <p>${video.category} . ${video.subject}</p>                
                <span class="videos-no">${video.uploadedAt.toDate().toLocaleDateString()}</span>
                ${isAdmin ? `<button class="delete-btn" onclick="deleteVideo('${video.id}', event)">Delete</button>` : ''}
            </div>
        `;

    div.onclick = (e) => { 
       if (!requireAuth()) return;
       window.location.href = "video_player_page_ui.html?id=" + video.id; 
    };

    grid.appendChild(div);
  });
}

/* ================= OPEN UPLOAD ================= */
function openUpload() {
  if (!requireAuth()) return;
  if (document.getElementById("uploadModal")) return;

  const modal = document.createElement("div");
  modal.id = "uploadModal";
  modal.className = "upload-modal";

  modal.innerHTML = `
        <div class="modal-box">

            <button class="modal-close" onclick="closeUpload()">✕</button>

            <div class="modal-header">
                <div class="modal-title">Upload Video</div>
                <div class="modal-sub">Add a video from your device</div>
            </div>

            <div class="modal-body">

                <div id="dropZone">
                    <input type="file" id="fileInput" accept="video/*">
                    <div class="drop-icon">🎬</div>
                    <div class="drop-title">Click or drag video</div>
                </div>

                <div id="selectedFile" class="hidden">
                    <div class="file-name">
                        <span>✅</span>
                        <span id="fileName"></span>
                    </div>
                    <span id="fileSize"></span>
                </div>

                <div class="field">
                    <label>Title</label>
                    <input type="text" id="vidTitle" placeholder="Enter video title">
                </div>
                
                <div class="field">
                <label>Category</label>
                <select id="vidCat">
                <option value="lectures">Lecture</option>
                <option value="workshops">Workshop</option>
                <option value="events">Event</option>
                <option value="movies">Movie</option>
                </select>
                </div>
                
                <div class="field">
                    <label>Subject</label>
                    <input type="text" id="vidSubject" placeholder="eg...Data Science">
                </div>

                <div class="field">
                    <label>Description</label>
                    <textarea id="vidDesc" placeholder="Enter video description"></textarea>
                </div>

            </div>

            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeUpload()">Cancel</button>
                <button class="btn-save" id="btnSaveVideo" onclick="saveVideo()">Save</button>
            </div>

        </div>
    `;

  document.body.appendChild(modal);

  const input = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");

  input.onchange = () => fileSelected(input);

  ["dragover", "drop"].forEach((e) => {
    dropZone.addEventListener(e, (ev) => ev.preventDefault());
  });

  dropZone.addEventListener("drop", (e) => {
    input.files = e.dataTransfer.files;
    fileSelected(input);
  });
}

/* ================= CLOSE ================= */
function closeUpload() {
  const modal = document.getElementById("uploadModal");
  if (modal) modal.remove();
  selectedFile = null;
}

/* ================= FILE SELECT ================= */
function fileSelected(input) {
  selectedFile = input.files[0];
  if (!selectedFile) return;

  document.getElementById("selectedFile").classList.remove("hidden");
  document.getElementById("fileName").innerText = selectedFile.name;
  document.getElementById("fileSize").innerText =
    (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";
}

/* ================= SAVE ================= */
async function saveVideo() {
  if (!selectedFile) return alert("Select a video");

  const title = document.getElementById("vidTitle").value;
  const cat = document.getElementById("vidCat").value;
  const desc = document.getElementById("vidDesc").value;
  const subject = document.getElementById("vidSubject").value;

  if (!title) return alert("Enter title");

  const btn = document.getElementById("btnSaveVideo");
  if (btn) {
    btn.innerText = "Uploading...";
    btn.disabled = true;
    btn.style.opacity = "0.7";
  }

  try {
    /* Cloudinary Code */
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "StremeAsia_Videos");

    const data = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dvz522def/video/upload", true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          if (btn) btn.innerText = "Uploading... " + percentComplete + "%";
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
             const err = JSON.parse(xhr.responseText);
             reject(new Error(err.error?.message || "Cloudinary error"));
          } catch {
             reject(new Error("Cloudinary error " + xhr.status));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error("Network Error"));
      xhr.send(formData);
    });

    const url = data.secure_url;

    /* Save Data */
    const user = JSON.parse(localStorage.getItem("user"));
    const videoData = {
      title: title,
      category: cat,
      desc: desc,
      subject: subject,
      uploadedAt: new Date(),
      url: url,
      uploaderId: user ? user.id : null,
    };

    /* Firebase database storing */
    const docRef = await addDoc(collection(db, "videos"), videoData);
    videoData.id = docRef.id;
    videos.push(videoData);

    closeUpload();
    renderAll();
    alert("Video has been successfully uploaded and saved!");
  } catch (error) {
    console.error("Upload Error:", error);
    alert("Upload failed: " + (error.message || "Unknown error"));
  } finally {
    if (btn) {
      btn.innerText = "Save";
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }
  return videos;
}

/* ================= VIDEO PLAYER JS ================= */

function loadVideo(video) {
  document.getElementById("mainVideo").src = video.url;
  document.getElementById("title").innerText = video.title;
  document.getElementById("subject").innerText = video.subject;
  document.getElementById("desc").innerText = video.desc;
}

function renderSidebar() {
  const list = document.getElementById("videoList");

  if (!list) return;

  list.innerHTML = "";

  videos.forEach((v) => {
    const div = document.createElement("div");
    div.className = "video-card";

    div.innerHTML = `
            <video src="${v.url}"></video>
            <div class="video-info">
                <h4>${v.title}</h4>
                <p>${v.subject}</p>
            </div>
        `;

    div.onclick = () => loadVideo(v);

    list.appendChild(div);
  });
}

// initial load
if (videos.length > 0) {
  loadVideo(videos[0]);
}
renderSidebar();

window.deleteVideo = async function (id, event) {
  event.stopPropagation();
  if (!confirm("Are you sure you want to delete this video?")) return;

  try {
    await deleteDoc(doc(db, "videos", id));
    // remove from local array
    const idx = videos.findIndex(v => v.id === id);
    if (idx > -1) videos.splice(idx, 1);
    
    renderAll();
  } catch (error) {
    console.error("Error deleting video:", error);
    alert("Could not delete video.");
  }
};

window.openProfile = function() {
  window.location.href = "user_panel.html";
};

document.addEventListener("DOMContentLoaded", () => {
  loadVideosFromFirebase();

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
      loginBtn.innerHTML = `Profile`;
      loginBtn.onclick = openProfile;
    }
  }

  window.openUpload = openUpload;
  window.closeUpload = closeUpload;
  window.saveVideo = saveVideo;
  window.filterCat = filterCat;
  window.doSearch = doSearch;
});

/* ================= ================ ================= */
