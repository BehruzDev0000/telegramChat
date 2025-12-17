let elList=document.querySelector('.list')
let eLMessageForm=document.querySelector('.message-form')
let messagesList=get("messages")||[]
let elChooseImgInput=document.querySelector('.image-input')
let elMicrophoneIcon=document.querySelector('.microphone-icon')

let audioChunks=[]

function getDate(){
    let date=new Date().toString().split(" ")[4].split(":")
    let hour=date[0]
    let minutes=date[1]
    return `${hour}:${minutes}`
}

function set(key,value){
localStorage.setItem(key,typeof value =="object" ? JSON.stringify(value) : value)
}
function get(key){
    try {
        const result=JSON.parse(localStorage.getItem(key))
        return result
    } catch  {
        return localStorage.getItem(key)
    }
}
set("messages",messagesList)

renderMessage(messagesList, elList)

//Render message start
function renderMessage(arr,list){
list.innerHTML=null
arr.forEach((item)=>{
    let elItem=document.createElement("li")
     elItem.className="relative bg-[#0088cc] message-item p-2 ml-auto rounded-tl-[18px] rounded-bl-[18px] rounded-tr-[18px] w-[80%] text-shadow-md text-[16px] text-white mb-3"
     if(item.images){
           elItem.innerHTML=`
           <img class="w-full rounded-[18px]" src="${item.images}" alt="Test img">
               <p class="mt-[5px]">${item.content}</p>
                <div class="text-end pr-1">
                    <span class="text-[12px]">${item.createdAt}</span>
                </div>
           `
        list.appendChild(elItem)
    }
    else if(item.audio){
           elItem.className="relative p-2 ml-auto w-[80%] mb-3"
           elItem.innerHTML=`
               <audio controls class="ml-auto">
                   <source src="${item.audio}" type="audio/webm">
               </audio>
           `
        list.appendChild(elItem)
    }
    else{
    elItem.innerHTML=`
     <p>${item.content}</p>
                <div class="text-end pr-1">
                    <span class="text-[12px]">${item.createdAt}</span>
                </div>
    `
    list.appendChild(elItem)
    }
})
}

//Render message end


let imgUrl
// Choose Image start
elChooseImgInput.addEventListener("change",(e)=>{
    e.preventDefault()
    imgUrl=URL.createObjectURL(e.target.files[0]);  
})
// Choose Image end

//Message form start
eLMessageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    const data={
        id:messagesList[messagesList.length-1]?.id+1||1,
        images:imgUrl,
        content:e.target.message.value,
        createdAt:getDate()
    }
    messagesList.push(data)
    set("messages",messagesList)
    imgUrl=null
    e.target.reset()
renderMessage(messagesList,elList)
})
//Message form end

//Microphone voice recording start
let mediaRecorder;
let stream;
let isRecording = false;

elMicrophoneIcon.addEventListener("mousedown", async (e) => {
    if (isRecording) return;
    
    isRecording = true;
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({audio: true});
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const data = {
                id: messagesList[messagesList.length - 1]?.id + 1 || 1,
                audio: audioUrl,
                content: " ",
                createdAt: getDate()
            };
            
            messagesList.push(data);
            set("messages", messagesList);
            renderMessage(messagesList, elList);
            
            audioChunks = [];
            isRecording = false;
        };
        
        mediaRecorder.start();
        
    } catch (error) {
        console.error("Mikrofondan foydalanish uchun ruxsat berilmadi:", error);
        isRecording = false;
    }
});

elMicrophoneIcon.addEventListener("mouseup", (e) => {
    stopRecording();
});

elMicrophoneIcon.addEventListener("mouseleave", (e) => {
    if (isRecording) {
        stopRecording();
    }
});

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
}
// Microphone voice recording stop