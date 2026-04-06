<script>
const EMOJIS=['🏃','🧘','📚','💪','🥗','🚴','✍️','🛁','🧹','💊','🎨','🎵','🌳','☕','🧃','🍎','💤','🤸','🦷','🧠'];
let selectedMood='';
let waterCount=0;
let habits=JSON.parse(localStorage.getItem('vitals_habits')||'[]');
let entries=JSON.parse(localStorage.getItem('vitals_entries')||'[]');

// Clock
function updateClock(){
  const now=new Date();
  document.getElementById('headerDate').textContent=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('headerTime').textContent=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const h=now.getHours();
  document.getElementById('greetingPart').textContent=h<12?'morning':h<17?'afternoon':'evening';
}
updateClock();setInterval(updateClock,1000);

// Tabs
document.querySelectorAll('.nav-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('page-'+tab.dataset.page).classList.add('active');
    if(tab.dataset.page==='history')renderHistory();
    if(tab.dataset.page==='insights')renderInsights();
  });
});

// Mood
document.querySelectorAll('.mood-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood=btn.dataset.mood;
    document.getElementById('moodLabel').textContent=btn.dataset.mood+' '+btn.dataset.label;
  });
});

// Energy
const energySlider=document.getElementById('energySlider');
const energyVal=document.getElementById('energyVal');
function updateEnergyColor(){
  const v=+energySlider.value;
  const col=v<=3?'#c96a45':v<=6?'#c9a84c':'#7a9e7e';
  energyVal.style.color=col;
  energyVal.parentElement.style.color=col;
}
energySlider.addEventListener('input',()=>{energyVal.textContent=energySlider.value;updateEnergyColor();});
updateEnergyColor();

// Water
function renderWater(){
  const drops=document.getElementById('waterDrops');
  drops.innerHTML='';
  for(let i=0;i<8;i++){
    const btn=document.createElement('button');
    btn.className='drop-btn'+(i<waterCount?' filled':'');
    btn.textContent=i<waterCount?'💧':'○';
    btn.title=`Glass ${i+1}`;
    btn.addEventListener('click',()=>{waterCount=i<waterCount?i:i+1;renderWater();});
    drops.appendChild(btn);
  }
  document.getElementById('waterLabel').textContent=`${waterCount} of 8 glasses (${waterCount*250} ml)`;
}
renderWater();

// Sleep
function calcSleep(){
  const bed=document.getElementById('sleepBed').value;
  const wake=document.getElementById('sleepWake').value;
  if(!bed||!wake)return;
  const[bh,bm]=bed.split(':').map(Number);
  const[wh,wm]=wake.split(':').map(Number);
  let t=(wh*60+wm)-(bh*60+bm);if(t<0)t+=1440;
  const h=Math.floor(t/60),m=t%60;
  const col=h<6?'var(--terracotta)':h>=7?'var(--sage)':'var(--gold)';
  const el=document.getElementById('sleepDuration');
  el.style.color=col;
  el.innerHTML=`${h}h ${m}m <span>of sleep</span>`;
}
document.getElementById('sleepBed').addEventListener('change',calcSleep);
document.getElementById('sleepWake').addEventListener('change',calcSleep);
calcSleep();

// Habits
function saveHabits(){localStorage.setItem('vitals_habits',JSON.stringify(habits));}
function renderHabits(){
  const list=document.getElementById('habitsList');
  list.innerHTML='';
  if(!habits.length){
    list.innerHTML='<div style="color:var(--brown-muted);font-size:.82rem;padding:6px 0;">No habits yet — add one below 👇</div>';
    return;
  }
  habits.forEach((habit,idx)=>{
    const row=document.createElement('div');
    row.className='habit-row'+(habit.done?' done':'');
    row.innerHTML=`<div class="habit-check">${habit.done?'✓':''}</div><span class="habit-icon">${habit.icon}</span><span class="habit-name">${habit.name}</span><span class="habit-streak">🔥 ${habit.streak||0}</span><button class="delete-btn" data-idx="${idx}" title="Remove">✕</button>`;
    row.addEventListener('click',e=>{
      if(e.target.classList.contains('delete-btn'))return;
      habits[idx].done=!habits[idx].done;
      saveHabits();renderHabits();
    });
    list.appendChild(row);
  });
  list.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      habits.splice(+btn.dataset.idx,1);
      saveHabits();renderHabits();
    });
  });
}

// Emoji picker
const emojiPick=document.getElementById('emojiPick');
const emojiOpts=document.getElementById('emojiOptions');
EMOJIS.forEach(em=>{
  const span=document.createElement('span');
  span.className='emoji-opt';span.textContent=em;
  span.addEventListener('click',()=>{document.getElementById('pickedEmoji').textContent=em;emojiPick.classList.remove('open');});
  emojiOpts.appendChild(span);
});
emojiPick.addEventListener('click',()=>emojiPick.classList.toggle('open'));
document.addEventListener('click',e=>{if(!emojiPick.contains(e.target))emojiPick.classList.remove('open');});

document.getElementById('addHabitBtn').addEventListener('click',()=>{
  const name=document.getElementById('newHabitInput').value.trim();
  const icon=document.getElementById('pickedEmoji').textContent;
  if(!name)return;
  habits.push({name,icon,done:false,streak:0});
  saveHabits();renderHabits();
  document.getElementById('newHabitInput').value='';
});
document.getElementById('newHabitInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('addHabitBtn').click();});
renderHabits();

// Save
document.getElementById('saveBtn').addEventListener('click',()=>{
  const today=new Date().toISOString().slice(0,10);
  const bed=document.getElementById('sleepBed').value;
  const wake=document.getElementById('sleepWake').value;
  let sleepHours=0;
  if(bed&&wake){
    const[bh,bm]=bed.split(':').map(Number),[wh,wm]=wake.split(':').map(Number);
    let t=(wh*60+wm)-(bh*60+bm);if(t<0)t+=1440;
    sleepHours=+(t/60).toFixed(1);
  }
  const entry={
    date:today,mood:selectedMood,energy:+energySlider.value,
    water:waterCount,sleep:sleepHours,bedtime:bed,wakeTime:wake,
    habits:habits.map(h=>({name:h.name,icon:h.icon,done:h.done})),
    note:document.getElementById('journalNote').value.trim(),
    savedAt:new Date().toISOString()
  };
  habits.forEach(h=>{if(h.done)h.streak=(h.streak||0)+1;else h.streak=0;});
  saveHabits();
  entries=entries.filter(e=>e.date!==today);
  entries.unshift(entry);
  localStorage.setItem('vitals_entries',JSON.stringify(entries));
  habits.forEach(h=>h.done=false);
  saveHabits();renderHabits();
  waterCount=0;renderWater();
  selectedMood='';
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('moodLabel').textContent='Select how you feel';
  energySlider.value=5;energyVal.textContent='5';updateEnergyColor();
  document.getElementById('journalNote').value='';
  const conf=document.getElementById('saveConfirm');
  conf.textContent='✓ Entry saved for '+new Date(today+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
  conf.style.opacity=1;
  setTimeout(()=>{conf.style.opacity=0;},3500);
});

// History
function renderHistory(){
  const grid=document.getElementById('historyGrid');
  grid.innerHTML='';
  if(!entries.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-icon">📓</div><h3>No entries yet</h3><p>Save your first entry on the Today tab to see your history here.</p></div>`;
    return;
  }
  entries.forEach((e,idx)=>{
    const card=document.createElement('div');
    card.className='history-entry';
    const doneHabits=(e.habits||[]).filter(h=>h.done).length;
    const dateStr=new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    card.innerHTML=`
      <div class="history-date"><span>${dateStr}</span><button class="delete-btn" data-idx="${idx}">✕ Delete</button></div>
      <div class="history-pills">
        ${e.mood?`<span class="pill pill-mood">${e.mood} Mood</span>`:''}
        ${e.energy?`<span class="pill pill-energy">⚡ Energy ${e.energy}/10</span>`:''}
        ${e.water?`<span class="pill pill-water">💧 ${e.water} glasses</span>`:''}
        ${e.sleep?`<span class="pill pill-sleep">🌙 ${e.sleep}h sleep</span>`:''}
        ${doneHabits?`<span class="pill pill-habits">✓ ${doneHabits} habit${doneHabits>1?'s':''}</span>`:''}
      </div>
      ${e.note?`<div class="history-note">"${e.note}"</div>`:''}
    `;
    card.querySelector('.delete-btn').addEventListener('click',()=>{
      entries.splice(idx,1);
      localStorage.setItem('vitals_entries',JSON.stringify(entries));
      renderHistory();
    });
    grid.appendChild(card);
  });
}

// Insights
function getLast7Dates(){
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10));}
  return days;
}

function renderInsights(){
  const last7dates=getLast7Dates();
  const last7=last7dates.map(d=>entries.find(e=>e.date===d)||null);
  const valid=last7.filter(Boolean);
  const avgEnergy=valid.length?(valid.reduce((s,e)=>s+(e.energy||0),0)/valid.length).toFixed(1):'--';
  const avgSleep=valid.length?(valid.reduce((s,e)=>s+(e.sleep||0),0)/valid.length).toFixed(1):'--';
  const avgWater=valid.length?(valid.reduce((s,e)=>s+(e.water||0),0)/valid.length).toFixed(1):'--';
  document.getElementById('insightsGrid').innerHTML=`
    <div class="insight-card"><div class="insight-icon">📓</div><div class="insight-value" style="color:var(--terracotta)">${valid.length}<small style="font-size:1rem">/7</small></div><div class="insight-label">Days Logged</div></div>
    <div class="insight-card"><div class="insight-icon">⚡</div><div class="insight-value" style="color:var(--gold)">${avgEnergy}</div><div class="insight-label">Avg Energy</div></div>
    <div class="insight-card"><div class="insight-icon">🌙</div><div class="insight-value" style="color:var(--lavender)">${avgSleep}h</div><div class="insight-label">Avg Sleep</div></div>
    <div class="insight-card"><div class="insight-icon">💧</div><div class="insight-value" style="color:var(--sky)">${avgWater}</div><div class="insight-label">Avg Glasses</div></div>
  `;
  renderBarChart('energyChart',last7,e=>e?e.energy:0,10,'var(--gold)',last7dates);
  renderBarChart('waterChart',last7,e=>e?e.water:0,8,'var(--sky)',last7dates);
  renderBarChart('sleepChart',last7,e=>e?e.sleep:0,10,'var(--lavender)',last7dates);
  renderHabitWeek(last7,last7dates);
}

function renderBarChart(id,data,valFn,max,color,dates){
  const chart=document.getElementById(id);chart.innerHTML='';
  data.forEach((entry,i)=>{
    const val=valFn(entry);
    const pct=max>0?(val/max)*100:0;
    const dayLabel=new Date(dates[i]+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'});
    const wrap=document.createElement('div');wrap.className='bar-wrap';
    wrap.innerHTML=`<div class="bar-val">${val||''}</div><div class="bar" style="height:${pct}%;background:${entry?color:'var(--border)'};opacity:${entry?1:0.35};" title="${val}"></div><div class="bar-day">${dayLabel}</div>`;
    chart.appendChild(wrap);
  });
}

function renderHabitWeek(last7,dates){
  const container=document.getElementById('habitWeekTable');
  if(!habits.length){
    container.innerHTML='<div style="color:var(--brown-muted);font-size:.82rem;text-align:center;padding:16px;">Add habits on the Today tab to track consistency here.</div>';
    return;
  }
  const dayHeaders=dates.map(d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'}));
  let html=`<table class="week-table"><thead><tr><th>Habit</th>${dayHeaders.map(d=>`<th>${d}</th>`).join('')}</tr></thead><tbody>`;
  habits.forEach(habit=>{
    html+=`<tr><td>${habit.icon} ${habit.name}</td>`;
    last7.forEach(entry=>{
      if(!entry){html+=`<td><div class="week-dot miss"></div></td>`;return;}
      const h=(entry.habits||[]).find(h=>h.name===habit.name);
      html+=`<td><div class="week-dot ${h&&h.done?'done':'miss'}">${h&&h.done?'✓':''}</div></td>`;
    });
    html+=`</tr>`;
  });
  html+='</tbody></table>';
  container.innerHTML=html;
}
</script>
