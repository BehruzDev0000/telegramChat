let elList = document.querySelector(".list");
let eLMessageForm = document.querySelector(".message-form");
let messagesList = [];
let elChooseImgInput = document.querySelector(".image-input");
let elMicrophoneIcon = document.querySelector(".microphone-icon");
let elCameraIcon = document.querySelector(".camera-icon");
let elMessageInput = document.querySelector(".message-input");

let audioChunks = [];
let videoChunks = [];
let imgUrl = null;
let editingMessageId = null;

function getDate() {
  let date = new Date().toString().split(" ")[4].split(":");
  let hour = date[0];
  let minutes = date[1];
  return `${hour}:${minutes}`;
}

renderMessage(messagesList, elList);

function renderMessage(arr, list) {
  list.innerHTML = "";
  arr.forEach((item) => {
    let elItem = document.createElement("li");
    elItem.className =
      "relative bg-[#0088cc] message-item p-3 ml-auto rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl w-[80%] text-white mb-3 group";
    elItem.dataset.id = item.id;

    let menuBtn = `
                    <button class="menu-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded bg-black/30" data-id="${item.id}" style="z-index: 10;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>
                `;

    if (item.images) {
      elItem.innerHTML = `
                        ${menuBtn}
                        <img class="w-full rounded-2xl" src="${item.images}" alt="Image">
                        <p class="mt-2 pr-8" contenteditable="false">${item.content}</p>
                        <div class="text-right pr-1 mt-1">
                            <span class="text-xs opacity-80">${item.createdAt}</span>
                        </div>
                    `;
    } else if (item.audio) {
      elItem.className = "relative p-2 ml-auto w-[80%] mb-3 group";
      elItem.innerHTML = `
                        <div class="relative">
                            ${menuBtn}
                            <audio controls class="ml-auto w-full pr-[40px]" style="pointer-events: auto;">
                                <source src="${item.audio}" type="audio/webm">
                            </audio>
                        </div>
                        <div class="text-right text-xs text-gray-600 mt-1">${item.createdAt}</div>
                    `;
    } else if (item.video) {
      elItem.className = "ml-auto rounded-lg mb-3 group";
      elItem.innerHTML = `
                        <div class="relative inline-block">
                            ${menuBtn}
                            <video class="rounded-lg ml-auto"  controls style="pointer-events: auto; display: block;">
                                <source src="${item.video}" type="video/webm">
                            </video>
                        </div>
                        <div class="text-right text-xs text-gray-600 mt-1">${item.createdAt}</div>
                    `;
    } else if (item.content && item.content.trim() !== "") {
      elItem.innerHTML = `
                        ${menuBtn}
                        <p class="pr-8" contenteditable="false">${item.content}</p>
                        <div class="text-right pr-1 mt-1">
                            <span class="text-xs opacity-80">${item.createdAt}</span>
                        </div>
                    `;
    }
    list.appendChild(elItem);
  });

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      showPopupMenu(
        e.target.closest(".menu-btn"),
        parseInt(e.target.closest(".menu-btn").dataset.id)
      );
    });
  });
}

function showPopupMenu(btn, messageId) {
  // Remove any existing popup
  document.querySelectorAll(".popup-menu").forEach((p) => p.remove());

  const message = messagesList.find((m) => m.id === messageId);
  const popup = document.createElement("div");
  popup.className = "popup-menu";

  const rect = btn.getBoundingClientRect();

  popup.style.position = "fixed";

  if (message.audio || message.video) {
    popup.style.top = rect.top + "px";
    popup.style.right = window.innerWidth - rect.left + 5 + "px";
  } else {
    popup.style.top = rect.bottom + 5 + "px";
    popup.style.right = window.innerWidth - rect.right + "px";
  }

  popup.style.zIndex = "9999";

  if (message.audio || message.video) {
    popup.innerHTML = `
                    <button class="delete-btn text-red-600" data-id="${messageId}">Delete</button>
                `;
  } else {
    popup.innerHTML = `
                    <button class="edit-btn text-blue-600" data-id="${messageId}">Edit</button>
                    <button class="delete-btn text-red-600" data-id="${messageId}">Delete</button>
                `;
  }

  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener("click", closePopup);
  }, 10);

  popup.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteMessage(messageId);
  });
  const editBtn = popup.querySelector(".edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editMessage(messageId);
    });
  }
}

function closePopup() {
  document.querySelectorAll(".popup-menu").forEach((p) => p.remove());
  document.removeEventListener("click", closePopup);
}

function deleteMessage(id) {
  messagesList = messagesList.filter((m) => m.id !== id);
  renderMessage(messagesList, elList);
  closePopup();
}

function editMessage(id) {
  const message = messagesList.find((m) => m.id === id);
  const messageElement = document.querySelector(`[data-id="${id}"]`);
  const textElement = messageElement.querySelector("p");

  if (textElement) {
    editingMessageId = id;
    elMessageInput.value = message.content;

    if (message.images) {
      imgUrl = message.images;
    }

    elMessageInput.focus();
    messageElement.classList.add("edit-mode");

    elMessageInput.placeholder = "Edit message";
  }
  closePopup();
}

function saveEdit(id, newContent, newImage = null) {
  const message = messagesList.find((m) => m.id === id);
  if (message) {
    message.content = newContent;
    if (newImage) {
      message.images = newImage;
    }
    renderMessage(messagesList, elList);
  }
}

// Choose Image
elChooseImgInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    imgUrl = URL.createObjectURL(e.target.files[0]);

    const fileName = e.target.files[0].name;
    console.log("Image selected:", fileName);
  }
});

// Message form
eLMessageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageContent = e.target.message.value.trim();

  if (editingMessageId) {
    saveEdit(editingMessageId, messageContent, imgUrl);
    editingMessageId = null;
    imgUrl = null;
    elMessageInput.placeholder = "Message";
    document
      .querySelectorAll(".edit-mode")
      .forEach((el) => el.classList.remove("edit-mode"));
    e.target.reset();
    return;
  }

  if (messageContent || imgUrl) {
    const data = {
      id:
        messagesList.length > 0
          ? messagesList[messagesList.length - 1].id + 1
          : 1,
      images: imgUrl || null,
      content: messageContent,
      createdAt: getDate(),
    };
    messagesList.push(data);
    imgUrl = null;
    e.target.reset();
    renderMessage(messagesList, elList);
    elList.scrollTop = elList.scrollHeight;
  }
});

// Microphone recording
let mediaRecorder;
let stream;
let isRecording = false;

elMicrophoneIcon.addEventListener("mousedown", async (e) => {
  if (isRecording) return;
  isRecording = true;
  elMicrophoneIcon.style.opacity = "0.5";

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const data = {
        id:
          messagesList.length > 0
            ? messagesList[messagesList.length - 1].id + 1
            : 1,
        audio: audioUrl,
        content: "",
        createdAt: getDate(),
      };

      messagesList.push(data);
      renderMessage(messagesList, elList);
      audioChunks = [];
      isRecording = false;
      elMicrophoneIcon.style.opacity = "1";
      elList.scrollTop = elList.scrollHeight;
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Microphone error:", error);
    isRecording = false;
    elMicrophoneIcon.style.opacity = "1";
  }
});

elMicrophoneIcon.addEventListener("mouseup", stopAudioRecording);
elMicrophoneIcon.addEventListener("mouseleave", () => {
  if (isRecording) stopAudioRecording();
});

function stopAudioRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}

// Camera recording
let videoRecorder;
let videoStream;
let isVideoRecording = false;

elCameraIcon.addEventListener("mousedown", async (e) => {
  if (isVideoRecording) return;
  isVideoRecording = true;
  elCameraIcon.style.opacity = "0.5";

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    videoRecorder = new MediaRecorder(videoStream);

    videoRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
      }
    };

    videoRecorder.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(videoBlob);

      const data = {
        id:
          messagesList.length > 0
            ? messagesList[messagesList.length - 1].id + 1
            : 1,
        video: videoUrl,
        content: "",
        createdAt: getDate(),
      };

      messagesList.push(data);
      renderMessage(messagesList, elList);
      videoChunks = [];
      isVideoRecording = false;
      elCameraIcon.style.opacity = "1";
      elList.scrollTop = elList.scrollHeight;
    };

    videoRecorder.start();
  } catch (error) {
    console.error("Camera error:", error);
    isVideoRecording = false;
    elCameraIcon.style.opacity = "1";
  }
});

elCameraIcon.addEventListener("mouseup", stopVideoRecording);
elCameraIcon.addEventListener("mouseleave", () => {
  if (isVideoRecording) stopVideoRecording();
});

function stopVideoRecording() {
  if (videoRecorder && videoRecorder.state === "recording") {
    videoRecorder.stop();
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
  }
}
