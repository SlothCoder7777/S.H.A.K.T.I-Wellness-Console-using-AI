
// Depth stack background
(function(){
  const stack = document.createElement("div");
  stack.className = "depth-stack";
  stack.innerHTML = '<div class="depth-layer depth-1"></div><div class="depth-layer depth-2"></div>';
  document.body.prepend(stack);
})();


// Toast
const toastLayer = document.getElementById("toastLayer");
function showToast(msg){
  if(!toastLayer) return;
  const t = document.createElement("div");
  t.className = "toast-card";
  t.textContent = msg;
  toastLayer.appendChild(t);
  requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),250); }, 3500);
}

// Time badge
function updateTime(){
  const el = document.getElementById("statusTime");
  if(!el) return;
  const t=new Date(); let h=t.getHours(), m=t.getMinutes(); if(m<10) m="0"+m; el.textContent = `${h}:${m}`;
}
updateTime(); setInterval(updateTime,15000);

// Collect vitals from current page if present
function collectVitals(){
  function val(id){ const e=document.getElementById(id); return e? e.value.trim() : ""; }
  function sel(id){ const e=document.getElementById(id); return e? e.value : ""; }
  return {
    age: val("age"), height: val("height"), weight: val("weight"),
    sleepHours: val("sleepHours"), waterIntake: val("waterIntake"),
    stressLevel: sel("stressLevel"), goal: val("goal"),
    symptoms: val("symptoms"), dietType: sel("dietType")
  };
}

// Snapshot calculations (Survey page)
const calcBtn = document.getElementById("calcBasicsBtn");
if(calcBtn){
  const snapshotBox = document.getElementById("snapshotBox");
  const bmiValue = document.getElementById("bmiValue");
  const bmiStatus = document.getElementById("bmiStatus");
  const calorieValue = document.getElementById("calorieValue");
  const waterGoalSpan = document.getElementById("waterGoalValue");
  const sleepTipSpan = document.getElementById("sleepTip");

  calcBtn.addEventListener("click", ()=>{
    const v = collectVitals();
    const h = parseFloat(v.height), w = parseFloat(v.weight);
    const sleep = parseFloat(v.sleepHours), water = parseFloat(v.waterIntake);
    let bmi=null, bmiCat="--";
    if(!isNaN(h) && !isNaN(w) && h>0){ const m=h/100; bmi = Math.round((w/(m*m))*10)/10;
      if(bmi<18.5) bmiCat="Underweight"; else if(bmi<25) bmiCat="Healthy"; else if(bmi<30) bmiCat="Overweight"; else bmiCat="Obese";
    }
    const estCal = (!isNaN(w)&&w>0)? Math.round(w*22) : "--";
    const waterGoal = (!isNaN(w)&&w>0)? (Math.round(w*0.035*10)/10)+"L" : "--";
    let tip="Aim ~7-9 hrs for most adults.";
    if(!isNaN(sleep)){ if(sleep<6) tip="Sleep is low. Try darker room, less phone late.";
      else if(sleep<7.5) tip="Decent, a little more would boost recovery.";
      else if(sleep<=9) tip="Great range. Keep consistent timing."; else tip="Quite long. If still tired, talk to a professional.";
    }
    if(bmiValue) bmiValue.textContent = (bmi!==null? bmi : "--");
    if(bmiStatus) bmiStatus.textContent = bmiCat;
    if(calorieValue) calorieValue.textContent = estCal;
    if(waterGoalSpan) waterGoalSpan.textContent = waterGoal;
    if(sleepTipSpan) sleepTipSpan.textContent = tip + (isNaN(water)?"":` | Logged ~${water}L today`);
    if(snapshotBox) snapshotBox.style.display = "block";
    showToast("Snapshot updated ✅");
  });
}

// AI Insights via /api/survey
const analyzeBtn = document.getElementById("analyzeBtn");
if(analyzeBtn){
  const surveyOutput = document.getElementById("surveyOutput");
  analyzeBtn.addEventListener("click", async ()=>{
    const res = await fetch("/api/survey",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(collectVitals())});
    let json={}; try{ json=await res.json(); }catch{}
    if(surveyOutput){ surveyOutput.style.display="block"; surveyOutput.textContent = json.answer || "Error getting insights."; }
    // persist for Insights tab
    try{ localStorage.setItem("shakti_last_insight", json.answer || ""); }catch{}
    showToast("Personalized wellness insights generated ✨");
  });
}

// Chat page
const chatBodyEl = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
function appendUserBubble(text){ const row=document.createElement("div"); row.className="msg-row"; row.innerHTML=`<div class="msg-user">${text}</div>`; chatBodyEl.appendChild(row); chatBodyEl.scrollTop=chatBodyEl.scrollHeight; }
function appendBotBubble(text){ const row=document.createElement("div"); row.className="msg-row"; row.innerHTML=`<div class="msg-bot">${text}</div>`; chatBodyEl.appendChild(row); chatBodyEl.scrollTop=chatBodyEl.scrollHeight; return row.firstChild; }

if(sendChatBtn && chatInput){
  sendChatBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown",(e)=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); } });
}

async function sendMessage(){
  const txt = chatInput.value.trim(); if(!txt) return;
  appendUserBubble(txt); chatInput.value="";
  const typing = appendBotBubble("S.H.A.K.T.I. is thinking...");
  const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:txt})});
  let json={}; try{ json=await res.json(); }catch{}
  typing.textContent = json.answer || "Error replying. Please try again.";
  // Save last chat reply snippet to use in PDF
  try{ localStorage.setItem("shakti_last_chat", typing.textContent); }catch{}
}

// PDF downloads
function makePdf(title, content){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"pt", format:"a4"});
  doc.setFont("Helvetica","bold"); doc.setFontSize(16); doc.text(title, 40, 50);
  doc.setFont("Helvetica","normal"); doc.setFontSize(12);
  const lines = doc.splitTextToSize(content, 515);
  doc.text(lines, 40, 80);
  doc.save(title.replaceAll(" ","_") + ".pdf");
}

// Survey: download report
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
if(downloadPdfBtn){
  downloadPdfBtn.addEventListener("click", ()=>{
    const el = document.getElementById("surveyOutput");
    const content = (el && el.textContent.trim()) ? el.textContent.trim() : "No insights yet. Generate first.";
    makePdf("S.H.A.K.T.I Wellness Report", content);
  });
}

// Chat: download transcript
const downloadChatPdfBtn = document.getElementById("downloadChatPdfBtn");
if(downloadChatPdfBtn){
  downloadChatPdfBtn.addEventListener("click", ()=>{
    const nodes = document.querySelectorAll("#chatBody .msg-row");
    let text = "";
    nodes.forEach(n=>{
      const b = n.querySelector(".msg-bot"); const u = n.querySelector(".msg-user");
      if(u) text += "You: " + u.textContent + "\n\n";
      if(b) text += "S.H.A.K.T.I.: " + b.textContent + "\n\n";
    });
    makePdf("S.H.A.K.T.I Chat Transcript", text || "No chat yet.");
  });
}

// Insights page wiring
const savedInsightsBox = document.getElementById("savedInsights");
if(savedInsightsBox){
  const saved = localStorage.getItem("shakti_last_insight") || "No insights saved yet. Generate from Survey page.";
  savedInsightsBox.textContent = saved;
  const savedBtn = document.getElementById("downloadSavedPdfBtn");
  const clearBtn = document.getElementById("clearSavedBtn");
  if(savedBtn){ savedBtn.addEventListener("click", ()=> makePdf("S.H.A.K.T.I Last Insight", savedInsightsBox.textContent || "")); }
  if(clearBtn){ clearBtn.addEventListener("click", ()=>{ localStorage.removeItem("shakti_last_insight"); savedInsightsBox.textContent="Cleared."; }); }
}


// --- Lightweight 3D tilt (no dependencies) ---
(function(){
  const MAX_DEFAULT = 8;
  const els = [...document.querySelectorAll("[data-tilt]")];
  function handle(e){
    const rect = this.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / (rect.width/2);
    const dy = (e.clientY - cy) / (rect.height/2);
    const max = parseFloat(this.getAttribute("data-tilt-max")) || MAX_DEFAULT;
    const rx = (dy * -max).toFixed(2);
    const ry = (dx *  max).toFixed(2);
    this.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }
  function reset(){ this.style.transform = ""; }
  els.forEach(el=>{
    el.style.transformStyle = "preserve-3d";
    el.addEventListener("mousemove", handle);
    el.addEventListener("mouseleave", reset);
  });
})();

// --- Scroll reveal for .reveal-3d ---
(function(){
  const io = new IntersectionObserver(entries=>{
    for(const ent of entries){
      if(ent.isIntersecting){
        ent.target.classList.add("revealed");
        io.unobserve(ent.target);
      }
    }
  }, {threshold:.15});
  document.querySelectorAll(".reveal-3d").forEach(n=>io.observe(n));
})();

// --- Register service worker for PWA feel (offline static caching) ---
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  });
}
