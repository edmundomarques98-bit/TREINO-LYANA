const PLAN = {
  weeks: {
    1: { strategy: "Adaptação: use 2 séries nos exercícios, exceto panturrilha, abdômen e cardio.", runA: ["20 min", "1 min correndo + 2 min caminhando"], runB: ["25 min", "1 min correndo + 2 min caminhando"] },
    2: { strategy: "Adaptação: mantenha a técnica e 2 séries nos exercícios principais.", runA: ["20 min", "1min30 correndo + 1min30 caminhando"], runB: ["25 min", "1min30 correndo + 1min30 caminhando"] },
    3: { strategy: "Passe a usar o número completo de séries, mantendo o RPE previsto.", runA: ["25 min", "2 min correndo + 1min30 caminhando"], runB: ["30 min", "2 min correndo + 1min30 caminhando"] },
    4: { strategy: "Consolide o volume completo sem buscar falha muscular.", runA: ["25 min", "3 min correndo + 1min30 caminhando"], runB: ["30 min", "3 min correndo + 1min30 caminhando"] },
    5: { strategy: "Ao atingir o topo das repetições com boa técnica, aumente a carga gradualmente.", runA: ["30 min", "4 min correndo + 1min30 caminhando"], runB: ["35 min", "5 min correndo + 1min30 caminhando"] },
    6: { strategy: "Continue a progressão, sem aumentar carga e volume simultaneamente.", runA: ["30 min", "6 min correndo + 1 min caminhando"], runB: ["40 min", "8 min correndo + 1 min caminhando"] }
  },
  agenda: [
    ["Segunda", "Quadríceps", "workout-1"],
    ["Terça", "Superiores + corrida A", "workout-2"],
    ["Quarta", "Caminhada leve ou descanso", "rest"],
    ["Quinta", "Posteriores + glúteos", "workout-3"],
    ["Sexta", "Descanso", "rest"],
    ["Sábado", "Corrida B + complementos", "run-b"],
    ["Domingo", "Descanso e mobilidade", "rest"]
  ],
  workouts: [
    {
      id: "workout-1", day: "Segunda-feira", title: "Quadríceps",
      intro: "Aquecimento: 5 min de esteira ou bicicleta + 1 série leve dos dois primeiros exercícios.",
      exercises: [
        ["Agachamento no Smith para banco", "3", "8–10", "6–7", "90–120"],
        ["Leg press 45°", "3", "10–12", "7", "90–120"],
        ["Cadeira extensora", "2", "12–15", "7", "60–90"],
        ["Afundo estático com apoio", "2", "8–10 por perna", "6", "60–90"],
        ["Panturrilha no leg press", "3", "12–15", "7", "60–90"],
        ["Prancha abdominal", "3", "20–30 s", "6", "45–60"]
      ]
    },
    {
      id: "workout-2", day: "Terça-feira", title: "Superiores + corrida A",
      intro: "Faça a musculação primeiro e depois a corrida leve. O ritmo deve permitir falar frases curtas.",
      exercises: [
        ["Puxada frontal na polia", "3", "10–12", "7", "60–90"],
        ["Remada baixa sentada", "3", "10–12", "7", "60–90"],
        ["Supino na máquina", "2", "10–12", "6–7", "60–90"],
        ["Elevação lateral", "2", "12–15", "7", "60"],
        ["Tríceps na polia", "2", "12–15", "7", "60"],
        ["Rosca na polia ou máquina", "2", "12–15", "7", "60"]
      ]
    },
    {
      id: "workout-3", day: "Quinta-feira", title: "Posteriores de coxa + glúteos",
      intro: "Aquecimento: 5 min leves + 1 série leve de terra romeno e mesa flexora.",
      exercises: [
        ["Terra romeno com halteres", "3", "8–10", "6–7", "90–120"],
        ["Mesa flexora", "3", "10–12", "7", "60–90"],
        ["Elevação pélvica na máquina ou Smith", "3", "10–12", "7", "90"],
        ["Leg press com pés mais altos", "2", "10–12", "7", "90"],
        ["Cadeira flexora unilateral", "2", "12 por perna", "7", "60–90"],
        ["Abdução de quadril na máquina", "2", "15–20", "7", "60"],
        ["Dead bug", "3", "8–10 por lado", "6", "45–60"]
      ]
    },
    {
      id: "run-b-support", day: "Sábado", title: "Complementos após a corrida",
      intro: "Faça apenas se as pernas estiverem bem. Descanse 45–60 s entre as séries.",
      exercises: [
        ["Panturrilha em pé ou na máquina", "2", "12–15", "6–7", "45–60"],
        ["Elevação da ponta dos pés (tibial)", "2", "15–20", "6", "45–60"],
        ["Step-down em degrau baixo", "2", "8 por perna", "6", "45–60"],
        ["Prancha lateral", "2", "20–30 s por lado", "6", "45–60"]
      ]
    }
  ]
};

const STORAGE_KEY = "meuTreino6Semanas-v1";
const defaultState = {
  week: 1, theme: "light", agenda: {}, exercises: {}, sessions: {},
  runs: {}, recovery: [], measures: []
};
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(defaultState), ...(saved || {}) };
  } catch { return structuredClone(defaultState); }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderStats();
}
function key(...parts) { return parts.join("|"); }
function todayISO() { return new Date().toISOString().slice(0,10); }
function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function init() {
  $("#weekSelect").value = state.week;
  document.documentElement.dataset.theme = state.theme;
  $("#recoveryDate").value = todayISO();
  $("#measureDate").value = todayISO();

  PLAN.workouts.forEach(w => {
    $("#workoutSelect").insertAdjacentHTML("beforeend", `<option value="${w.id}">${w.day} — ${w.title}</option>`);
  });
  const allExercises = [...new Set(PLAN.workouts.flatMap(w => w.exercises.map(e => e[0])))];
  allExercises.forEach(e => $("#progressExercise").insertAdjacentHTML("beforeend", `<option>${escapeHTML(e)}</option>`));

  bindTabs();
  bindControls();
  renderAll();
  registerServiceWorker();
}

function renderAll() {
  renderWeek();
  renderAgenda();
  renderWorkout();
  renderRuns();
  renderRecoveryHistory();
  renderMeasures();
  renderProgressCharts();
  renderStats();
}

function renderWeek() {
  $("#weekTitle").textContent = `Semana ${state.week}`;
  $("#weekStrategy").textContent = PLAN.weeks[state.week].strategy;
}

function bindTabs() {
  $$(".tab").forEach(btn => btn.addEventListener("click", () => {
    $$(".tab").forEach(b => b.classList.toggle("active", b === btn));
    $$(".tab-panel").forEach(p => p.classList.toggle("active", p.id === btn.dataset.tab));
    if (btn.dataset.tab === "evolucao") renderProgressCharts();
  }));
}

function bindControls() {
  $("#weekSelect").addEventListener("change", e => {
    state.week = Number(e.target.value); saveState(); renderAll();
  });
  $("#themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = state.theme; saveState();
  });
  $("#workoutSelect").addEventListener("change", renderWorkout);
  $("#progressExercise").addEventListener("change", renderProgressCharts);
  $("#sessionNotes").addEventListener("input", saveSessionNotes);
  $("#completeWorkoutBtn").addEventListener("click", () => setWorkoutStatus("done"));
  $("#skipWorkoutBtn").addEventListener("click", () => setWorkoutStatus("skipped"));
  $("#resetWeekBtn").addEventListener("click", resetWeek);
  $("#paceDistance").addEventListener("input", calcPace);
  $("#paceMinutes").addEventListener("input", calcPace);

  [["sleepScore","sleepOut"],["energyScore","energyOut"],["sorenessScore","sorenessOut"],["jointPainScore","jointPainOut"],["stressScore","stressOut"]]
    .forEach(([input,out]) => $(`#${input}`).addEventListener("input", e => $(`#${out}`).value = e.target.value));

  $("#saveRecoveryBtn").addEventListener("click", () => saveRecovery(false));
  $("#markRestBtn").addEventListener("click", () => saveRecovery(true));
  $("#saveMeasureBtn").addEventListener("click", saveMeasure);
  $("#exportBtn").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", importData);
  $("#eraseBtn").addEventListener("click", eraseAll);

  $("#minusTimer").addEventListener("click", () => adjustTimer(-15));
  $("#plusTimer").addEventListener("click", () => adjustTimer(15));
  $("#pauseTimer").addEventListener("click", pauseTimer);
}

function renderStats() {
  const weekPrefix = `${state.week}|`;
  const doneDays = Object.entries(state.agenda).filter(([k,v]) => k.startsWith(weekPrefix) && v === "done").length;
  const restDays = Object.entries(state.agenda).filter(([k,v]) => k.startsWith(weekPrefix) && v === "rest").length;
  const exerciseEntries = Object.entries(state.exercises).filter(([k]) => k.startsWith(weekPrefix));
  const completedExercises = exerciseEntries.filter(([,v]) => v.done).length;
  const totalPlanned = PLAN.workouts.reduce((a,w) => a + w.exercises.length, 0);
  const runs = Object.entries(state.runs).filter(([k]) => k.startsWith(weekPrefix) && k.endsWith("|done") && k);
  const runDone = ["A","B"].filter(type => state.runs[key(state.week,type,"done")]).length;
  $("#stats").innerHTML = [
    [doneDays, "dias concluídos"],
    [completedExercises + "/" + totalPlanned, "exercícios marcados"],
    [runDone + "/2", "corridas concluídas"],
    [restDays, "dias de descanso"]
  ].map(([v,l]) => `<article class="stat"><strong>${v}</strong><span>${l}</span></article>`).join("");
}

function renderAgenda() {
  $("#agendaGrid").innerHTML = PLAN.agenda.map(([day, desc], i) => {
    const k = key(state.week, i);
    const status = state.agenda[k] || "pending";
    const label = status === "done" ? "Concluído" : status === "rest" ? "Descanso" : "Pendente";
    return `<article class="day-card" data-status="${status}">
      <span class="day-status">${label}</span>
      <h3>${day}</h3><p>${desc}</p>
      <div class="day-actions">
        <button data-day="${i}" data-value="done" class="${status==="done"?"active":""}">✓ Fiz</button>
        <button data-day="${i}" data-value="rest" class="${status==="rest"?"active":""}">☾ Descansei</button>
      </div>
    </article>`;
  }).join("");
  $$("#agendaGrid button").forEach(btn => btn.addEventListener("click", () => {
    const k = key(state.week, btn.dataset.day);
    state.agenda[k] = state.agenda[k] === btn.dataset.value ? "pending" : btn.dataset.value;
    saveState(); renderAgenda();
  }));
}

function effectiveSets(prescribed, exerciseName) {
  if (state.week <= 2 && !/panturrilha|prancha|dead bug|tibial/i.test(exerciseName)) return "2";
  return prescribed;
}

function renderWorkout() {
  const workout = PLAN.workouts.find(w => w.id === $("#workoutSelect").value) || PLAN.workouts[0];
  $("#workoutIntro").innerHTML = `<strong>${workout.day} — ${workout.title}.</strong> ${workout.intro}`;
  const sessionK = key(state.week, workout.id);
  $("#sessionNotes").value = state.sessions[sessionK]?.notes || "";

  $("#exerciseList").innerHTML = workout.exercises.map((e, i) => {
    const [name, sets, reps, rpe, rest] = e;
    const k = key(state.week, workout.id, i);
    const log = state.exercises[k] || {};
    return `<article class="exercise-card ${log.done ? "done" : ""}" data-exercise-key="${k}">
      <div class="exercise-title">
        <h3>${i+1}. ${name}</h3>
        <p>${effectiveSets(sets,name)} séries • ${reps} • RPE ${rpe} • descanso ${rest} s</p>
      </div>
      <label class="field"><span>Carga (kg)</span><input data-prop="load" type="number" step="0.5" value="${escapeHTML(log.load||"")}"></label>
      <label class="field"><span>Reps feitas</span><input data-prop="reps" type="text" value="${escapeHTML(log.reps||"")}" placeholder="${reps}"></label>
      <label class="field"><span>RPE real</span><input data-prop="rpe" type="number" min="1" max="10" step="0.5" value="${escapeHTML(log.rpe||"")}"></label>
      <button class="timer-btn" data-name="${escapeHTML(name)}" data-seconds="${parseInt(rest.split("–").pop())}">⏱ ${rest}s</button>
      <label class="check-wrap"><input data-prop="done" type="checkbox" ${log.done?"checked":""}> Feito</label>
    </article>`;
  }).join("");

  $$(".exercise-card input").forEach(input => {
    input.addEventListener("change", () => {
      const card = input.closest(".exercise-card");
      const k = card.dataset.exerciseKey;
      state.exercises[k] ||= {};
      state.exercises[k][input.dataset.prop] = input.type === "checkbox" ? input.checked : input.value;
      state.exercises[k].date = todayISO();
      saveState();
      card.classList.toggle("done", !!state.exercises[k].done);
      renderProgressCharts();
    });
  });
  $$(".timer-btn").forEach(btn => btn.addEventListener("click", () => startTimer(btn.dataset.name, Number(btn.dataset.seconds))));
}

function saveSessionNotes() {
  const id = $("#workoutSelect").value;
  const k = key(state.week, id);
  state.sessions[k] ||= {};
  state.sessions[k].notes = $("#sessionNotes").value;
  saveState();
}
function setWorkoutStatus(status) {
  const id = $("#workoutSelect").value;
  const k = key(state.week, id);
  state.sessions[k] = { ...(state.sessions[k]||{}), status, date: todayISO(), notes: $("#sessionNotes").value };
  const agendaIndex = PLAN.agenda.findIndex(x => x[2] === id);
  if (agendaIndex >= 0) state.agenda[key(state.week, agendaIndex)] = status === "done" ? "done" : "pending";
  saveState(); renderAgenda();
  alert(status === "done" ? "Treino concluído e salvo." : "Sessão marcada como não realizada.");
}

function renderRuns() {
  const week = PLAN.weeks[state.week];
  const configs = [
    { type:"A", title:"Corrida A — terça-feira", plan:week.runA, agendaIndex:1 },
    { type:"B", title:"Corrida B — sábado", plan:week.runB, agendaIndex:5 }
  ];
  $("#runCards").innerHTML = configs.map(c => {
    const prefix = key(state.week,c.type);
    return `<article class="card run-card">
      <p class="eyebrow">RPE 4–5</p>
      <h3>${c.title}</h3>
      <div class="run-plan"><strong>${c.plan[0]}</strong><br>${c.plan[1]}<br><small>+ 5 min de caminhada antes e depois</small></div>
      <div class="form-grid">
        <label class="field"><span>Distância (km)</span><input data-run="${c.type}" data-prop="distance" type="number" step="0.01" value="${escapeHTML(state.runs[key(prefix,"distance")]||"")}"></label>
        <label class="field"><span>Tempo real (min)</span><input data-run="${c.type}" data-prop="minutes" type="number" step="0.1" value="${escapeHTML(state.runs[key(prefix,"minutes")]||"")}"></label>
        <label class="field"><span>RPE real</span><input data-run="${c.type}" data-prop="rpe" type="number" min="1" max="10" step="0.5" value="${escapeHTML(state.runs[key(prefix,"rpe")]||"")}"></label>
        <label class="field"><span>Observações</span><input data-run="${c.type}" data-prop="notes" type="text" value="${escapeHTML(state.runs[key(prefix,"notes")]||"")}"></label>
      </div>
      <label class="check-wrap"><input class="run-done" data-run="${c.type}" type="checkbox" ${state.runs[key(prefix,"done")]?"checked":""}> Corrida concluída</label>
    </article>`;
  }).join("");
  $$("[data-run][data-prop]").forEach(input => input.addEventListener("change", () => {
    state.runs[key(state.week,input.dataset.run,input.dataset.prop)] = input.value;
    state.runs[key(state.week,input.dataset.run,"date")] = todayISO();
    saveState(); renderProgressCharts();
  }));
  $$(".run-done").forEach(input => input.addEventListener("change", () => {
    state.runs[key(state.week,input.dataset.run,"done")] = input.checked;
    state.runs[key(state.week,input.dataset.run,"date")] = todayISO();
    const agendaIndex = input.dataset.run === "A" ? 1 : 5;
    if (input.checked) state.agenda[key(state.week,agendaIndex)] = "done";
    saveState(); renderAgenda(); renderProgressCharts();
  }));
}
function calcPace() {
  const d = Number($("#paceDistance").value), m = Number($("#paceMinutes").value);
  if (!d || !m) return $("#paceResult").textContent = "—";
  const pace = m/d, mins = Math.floor(pace), secs = Math.round((pace-mins)*60);
  $("#paceResult").textContent = `${mins}:${String(secs).padStart(2,"0")} min/km`;
}

function saveRecovery(restDay) {
  const entry = {
    id: crypto.randomUUID(), date: $("#recoveryDate").value || todayISO(),
    sleep: Number($("#sleepScore").value), energy: Number($("#energyScore").value),
    soreness: Number($("#sorenessScore").value), jointPain: Number($("#jointPainScore").value),
    stress: Number($("#stressScore").value), notes: $("#recoveryNotes").value, restDay
  };
  state.recovery = state.recovery.filter(x => x.date !== entry.date);
  state.recovery.push(entry);
  state.recovery.sort((a,b) => b.date.localeCompare(a.date));
  saveState(); renderRecoveryHistory();
  $("#recoveryNotes").value = "";
}
function renderRecoveryHistory() {
  const rows = state.recovery.slice(0,12);
  $("#recoveryHistory").innerHTML = rows.length ? rows.map(x => `<article class="history-item">
    <div><strong>${formatDate(x.date)} ${x.restDay ? "• Descanso" : ""}</strong>
    <p>Sono ${x.sleep} • Energia ${x.energy} • Dor muscular ${x.soreness} • Articular ${x.jointPain} • Estresse ${x.stress}${x.notes ? ` — ${escapeHTML(x.notes)}` : ""}</p></div>
    <button class="ghost-btn delete-recovery" data-id="${x.id}">Excluir</button>
  </article>`).join("") : `<div class="note">Nenhum check-in salvo ainda.</div>`;
  $$(".delete-recovery").forEach(b => b.addEventListener("click", () => {
    state.recovery = state.recovery.filter(x => x.id !== b.dataset.id); saveState(); renderRecoveryHistory();
  }));
}
function formatDate(s) { return new Date(s+"T12:00:00").toLocaleDateString("pt-BR"); }

function saveMeasure() {
  const entry = { id: crypto.randomUUID(), date: $("#measureDate").value || todayISO(),
    waist: $("#waist").value, hips: $("#hips").value, thigh: $("#thigh").value };
  if (!entry.waist && !entry.hips && !entry.thigh) return alert("Informe pelo menos uma medida.");
  state.measures.push(entry); state.measures.sort((a,b)=>b.date.localeCompare(a.date));
  saveState(); renderMeasures();
  $("#waist").value = $("#hips").value = $("#thigh").value = "";
}
function renderMeasures() {
  if (!state.measures.length) return $("#measureTableWrap").innerHTML = `<div class="note">Registre cintura, quadril e coxa a cada 2–4 semanas, nas mesmas condições.</div>`;
  $("#measureTableWrap").innerHTML = `<table><thead><tr><th>Data</th><th>Cintura</th><th>Quadril</th><th>Coxa</th><th></th></tr></thead><tbody>${
    state.measures.map(x => `<tr><td>${formatDate(x.date)}</td><td>${x.waist||"—"} cm</td><td>${x.hips||"—"} cm</td><td>${x.thigh||"—"} cm</td><td><button class="ghost-btn delete-measure" data-id="${x.id}">Excluir</button></td></tr>`).join("")
  }</tbody></table>`;
  $$(".delete-measure").forEach(b => b.addEventListener("click", () => {
    state.measures = state.measures.filter(x=>x.id!==b.dataset.id); saveState(); renderMeasures();
  }));
}

function renderProgressCharts() {
  const exercise = $("#progressExercise").value;
  const points = [];
  PLAN.workouts.forEach(w => w.exercises.forEach((e,i) => {
    if (e[0] !== exercise) return;
    for (let week=1; week<=6; week++) {
      const log = state.exercises[key(week,w.id,i)];
      if (log?.load) points.push({label:`S${week}`, value:Number(log.load)});
    }
  }));
  $("#strengthChart").innerHTML = svgLine(points, "kg");
  const runPoints = [];
  for (let week=1; week<=6; week++) {
    ["A","B"].forEach(type => {
      const distance = Number(state.runs[key(week,type,"distance")]);
      if (distance) runPoints.push({label:`S${week}${type}`, value:distance});
    });
  }
  $("#runChart").innerHTML = svgLine(runPoints, "km");
}
function svgLine(points, unit) {
  if (!points.length) return `<div class="note">Registre dados para visualizar a evolução.</div>`;
  const w=620,h=230,p=34,max=Math.max(...points.map(x=>x.value),1),min=Math.min(...points.map(x=>x.value),0);
  const range=Math.max(max-min,1);
  const coords=points.map((pt,i)=>{
    const x=p+(i*(w-2*p)/Math.max(points.length-1,1));
    const y=h-p-((pt.value-min)/range)*(h-2*p);
    return {...pt,x,y};
  });
  const line=coords.map((c,i)=>`${i?"L":"M"} ${c.x} ${c.y}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="currentColor" opacity=".25"/>
    <path d="${line}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${coords.map(c=>`<circle cx="${c.x}" cy="${c.y}" r="5" fill="currentColor"/><text x="${c.x}" y="${c.y-12}" text-anchor="middle" fill="currentColor" font-size="12">${c.value}${unit}</text><text x="${c.x}" y="${h-10}" text-anchor="middle" fill="currentColor" opacity=".7" font-size="11">${c.label}</text>`).join("")}
  </svg>`;
}

let timerSeconds=0, timerId=null, timerRunning=false;
function startTimer(name, seconds) {
  timerSeconds=seconds; $("#timerExercise").textContent=name; updateTimerDisplay();
  $("#timerDialog").showModal(); timerRunning=true; $("#pauseTimer").textContent="Pausar";
  clearInterval(timerId); timerId=setInterval(tickTimer,1000);
}
function tickTimer() {
  if (!timerRunning) return;
  timerSeconds=Math.max(0,timerSeconds-1); updateTimerDisplay();
  if (timerSeconds===0) { clearInterval(timerId); timerRunning=false; $("#pauseTimer").textContent="Reiniciar"; navigator.vibrate?.([200,100,200]); }
}
function updateTimerDisplay() {
  $("#timerValue").textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,"0")}:${String(timerSeconds%60).padStart(2,"0")}`;
}
function adjustTimer(n) { timerSeconds=Math.max(0,timerSeconds+n); updateTimerDisplay(); }
function pauseTimer() {
  timerRunning=!timerRunning;
  $("#pauseTimer").textContent=timerRunning?"Pausar":"Continuar";
  if (timerRunning && !timerId) timerId=setInterval(tickTimer,1000);
}

function resetWeek() {
  if (!confirm(`Limpar todos os registros da semana ${state.week}?`)) return;
  const prefix=`${state.week}|`;
  ["agenda","exercises","sessions","runs"].forEach(group => {
    Object.keys(state[group]).filter(k=>k.startsWith(prefix)).forEach(k=>delete state[group][k]);
  });
  saveState(); renderAll();
}
function exportData() {
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`backup-treino-${todayISO()}.json`; a.click(); URL.revokeObjectURL(a.href);
}
function importData(e) {
  const file=e.target.files[0]; if (!file) return;
  const reader=new FileReader();
  reader.onload=()=>{ try { state={...structuredClone(defaultState),...JSON.parse(reader.result)}; saveState(); renderAll(); alert("Backup importado."); } catch { alert("Arquivo de backup inválido."); } };
  reader.readAsText(file); e.target.value="";
}
function eraseAll() {
  if (!confirm("Apagar definitivamente todo o histórico deste navegador?")) return;
  localStorage.removeItem(STORAGE_KEY); state=structuredClone(defaultState); renderAll();
}
function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
}
init();
