import { getLoginUrl, logout, getMessages, getToken, me, openWebsocket, sendMessage, deleteMessages, getMessage } from './ChatApi';

const ROOM_NUMBER = 1; // you can change the chat room 

function e(id) {
    return document.getElementById(id);
}

async function checkLogin() {
    const res = await me();
    if(res.ok) {        
        const user = res.res;
        e("username").innerHTML = `login on room No.${user.room_id} as ${user.name}`;
        const logout_button = document.createElement('button');
        logout_button.innerText = "logout";
        logout_button.onclick = ()=>{ logout(); }
        e("username").appendChild(logout_button);
    }else {
        e("username").innerHTML = `<a href='${getLoginUrl(ROOM_NUMBER)}'>login</a>`;
    }
}

var message_log = [];

function showMessages() {
    const div = document.createElement("div");
    for(const m of message_log) {
        const idiv = document.createElement("div");
        idiv.innerHTML = `id(${m.id}) from(${m.sender_id.substr(0,4)}...) : ${m.text}`;
        idiv.onclick = async (event)=>{
            const res = await getMessage(m.id);
            if(res.ok) {
                e("message_detail").innerText = JSON.stringify(res.res);
            }else {
                e("message_detail").innerText = JSON.stringify(res.err);
            }
        }
        div.appendChild(idiv);
    }
    e("message_log").appendChild(div);
    
}

async function readMessages() {
    const res = await getMessages();

    if(res.ok) {
        message_log = res.res;
        showMessages();
    }else {
        const html = `<p>error ${res.err}</p>`
        e("message_log").innerHTML = html;
    }
}

getToken();

openWebsocket({
    onopen:()=>{console.log("open a socket")},
    onclose:(e)=>{
        console.log("the websocket closed",e)
    },
    onmessage:async (message)=>{
        message_log.push(message);
        showMessages();
    }
})

checkLogin().then(async ()=>{
    await readMessages();

    e("post").onclick = (event)=>{
        const text = e("message").value
        const result = sendMessage({
            text,
            type:"post"
        });
        if(!result) {
            console.log("The websocket disconnected. Reloading...");
            window.location.reload();
        }
    }

    e("delete_all").onclick = async (event) => {
        await deleteMessages();
        window.location.reload();
    }
})