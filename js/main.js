let elList=document.querySelector('.list')
let eLMessageForm=document.querySelector('.message-form')
let messagesList=get("messages")||[]
let elChooseImgInput=document.querySelector('.image-input')
let date=new Date().toString().split(" ")[4].split(":")
let hour=date[0]
let minutes=date[1]


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

//Render message start
function renderMessage(arr,list){
list.innerHTML=null
arr.forEach((item)=>{
    let elItem=document.createElement("li")
     elItem.className="relative bg-[#0088cc] message-item p-2 ml-auto rounded-tl-[18px] rounded-bl-[18px] rounded-tr-[18px] w-[80%] text-shadow-md text-[16px] text-white"
   if(!item.content==" "){
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
    else{
    elItem.innerHTML=`
     <p>${item.content}</p>
                <div class="text-end pr-1">
                    <span class="text-[12px]">${item.createdAt}</span>
                </div>
    `
    list.appendChild(elItem)
    }
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
        createdAt:`${hour}:${minutes}`
    }
    messagesList.push(data)
    set("messages",messagesList)
    imgUrl=null
    e.target.reset()
renderMessage(messagesList,elList)
})
//Message form end