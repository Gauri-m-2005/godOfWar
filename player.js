import { db } from "./firebase.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let videos = [];
let currentVideoId = null;

function requireAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login_page.html";
    return false;
  }
  return true;
}

/* Load All Videos */
async function loadVideos() {
  if (!requireAuth()) return;

  const querySnapshot = await getDocs(collection(db, "videos"));

  videos.length = 0;

  querySnapshot.forEach((doc) => {
    videos.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  // Get clicked video ID
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("id");

  // Load selected video
  if (videoId) {
    const selectedVideo = videos.find((v) => v.id === videoId);

    if (selectedVideo) {
      loadMainVideo(selectedVideo);
    }
  } else if (videos.length > 0) {
    loadMainVideo(videos[0]);
  }
}

/* Load Main Player */

function loadMainVideo(video) {
  currentVideoId = video.id;

  document.getElementById("mainVideo").src = video.url;
  document.getElementById("title").innerText = video.title;
  document.getElementById("subject").innerText = video.subject;
  document.getElementById("desc").innerText = video.desc;

  renderSidebar();
}

window.redirectHome = function () {
  window.location.href = "index.html";
};
/* Sidebar Render */

function renderSidebar() {
  const list = document.getElementById("videoList");

  list.innerHTML = "";

  videos.forEach((video) => {
    if (video.id === currentVideoId) return;

    const div = document.createElement("div");
    div.className = "video-card";

    div.innerHTML = `
<video src="${video.url}"></video>
<div class="video-info">
<h4>${video.title}</h4>
<p>${video.subject}</p>
</div>
`;

    div.onclick = () => loadMainVideo(video);

    list.appendChild(div);
  });
}

/* Page Load */

loadVideos();
