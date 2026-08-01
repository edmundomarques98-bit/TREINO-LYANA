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
const DB_NAME = "TreinoLyanaDB";
const DB_VERSION = 2;
const APP_STORE = "appState";
const SET_STORE = "setLogs";
const BODY_STORE = "bodyAssessments";
const PHOTO_STORE = "assessmentPhotos";

const defaultState = {
  week: 1, theme: "light", agenda: {}, exercises: {}, sessions: {},
  runs: {}, recovery: [], measures: [], bodyAssessments: []
};

let state = structuredClone(defaultState);
let databasePromise = null;
let saveQueue = Promise.resolve();

function normalizeState(value) {
  return {
    ...structuredClone(defaultState),
    ...(value || {}),
    agenda: { ...(value?.agenda || {}) },
    exercises: { ...(value?.exercises || {}) },
    sessions: { ...(value?.sessions || {}) },
    runs: { ...(value?.runs || {}) },
    recovery: Array.isArray(value?.recovery) ? value.recovery : [],
    measures: Array.isArray(value?.measures) ? value.measures : [],
    bodyAssessments: Array.isArray(value?.bodyAssessments) ? value.bodyAssessments : []
  };
}

function setDatabaseStatus(message, status = "ready") {
  const text = document.querySelector("#databaseStatus");
  const indicator = document.querySelector("#databaseIndicator");
  if (text) text.textContent = message;
  if (indicator) {
    indicator.textContent = status === "ready" ? "Ativo" : status === "error" ? "Modo reserva" : "Conectando";
    indicator.className = `database-indicator ${status}`;
  }
}

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Falha no banco de dados."));
  });
}

function transactionAsPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Falha na transação."));
    transaction.onabort = () => reject(transaction.error || new Error("Transação cancelada."));
  });
}

function openDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB não disponível neste navegador."));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(APP_STORE)) {
          database.createObjectStore(APP_STORE, { keyPath: "id" });
        }

        if (!database.objectStoreNames.contains(SET_STORE)) {
          const store = database.createObjectStore(SET_STORE, { keyPath: "id" });
          store.createIndex("exerciseName", "exerciseName", { unique: false });
          store.createIndex("week", "week", { unique: false });
          store.createIndex("date", "date", { unique: false });
          store.createIndex("exerciseWeek", ["exerciseName", "week"], { unique: false });
        }

        if (!database.objectStoreNames.contains(BODY_STORE)) {
          const store = database.createObjectStore(BODY_STORE, { keyPath: "id" });
          store.createIndex("date", "date", { unique: false });
        }

        if (!database.objectStoreNames.contains(PHOTO_STORE)) {
          const store = database.createObjectStore(PHOTO_STORE, { keyPath: "id" });
          store.createIndex("assessmentId", "assessmentId", { unique: false });
          store.createIndex("position", "position", { unique: false });
        }
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };

      request.onerror = () => reject(request.error || new Error("Não foi possível abrir o banco."));
      request.onblocked = () => reject(new Error("Atualização do banco bloqueada por outra aba."));
    });
  }

  return databasePromise;
}

function buildSetRecords(snapshot) {
  const records = [];

  PLAN.workouts.forEach(workout => {
    workout.exercises.forEach((exercise, exerciseIndex) => {
      const [exerciseName] = exercise;

      for (let week = 1; week <= 6; week++) {
        const exerciseKey = key(week, workout.id, exerciseIndex);
        const log = snapshot.exercises?.[exerciseKey];
        if (!log) continue;

        const sets = Array.isArray(log.sets)
          ? log.sets
          : [{
              load: log.load || "",
              reps: log.reps || "",
              rpe: log.rpe || "",
              done: Boolean(log.done),
              completedAt: log.date || ""
            }];

        sets.forEach((set, setIndex) => {
          if (!set.load && !set.reps && !set.rpe && !set.done) return;

          records.push({
            id: `${exerciseKey}|${setIndex}`,
            week,
            workoutId: workout.id,
            exerciseIndex,
            exerciseName,
            setIndex,
            load: Number(set.load) || 0,
            reps: String(set.reps || ""),
            rpe: Number(set.rpe) || 0,
            done: Boolean(set.done),
            date: log.date || String(set.completedAt || "").slice(0, 10) || "",
            completedAt: set.completedAt || ""
          });
        });
      }
    });
  });

  return records;
}

async function persistStateToDatabase(snapshot) {
  const database = await openDatabase();
  const transaction = database.transaction([APP_STORE, SET_STORE, BODY_STORE], "readwrite");
  const appStore = transaction.objectStore(APP_STORE);
  const setStore = transaction.objectStore(SET_STORE);
  const bodyStore = transaction.objectStore(BODY_STORE);

  appStore.put({
    id: "main",
    value: snapshot,
    updatedAt: new Date().toISOString()
  });

  setStore.clear();
  buildSetRecords(snapshot).forEach(record => setStore.put(record));

  bodyStore.clear();
  (snapshot.bodyAssessments || []).forEach(record => bodyStore.put(record));

  await transactionAsPromise(transaction);
  setDatabaseStatus(`Salvo automaticamente em ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`, "ready");
}

async function loadState() {
  let localBackup = null;

  try {
    localBackup = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    localBackup = null;
  }

  try {
    setDatabaseStatus("Abrindo o banco de dados local...", "loading");
    const database = await openDatabase();
    const transaction = database.transaction(APP_STORE, "readonly");
    const record = await requestAsPromise(transaction.objectStore(APP_STORE).get("main"));

    if (record?.value) {
      setDatabaseStatus("Banco de dados carregado. O preenchimento é salvo automaticamente.", "ready");
      return normalizeState(record.value);
    }

    const migrated = normalizeState(localBackup || defaultState);
    await persistStateToDatabase(structuredClone(migrated));
    setDatabaseStatus(
      localBackup
        ? "Dados anteriores migrados para o banco IndexedDB."
        : "Banco de dados criado e pronto para uso.",
      "ready"
    );
    return migrated;
  } catch (error) {
    console.error(error);
    setDatabaseStatus("IndexedDB indisponível. Salvando em modo de reserva no navegador.", "error");
    return normalizeState(localBackup || defaultState);
  }
}

function saveState() {
  const snapshot = structuredClone(state);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Não foi possível atualizar a cópia de reserva.", error);
  }

  saveQueue = saveQueue
    .then(() => persistStateToDatabase(snapshot))
    .catch(error => {
      console.error(error);
      setDatabaseStatus("Falha no IndexedDB. A cópia de reserva local continua ativa.", "error");
    });

  renderStats();
}

async function clearDatabase() {
  try {
    const database = await openDatabase();
    const transaction = database.transaction([APP_STORE, SET_STORE, BODY_STORE, PHOTO_STORE], "readwrite");
    transaction.objectStore(APP_STORE).clear();
    transaction.objectStore(SET_STORE).clear();
    transaction.objectStore(BODY_STORE).clear();
    transaction.objectStore(PHOTO_STORE).clear();
    await transactionAsPromise(transaction);
  } catch (error) {
    console.warn("Não foi possível limpar o IndexedDB.", error);
  }
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
  $("#assessmentDate").value = todayISO();

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
  renderBodyAssessments();
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
    if (btn.dataset.tab === "avaliacao") renderBodyAssessments();
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

  $("#toggleGuideBtn").addEventListener("click", toggleMeasurementGuide);
  $("#saveAssessmentBtn").addEventListener("click", saveBodyAssessment);
  $("#clearAssessmentBtn").addEventListener("click", clearBodyAssessmentForm);
  bindPhotoPreview("photoFront", "previewFront");
  bindPhotoPreview("photoSide", "previewSide");
  bindPhotoPreview("photoBack", "previewBack");

  $("#exportBtn").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", importData);
  $("#eraseBtn").addEventListener("click", eraseAll);

  $("#minusTimer").addEventListener("click", () => adjustTimer(-15));
  $("#plusTimer").addEventListener("click", () => adjustTimer(15));
  $("#resetTimer").addEventListener("click", resetTimer);
  $("#pauseTimer").addEventListener("click", pauseTimer);

  $("#closeDemoDialog").addEventListener("click", closeDemoDialog);
  $("#demoDialog").addEventListener("click", event => {
    if (event.target === $("#demoDialog")) closeDemoDialog();
  });
}

function renderStats() {
  const weekPrefix = `${state.week}|`;
  const doneDays = Object.entries(state.agenda).filter(([k,v]) => k.startsWith(weekPrefix) && v === "done").length;
  const restDays = Object.entries(state.agenda).filter(([k,v]) => k.startsWith(weekPrefix) && v === "rest").length;

  let totalPlannedSets = 0;
  let completedSets = 0;

  PLAN.workouts.forEach(workout => {
    workout.exercises.forEach((exercise, exerciseIndex) => {
      const [name, prescribedSets] = exercise;
      const count = Number(effectiveSets(prescribedSets, name));
      totalPlannedSets += count;

      const log = state.exercises[key(state.week, workout.id, exerciseIndex)];
      if (Array.isArray(log?.sets)) {
        completedSets += log.sets.filter(set => set.done).length;
      } else if (log?.done) {
        completedSets += count;
      }
    });
  });

  const runDone = ["A","B"].filter(type => state.runs[key(state.week,type,"done")]).length;
  $("#stats").innerHTML = [
    [doneDays, "dias concluídos"],
    [`${completedSets}/${totalPlannedSets}`, "séries concluídas"],
    [`${runDone}/2`, "corridas concluídas"],
    [restDays, "dias de descanso"]
  ].map(([value,label]) => `<article class="stat"><strong>${value}</strong><span>${label}</span></article>`).join("");
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

function getExerciseLog(storageKey, setCount) {
  let log = state.exercises[storageKey] || {};

  if (!Array.isArray(log.sets)) {
    const old = log;
    log = {
      sets: Array.from({ length: setCount }, (_, index) => ({
        load: index === 0 ? (old.load || "") : "",
        reps: index === 0 ? (old.reps || "") : "",
        rpe: index === 0 ? (old.rpe || "") : "",
        done: index === 0 ? Boolean(old.done) : false
      })),
      date: old.date || ""
    };
  }

  while (log.sets.length < setCount) {
    log.sets.push({ load: "", reps: "", rpe: "", done: false });
  }
  if (log.sets.length > setCount) log.sets = log.sets.slice(0, setCount);

  log.done = log.sets.length > 0 && log.sets.every(set => set.done);
  state.exercises[storageKey] = log;
  return log;
}

function getRestSeconds(restText) {
  const values = String(restText).match(/\d+/g)?.map(Number) || [60];
  return values[values.length - 1];
}

function renderWorkout() {
  const workout = PLAN.workouts.find(w => w.id === $("#workoutSelect").value) || PLAN.workouts[0];
  $("#workoutIntro").innerHTML = `<strong>${workout.day} — ${workout.title}.</strong> ${workout.intro} Marque cada série individualmente; o descanso começa automaticamente após cada série, exceto a última.`;

  const sessionK = key(state.week, workout.id);
  $("#sessionNotes").value = state.sessions[sessionK]?.notes || "";

  $("#exerciseList").innerHTML = workout.exercises.map((exercise, exerciseIndex) => {
    const [name, prescribedSets, reps, rpe, rest] = exercise;
    const setCount = Number(effectiveSets(prescribedSets, name));
    const exerciseKey = key(state.week, workout.id, exerciseIndex);
    const log = getExerciseLog(exerciseKey, setCount);
    const completed = log.sets.filter(set => set.done).length;
    const restSeconds = getRestSeconds(rest);
    const demoHTML = renderExerciseDemoHTML(name);

    const setRows = log.sets.map((set, setIndex) => `
      <div class="set-row ${set.done ? "set-complete" : ""}" data-set-index="${setIndex}">
        <span class="set-number">Série ${setIndex + 1}</span>
        <input data-prop="load" data-set-index="${setIndex}" type="number" min="0" step="0.5"
          inputmode="decimal" value="${escapeHTML(set.load || "")}" placeholder="Carga">
        <input data-prop="reps" data-set-index="${setIndex}" type="text"
          value="${escapeHTML(set.reps || "")}" placeholder="${escapeHTML(reps)}">
        <input data-prop="rpe" data-set-index="${setIndex}" type="number" min="1" max="10" step="0.5"
          value="${escapeHTML(set.rpe || "")}" placeholder="${escapeHTML(rpe)}">
        <label class="set-check">
          <input data-prop="done" data-set-index="${setIndex}" type="checkbox" ${set.done ? "checked" : ""}>
          Concluída
        </label>
        <button type="button" class="set-timer-btn"
          data-name="${escapeHTML(name)}"
          data-seconds="${restSeconds}"
          data-completed-set="${setIndex + 1}"
          data-total-sets="${setCount}">⏱ ${rest}s</button>
      </div>
    `).join("");

    return `<article class="exercise-card ${log.done ? "done" : ""}" data-exercise-key="${exerciseKey}">
      <div class="exercise-card-head">
        <div class="exercise-title">
          <h3>${exerciseIndex + 1}. ${name}</h3>
          <p>${setCount} séries • ${reps} • RPE previsto ${rpe} • descanso ${rest} s</p>
        </div>
        <span class="series-counter">${completed}/${setCount} séries</span>
      </div>
      ${demoHTML}
      <div class="set-list">
        <div class="set-row set-header" aria-hidden="true">
          <span>Série</span><span>Carga</span><span>Repetições</span><span>RPE real</span><span>Status</span><span>Descanso</span>
        </div>
        ${setRows}
      </div>
    </article>`;
  }).join("");

  $$(".exercise-card input[data-prop]").forEach(input => {
    input.addEventListener("change", () => {
      const card = input.closest(".exercise-card");
      const exerciseKey = card.dataset.exerciseKey;
      const exerciseIndex = [...$("#exerciseList").children].indexOf(card);
      const exercise = workout.exercises[exerciseIndex];
      const [exerciseName, prescribedSets, , , rest] = exercise;
      const setCount = Number(effectiveSets(prescribedSets, exerciseName));
      const setIndex = Number(input.dataset.setIndex);
      const log = getExerciseLog(exerciseKey, setCount);
      const set = log.sets[setIndex];

      set[input.dataset.prop] = input.type === "checkbox" ? input.checked : input.value;
      if (input.type === "checkbox") {
        set.completedAt = input.checked ? new Date().toISOString() : "";
      }

      log.date = todayISO();
      log.done = log.sets.every(item => item.done);
      state.exercises[exerciseKey] = log;
      saveState();

      input.closest(".set-row").classList.toggle("set-complete", Boolean(set.done));
      card.classList.toggle("done", log.done);
      card.querySelector(".series-counter").textContent =
        `${log.sets.filter(item => item.done).length}/${setCount} séries`;

      if (input.dataset.prop === "done" && input.checked && setIndex < setCount - 1) {
        startTimer(exerciseName, getRestSeconds(rest), setIndex + 1, setCount);
      }

      renderStats();
      renderProgressCharts();
    });
  });

  $$(".set-timer-btn").forEach(button => button.addEventListener("click", () => {
    startTimer(
      button.dataset.name,
      Number(button.dataset.seconds),
      Number(button.dataset.completedSet),
      Number(button.dataset.totalSets)
    );
  }));

  $$(".fullscreen-demo-btn").forEach(button => {
    button.addEventListener("click", () => openDemoDialog(button.dataset.exercise));
  });
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
      ${renderExerciseDemoHTML("Corrida leve")}
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

  $$("#runCards .fullscreen-demo-btn").forEach(button => {
    button.addEventListener("click", () => openDemoDialog(button.dataset.exercise));
  });
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


const BODY_MEASUREMENT_FIELDS = [
  ["weight", "Peso", "kg"],
  ["chest", "Tórax/busto", "cm"],
  ["waist", "Cintura", "cm"],
  ["abdomen", "Abdômen", "cm"],
  ["hips", "Quadril", "cm"],
  ["armRight", "Braço direito", "cm"],
  ["armLeft", "Braço esquerdo", "cm"],
  ["thighRight", "Coxa direita", "cm"],
  ["thighLeft", "Coxa esquerda", "cm"],
  ["calfRight", "Panturrilha direita", "cm"],
  ["calfLeft", "Panturrilha esquerda", "cm"]
];

const BODY_INPUTS = {
  weight: "assessmentWeight",
  height: "assessmentHeight",
  chest: "assessmentChest",
  waist: "assessmentWaist",
  abdomen: "assessmentAbdomen",
  hips: "assessmentHips",
  armRight: "assessmentArmRight",
  armLeft: "assessmentArmLeft",
  thighRight: "assessmentThighRight",
  thighLeft: "assessmentThighLeft",
  calfRight: "assessmentCalfRight",
  calfLeft: "assessmentCalfLeft"
};

let activeAssessmentPhotoUrls = [];
let bodyRenderToken = 0;

const EXERCISE_DEMOS = {
  "Agachamento no Smith para banco": {
    gif: "media/squat.gif",
    title: "Agachar e subir com controle",
    cues: ["Sente no banco de forma controlada.", "Joelhos acompanham a ponta dos pés.", "Suba empurrando o chão com o meio do pé."]
  },
  "Leg press 45°": {
    gif: "media/leg_press.gif",
    title: "Empurre a plataforma sem perder a lombar",
    cues: ["Desça até o limite sem tirar o quadril do banco.", "Empurre pela planta do pé.", "Evite estender totalmente o joelho com tranco."]
  },
  "Cadeira extensora": {
    gif: "media/leg_extension.gif",
    title: "Estenda os joelhos de forma suave",
    cues: ["Suba até quase estender totalmente.", "Controle a volta sem deixar cair.", "Mantenha o quadríceps contraído no topo."]
  },
  "Afundo estático com apoio": {
    gif: "media/lunge.gif",
    title: "Desça na vertical com apoio",
    cues: ["Segure o apoio para mais estabilidade.", "Dobre os dois joelhos.", "Empurre o chão para voltar."]
  },
  "Panturrilha no leg press": {
    gif: "media/calf_raise.gif",
    title: "Suba e desça pela amplitude completa",
    cues: ["Desça o calcanhar com controle.", "Suba o máximo possível na ponta do pé.", "Sem impulso curto e rápido."]
  },
  "Prancha abdominal": {
    gif: "media/plank.gif",
    title: "Tronco firme e alinhado",
    cues: ["Contraia abdômen e glúteos.", "Evite deixar a lombar cair.", "Respire sem prender o ar."]
  },
  "Puxada frontal na polia": {
    gif: "media/pulldown.gif",
    title: "Puxe a barra até a parte alta do peito",
    cues: ["Comece com ombros longe das orelhas.", "Puxe com cotovelos para baixo.", "Suba controlando a volta."]
  },
  "Remada baixa sentada": {
    gif: "media/row.gif",
    title: "Traga o cabo ao tronco",
    cues: ["Peito aberto e ombros para trás.", "Puxe com cotovelos próximos ao corpo.", "Retorne sem perder a postura."]
  },
  "Supino na máquina": {
    gif: "media/chest_press.gif",
    title: "Empurre para frente mantendo controle",
    cues: ["Escápulas apoiadas no banco.", "Empurre até quase estender os cotovelos.", "Volte devagar até alongar o peitoral."]
  },
  "Elevação lateral": {
    gif: "media/lateral_raise.gif",
    title: "Eleve os braços até a linha dos ombros",
    cues: ["Cotovelos levemente flexionados.", "Suba sem encolher o ombro.", "Desça controlando o peso."]
  },
  "Tríceps na polia": {
    gif: "media/triceps_pushdown.gif",
    title: "Empurre para baixo usando o tríceps",
    cues: ["Cotovelos fixos ao lado do corpo.", "Estenda totalmente no final.", "Suba sem abrir demais os cotovelos."]
  },
  "Rosca na polia ou máquina": {
    gif: "media/curl.gif",
    title: "Flexione os cotovelos sem balançar",
    cues: ["Mantenha o tronco parado.", "Suba contraindo bíceps.", "Desça devagar."]
  },
  "Terra romeno com halteres": {
    gif: "media/hinge.gif",
    title: "Leve o quadril para trás",
    cues: ["Joelhos levemente flexionados.", "Halteres próximos às pernas.", "Suba apertando glúteos."]
  },
  "Mesa flexora": {
    gif: "media/leg_curl.gif",
    title: "Flexione os joelhos com controle",
    cues: ["Puxe os calcanhares em direção aos glúteos.", "Segure um instante no topo.", "Volte devagar."]
  },
  "Elevação pélvica na máquina ou Smith": {
    gif: "media/hip_thrust.gif",
    title: "Suba o quadril e contraia glúteos",
    cues: ["Queixo levemente recolhido.", "Suba até o tronco alinhar com as coxas.", "Desça controlando a lombar."]
  },
  "Leg press com pés mais altos": {
    gif: "media/leg_press.gif",
    title: "Pés mais altos para ênfase posterior",
    cues: ["Mantenha os pés mais altos na plataforma.", "Desça sem tirar o quadril do assento.", "Empurre sem travar joelhos."]
  },
  "Cadeira flexora unilateral": {
    gif: "media/leg_curl.gif",
    title: "Flexão unilateral com simetria",
    cues: ["Faça o movimento completo em cada perna.", "Evite compensar com o quadril.", "Mantenha o mesmo ritmo dos dois lados."]
  },
  "Abdução de quadril na máquina": {
    gif: "media/abduction.gif",
    title: "Abra as pernas com controle",
    cues: ["Abra até o limite confortável.", "Segure um instante fora.", "Volte sem deixar bater."]
  },
  "Dead bug": {
    gif: "media/dead_bug.gif",
    title: "Braço e perna alternados",
    cues: ["Lombar encostada no solo.", "Movimente devagar lados opostos.", "Expire ao estender."]
  },
  "Panturrilha em pé ou na máquina": {
    gif: "media/calf_raise.gif",
    title: "Suba nas pontas dos pés",
    cues: ["Amplitude completa.", "Sem quicar na parte baixa.", "Pause um instante no topo."]
  },
  "Elevação da ponta dos pés (tibial)": {
    gif: "media/calf_raise.gif",
    title: "Eleve a ponta dos pés",
    cues: ["Apoie os calcanhares.", "Puxe a ponta do pé para cima.", "Desça controlando para trabalhar tibial."]
  },
  "Step-down em degrau baixo": {
    gif: "media/lunge.gif",
    title: "Desça o pé ao chão com controle",
    cues: ["Controle a descida sem cair.", "Joelho da perna de apoio alinhado.", "Use um degrau baixo."]
  },
  "Prancha lateral": {
    gif: "media/plank.gif",
    title: "Corpo alinhado de lado",
    cues: ["Apoie antebraço abaixo do ombro.", "Suba o quadril e alinhe o corpo.", "Mantenha abdômen firme."]
  }
};

EXERCISE_DEMOS["Corrida leve"] = {
  gif: "media/run.gif",
  title: "Passada leve e contínua",
  cues: ["Mantenha ritmo em que ainda consegue falar frases curtas.", "Pouse o pé de forma confortável, sem forçar a passada.", "Relaxe ombros e braços e mantenha o tronco estável."]
};

function getExerciseDemo(name) {
  return EXERCISE_DEMOS[name] || null;
}

const CURATED_REAL_VIDEOS = {
  "Agachamento no Smith para banco": "https://www.youtube.com/watch?v=EiZnx6a0zyw",
  "Cadeira extensora": "https://www.youtube.com/watch?v=VqBJmp1ltsk",
  "Prancha abdominal": "https://www.youtube.com/watch?v=DoOtkRaL1BI",
  "Supino na máquina": "https://www.youtube.com/watch?v=qmSOsrheLEg",
  "Mesa flexora": "https://www.youtube.com/watch?v=sWSm1pWb3lw",
  "Abdução de quadril na máquina": "https://www.youtube.com/watch?v=7izVNrHBslM",
  "Dead bug": "https://www.nasm.org/resource-center/exercise-library/dead-bug",
  "Prancha lateral": "https://support.runna.com/pt-BR/articles/6363965-tutorial-do-exercicio-da-prancha-lateral",
  "Terra romeno com halteres": "https://www.hipertrofia.org/blog/2019/01/17/levantamento-terra-com-halteres/"
};

function youtubeSearchUrl(name) {
  const query = encodeURIComponent(`${name} execução correta exercício`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function getRealVideoUrl(name) {
  return CURATED_REAL_VIDEOS[name] || youtubeSearchUrl(name);
}

function isCuratedVideo(name) {
  return Boolean(CURATED_REAL_VIDEOS[name]);
}

function renderExerciseDemoHTML(name) {
  const demo = getExerciseDemo(name);
  if (!demo) return "";

  const cues = demo.cues.map(cue => `<li>${escapeHTML(cue)}</li>`).join("");
  const videoUrl = getRealVideoUrl(name);
  const videoLabel = isCuratedVideo(name) ? "Assistir vídeo real" : "Buscar vídeo real";

  return `<details class="exercise-demo">
    <summary>Ver demonstração</summary>
    <div class="exercise-demo-content">
      <img class="exercise-demo-gif" src="${demo.gif}" alt="GIF demonstrativo do exercício ${escapeHTML(name)}">
      <div class="exercise-demo-copy">
        <strong>${escapeHTML(demo.title)}</strong>
        <ul>${cues}</ul>
        <div class="exercise-demo-actions">
          <button type="button" class="secondary-btn fullscreen-demo-btn" data-exercise="${escapeHTML(name)}">Tela cheia</button>
          <a class="ghost-btn real-video-btn" href="${videoUrl}" target="_blank" rel="noopener noreferrer">${videoLabel}</a>
        </div>
        <p class="exercise-demo-note">O GIF é ilustrativo. O vídeo real abre em uma nova aba para conferência visual da execução.</p>
      </div>
    </div>
  </details>`;
}

function openDemoDialog(name) {
  const demo = getExerciseDemo(name);
  if (!demo) return;

  $("#demoDialogTitle").textContent = name;
  $("#demoDialogGif").src = demo.gif;
  $("#demoDialogGif").alt = `Demonstração em GIF do exercício ${name}`;
  $("#demoDialogCues").innerHTML = `
    <strong>${escapeHTML(demo.title)}</strong>
    <ul>${demo.cues.map(cue => `<li>${escapeHTML(cue)}</li>`).join("")}</ul>
    <p>O GIF é uma referência visual simplificada. Ajuste a execução ao equipamento disponível e interrompa diante de dor aguda.</p>
  `;
  $("#demoDialogVideo").href = getRealVideoUrl(name);
  $("#demoDialogVideo").textContent = isCuratedVideo(name) ? "Assistir vídeo real selecionado" : "Buscar vídeo real no YouTube";

  const dialog = $("#demoDialog");
  if (!dialog.open) dialog.showModal();
}

function closeDemoDialog() {
  const dialog = $("#demoDialog");
  if (dialog.open) dialog.close();
}


function toggleMeasurementGuide() {
  const details = $("#measurementGuideDetails");
  const button = $("#toggleGuideBtn");
  details.hidden = !details.hidden;
  button.textContent = details.hidden ? "Ver guia completo" : "Ocultar guia";
}

function bindPhotoPreview(inputId, previewId) {
  const input = $(`#${inputId}`);
  const preview = $(`#${previewId}`);

  input.addEventListener("change", () => {
    const previousUrl = preview.dataset.objectUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const file = input.files?.[0];
    if (!file) {
      preview.innerHTML = "<span>Nenhuma foto</span>";
      delete preview.dataset.objectUrl;
      return;
    }

    if (!file.type.startsWith("image/")) {
      input.value = "";
      preview.innerHTML = "<span>Arquivo inválido</span>";
      alert("Selecione um arquivo de imagem.");
      return;
    }

    const url = URL.createObjectURL(file);
    preview.dataset.objectUrl = url;
    preview.innerHTML = `<img src="${url}" alt="Prévia da foto selecionada">`;
  });
}

function clearPhotoPreview(inputId, previewId) {
  const input = $(`#${inputId}`);
  const preview = $(`#${previewId}`);
  const url = preview.dataset.objectUrl;
  if (url) URL.revokeObjectURL(url);
  input.value = "";
  preview.innerHTML = "<span>Nenhuma foto</span>";
  delete preview.dataset.objectUrl;
}

function clearBodyAssessmentForm() {
  Object.values(BODY_INPUTS).forEach(id => {
    $(`#${id}`).value = "";
  });
  $("#assessmentDate").value = todayISO();
  $("#assessmentNotes").value = "";
  clearPhotoPreview("photoFront", "previewFront");
  clearPhotoPreview("photoSide", "previewSide");
  clearPhotoPreview("photoBack", "previewBack");
}

function numericInput(id) {
  const value = Number($(`#${id}`).value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function imageElementFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressPhoto(file) {
  const maxSide = 1600;
  let source;
  let width;
  let height;
  let cleanup = () => {};

  if ("createImageBitmap" in window) {
    try {
      source = await createImageBitmap(file);
      width = source.width;
      height = source.height;
      cleanup = () => source.close?.();
    } catch {
      source = await imageElementFromFile(file);
      width = source.naturalWidth;
      height = source.naturalHeight;
    }
  } else {
    source = await imageElementFromFile(file);
    width = source.naturalWidth;
    height = source.naturalHeight;
  }

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(source, 0, 0, outputWidth, outputHeight);
  cleanup();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      value => value ? resolve(value) : reject(new Error("Não foi possível processar a foto.")),
      "image/jpeg",
      0.82
    );
  });

  return blob;
}

async function saveAssessmentPhotos(assessmentId, photoFiles) {
  const entries = Object.entries(photoFiles).filter(([, file]) => file);
  if (!entries.length) return [];

  const processed = [];
  for (const [position, file] of entries) {
    const blob = await compressPhoto(file);
    processed.push({
      id: `${assessmentId}|${position}`,
      assessmentId,
      position,
      blob,
      mimeType: blob.type,
      originalName: file.name,
      savedAt: new Date().toISOString()
    });
  }

  const database = await openDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readwrite");
  const store = transaction.objectStore(PHOTO_STORE);
  processed.forEach(record => store.put(record));
  await transactionAsPromise(transaction);
  return processed.map(record => record.position);
}

async function getAssessmentPhotos(assessmentId) {
  const database = await openDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readonly");
  const index = transaction.objectStore(PHOTO_STORE).index("assessmentId");
  return requestAsPromise(index.getAll(IDBKeyRange.only(assessmentId)));
}

async function getAllAssessmentPhotos() {
  const database = await openDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readonly");
  return requestAsPromise(transaction.objectStore(PHOTO_STORE).getAll());
}

async function deleteAssessmentPhotos(assessmentId) {
  const records = await getAssessmentPhotos(assessmentId);
  if (!records.length) return;

  const database = await openDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readwrite");
  const store = transaction.objectStore(PHOTO_STORE);
  records.forEach(record => store.delete(record.id));
  await transactionAsPromise(transaction);
}

async function saveBodyAssessment() {
  const button = $("#saveAssessmentBtn");
  const date = $("#assessmentDate").value || todayISO();
  const measurements = {};

  Object.entries(BODY_INPUTS).forEach(([key, inputId]) => {
    measurements[key] = numericInput(inputId);
  });

  const photoFiles = {
    front: $("#photoFront").files?.[0] || null,
    side: $("#photoSide").files?.[0] || null,
    back: $("#photoBack").files?.[0] || null
  };

  const hasMeasurement = Object.values(measurements).some(Boolean);
  const hasPhoto = Object.values(photoFiles).some(Boolean);

  if (!hasMeasurement && !hasPhoto) {
    alert("Preencha pelo menos uma medida ou selecione uma foto.");
    return;
  }

  button.disabled = true;
  button.textContent = "Salvando...";

  const assessment = {
    id: crypto.randomUUID(),
    date,
    createdAt: new Date().toISOString(),
    measurements,
    notes: $("#assessmentNotes").value.trim(),
    photoPositions: []
  };

  try {
    assessment.photoPositions = await saveAssessmentPhotos(assessment.id, photoFiles);
    state.bodyAssessments.push(assessment);
    state.bodyAssessments.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
    saveState();
    await saveQueue;
    clearBodyAssessmentForm();
    await renderBodyAssessments();
    alert("Avaliação completa salva no banco de dados deste aparelho.");
  } catch (error) {
    console.error(error);
    await deleteAssessmentPhotos(assessment.id).catch(() => {});
    alert("Não foi possível salvar a avaliação. Verifique o espaço disponível no navegador.");
  } finally {
    button.disabled = false;
    button.textContent = "Salvar avaliação completa";
  }
}

function bodyValue(record, key) {
  const value = Number(record?.measurements?.[key]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function bodyDelta(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return {
    absolute: current - previous,
    percent: ((current - previous) / previous) * 100
  };
}

function formatSigned(value, digits = 1) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${formatNumber(rounded, digits)}`;
}

function renderBodyComparison(records) {
  const container = $("#bodyComparison");
  const badge = $("#bodyComparisonBadge");

  if (records.length < 2) {
    badge.textContent = records.length === 1 ? "Falta 1 avaliação" : "Aguardando dados";
    badge.className = "assessment-badge neutral";
    container.innerHTML = `<div class="assessment-empty">${
      records.length === 1
        ? "A primeira avaliação foi salva. Registre outra nas mesmas condições para gerar a comparação."
        : "Salve pelo menos duas avaliações para comparar peso e circunferências."
    }</div>`;
    return;
  }

  const previous = records[records.length - 2];
  const current = records[records.length - 1];
  const comparable = BODY_MEASUREMENT_FIELDS
    .map(([key, label, unit]) => {
      const before = bodyValue(previous, key);
      const after = bodyValue(current, key);
      const delta = bodyDelta(after, before);
      return delta ? { key, label, unit, before, after, ...delta } : null;
    })
    .filter(Boolean);

  badge.textContent = `${comparable.length} medidas comparadas`;
  badge.className = "assessment-badge mixed";

  if (!comparable.length) {
    container.innerHTML = `<div class="assessment-empty">As duas avaliações não possuem medidas equivalentes para comparação.</div>`;
    return;
  }

  const cards = comparable.map(item => {
    const directionClass = item.absolute > 0 ? "delta-positive" : item.absolute < 0 ? "delta-negative" : "delta-neutral";
    return `<div class="assessment-metric">
      <span>${item.label}</span>
      <strong>${formatNumber(item.after)} ${item.unit}</strong>
      <small class="${directionClass}">
        ${formatSigned(item.absolute)} ${item.unit} (${formatSigned(item.percent)}%)
      </small>
      <small>Anterior: ${formatNumber(item.before)} ${item.unit}</small>
    </div>`;
  }).join("");

  const waist = bodyValue(current, "waist");
  const hips = bodyValue(current, "hips");
  const ratio = waist && hips ? waist / hips : null;

  container.innerHTML = `
    <div class="assessment-grid body-metrics-grid">${cards}</div>
    <div class="assessment-summary">
      <strong>${formatDate(previous.date)} → ${formatDate(current.date)}</strong>
      As setas mostram apenas a direção da mudança, não classificam automaticamente aumento ou redução como bom ou ruim.
      ${ratio ? ` Relação cintura/quadril atual: <strong>${formatNumber(ratio, 2)}</strong>.` : ""}
    </div>
  `;
}

function measurementSummaryHTML(assessment) {
  const items = [
    ["height", "Altura", "cm"],
    ...BODY_MEASUREMENT_FIELDS
  ].map(([key, label, unit]) => {
    const value = bodyValue(assessment, key);
    return value ? `<div><span>${label}</span><strong>${formatNumber(value)} ${unit}</strong></div>` : "";
  }).join("");

  return items || "<p>Nenhuma medida numérica registrada.</p>";
}

function releaseAssessmentPhotoUrls() {
  activeAssessmentPhotoUrls.forEach(url => URL.revokeObjectURL(url));
  activeAssessmentPhotoUrls = [];
}

async function renderBodyAssessments() {
  const token = ++bodyRenderToken;
  const records = [...(state.bodyAssessments || [])]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  renderBodyComparison(records);
  releaseAssessmentPhotoUrls();

  const history = $("#bodyAssessmentHistory");
  if (!records.length) {
    history.innerHTML = `<div class="note">Nenhuma avaliação física salva ainda.</div>`;
    return;
  }

  history.innerHTML = records.slice().reverse().map(assessment => `
    <article class="card body-history-card" data-assessment-id="${assessment.id}">
      <div class="body-history-head">
        <div>
          <p class="eyebrow">AVALIAÇÃO</p>
          <h3>${formatDate(assessment.date)}</h3>
          <p>${assessment.notes ? escapeHTML(assessment.notes) : "Sem observações."}</p>
        </div>
        <button type="button" class="danger-btn delete-body-assessment" data-id="${assessment.id}">Excluir</button>
      </div>

      <div class="body-measurement-summary">${measurementSummaryHTML(assessment)}</div>

      <div class="saved-photo-grid">
        ${["front", "side", "back"].map(position => `
          <div class="saved-photo" data-position="${position}">
            <span>${position === "front" ? "Frente" : position === "side" ? "Perfil" : "Costas"}</span>
            <div class="saved-photo-frame"><small>Sem foto</small></div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");

  $$(".delete-body-assessment").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Excluir esta avaliação e todas as fotos associadas?")) return;
      const id = button.dataset.id;
      await deleteAssessmentPhotos(id).catch(console.error);
      state.bodyAssessments = state.bodyAssessments.filter(item => item.id !== id);
      saveState();
      await renderBodyAssessments();
    });
  });

  for (const assessment of records) {
    if (token !== bodyRenderToken) return;

    let photos = [];
    try {
      photos = await getAssessmentPhotos(assessment.id);
    } catch (error) {
      console.error(error);
    }

    if (token !== bodyRenderToken) return;
    const card = history.querySelector(`[data-assessment-id="${assessment.id}"]`);
    if (!card) continue;

    photos.forEach(photo => {
      const frame = card.querySelector(`[data-position="${photo.position}"] .saved-photo-frame`);
      if (!frame || !photo.blob) return;

      const url = URL.createObjectURL(photo.blob);
      activeAssessmentPhotoUrls.push(url);
      frame.innerHTML = `<img src="${url}" alt="Foto de evolução: ${photo.position === "front" ? "frente" : photo.position === "side" ? "perfil" : "costas"}">`;
    });
  }
}

function parseRepCount(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value || 0);
}

function formatDelta(value) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${formatNumber(rounded, 1)}%`;
}

function deltaClass(value, positiveThreshold = 0.5, negativeThreshold = -0.5) {
  if (value >= positiveThreshold) return "delta-positive";
  if (value <= negativeThreshold) return "delta-negative";
  return "delta-neutral";
}

function getExerciseMetrics(exerciseName) {
  const metrics = [];

  PLAN.workouts.forEach(workout => {
    workout.exercises.forEach((exercise, exerciseIndex) => {
      if (exercise[0] !== exerciseName) return;

      for (let week = 1; week <= 6; week++) {
        const log = state.exercises[key(week, workout.id, exerciseIndex)];
        if (!log) continue;

        const sets = Array.isArray(log.sets)
          ? log.sets
          : [{
              load: log.load || "",
              reps: log.reps || "",
              rpe: log.rpe || "",
              done: Boolean(log.done)
            }];

        const validSets = sets
          .map(set => ({
            load: Number(set.load) || 0,
            reps: parseRepCount(set.reps),
            rpe: Number(set.rpe) || 0,
            done: Boolean(set.done)
          }))
          .filter(set => set.done && set.load > 0 && set.reps > 0);

        if (!validSets.length) continue;

        const totalReps = validSets.reduce((sum, set) => sum + set.reps, 0);
        const totalVolume = validSets.reduce((sum, set) => sum + (set.load * set.reps), 0);
        const rpeValues = validSets.map(set => set.rpe).filter(value => value > 0);

        metrics.push({
          week,
          label: `Semana ${week}`,
          shortLabel: `S${week}`,
          date: log.date || "",
          setCount: validSets.length,
          maxLoad: Math.max(...validSets.map(set => set.load)),
          averageLoad: validSets.reduce((sum, set) => sum + set.load, 0) / validSets.length,
          totalReps,
          averageReps: totalReps / validSets.length,
          totalVolume,
          averageRpe: rpeValues.length
            ? rpeValues.reduce((sum, value) => sum + value, 0) / rpeValues.length
            : 0
        });
      }
    });
  });

  return metrics.sort((a, b) => a.week - b.week);
}

function evaluateProgress(previous, current) {
  const loadDelta = percentChange(current.maxLoad, previous.maxLoad);
  const repsDelta = percentChange(current.totalReps, previous.totalReps);
  const averageRepsDelta = percentChange(current.averageReps, previous.averageReps);
  const volumeDelta = percentChange(current.totalVolume, previous.totalVolume);

  let type = "neutral";
  let title = "Desempenho estável";
  let message = "A variação ficou pequena. Mantenha a execução e busque melhorar uma repetição por série antes de aumentar a carga.";

  if (loadDelta >= 2 && averageRepsDelta >= -5) {
    type = "positive";
    title = "Progressão de carga positiva";
    message = "A carga aumentou sem uma queda relevante nas repetições médias. Isso indica evolução consistente.";
  } else if (Math.abs(loadDelta) < 2 && averageRepsDelta >= 5) {
    type = "positive";
    title = "Mais repetições com carga semelhante";
    message = "Ela realizou mais repetições por série mantendo praticamente a mesma carga.";
  } else if (volumeDelta >= 5) {
    type = "positive";
    title = "Volume de treino aumentou";
    message = "O trabalho total em quilogramas-repetições aumentou, mesmo sem grande mudança na carga máxima.";
  } else if (loadDelta >= 2 && averageRepsDelta < -5 && volumeDelta > -5) {
    type = "mixed";
    title = "Carga maior com menos repetições";
    message = "A carga subiu, mas as repetições médias caíram. O volume ficou próximo; mantenha a carga até recuperar as repetições.";
  } else if (volumeDelta <= -10 || (loadDelta <= -5 && averageRepsDelta <= -5)) {
    type = "negative";
    title = "Queda de desempenho observada";
    message = "Carga, repetições ou volume diminuíram de forma relevante. Repita a sessão sem aumentar a carga e confira sono, dores e recuperação.";
  } else if (averageRepsDelta >= 3 || loadDelta >= 1) {
    type = "mixed";
    title = "Pequena evolução";
    message = "Há melhora discreta. Consolide a técnica e mantenha a progressão gradual.";
  }

  if (current.averageRpe >= 8.5 && type === "positive") {
    message += " Como o RPE médio está alto, não aumente novamente a carga na próxima sessão.";
  } else if (current.averageRpe > 0 && current.averageRpe <= 7.5 && type === "positive") {
    message += " Com RPE controlado, é possível tentar uma pequena progressão na próxima sessão.";
  }

  return { type, title, message, loadDelta, repsDelta, averageRepsDelta, volumeDelta };
}

function renderProgressAssessment(exerciseName, metrics) {
  const container = $("#progressAssessment");
  const badge = $("#assessmentBadge");
  if (!container || !badge) return;

  if (metrics.length < 2) {
    badge.textContent = metrics.length === 1 ? "Falta 1 sessão" : "Aguardando dados";
    badge.className = "assessment-badge neutral";
    container.innerHTML = `<div class="assessment-empty">
      ${metrics.length === 1
        ? `Já existe uma sessão completa de <strong>${escapeHTML(exerciseName)}</strong>. Registre outra sessão para comparar carga e repetições.`
        : `Marque as séries como concluídas e preencha carga e repetições em pelo menos duas semanas de <strong>${escapeHTML(exerciseName)}</strong>.`}
    </div>`;
    return;
  }

  const previous = metrics[metrics.length - 2];
  const current = metrics[metrics.length - 1];
  const evaluation = evaluateProgress(previous, current);

  badge.textContent = evaluation.title;
  badge.className = `assessment-badge ${evaluation.type}`;

  const historyRows = metrics.slice().reverse().map(item => `
    <tr>
      <td>${item.label}</td>
      <td>${formatNumber(item.maxLoad)} kg</td>
      <td>${formatNumber(item.totalReps, 0)}</td>
      <td>${formatNumber(item.averageReps, 1)}</td>
      <td>${formatNumber(item.totalVolume, 0)} kg·rep</td>
      <td>${item.averageRpe ? formatNumber(item.averageRpe, 1) : "—"}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="assessment-grid">
      <div class="assessment-metric">
        <span>Carga máxima</span>
        <strong>${formatNumber(current.maxLoad)} kg</strong>
        <small class="${deltaClass(evaluation.loadDelta)}">${formatDelta(evaluation.loadDelta)} vs. ${previous.label.toLowerCase()}</small>
      </div>
      <div class="assessment-metric">
        <span>Repetições totais</span>
        <strong>${formatNumber(current.totalReps, 0)}</strong>
        <small class="${deltaClass(evaluation.repsDelta)}">${formatDelta(evaluation.repsDelta)} vs. ${previous.label.toLowerCase()}</small>
      </div>
      <div class="assessment-metric">
        <span>Média por série</span>
        <strong>${formatNumber(current.averageReps, 1)} reps</strong>
        <small class="${deltaClass(evaluation.averageRepsDelta)}">${formatDelta(evaluation.averageRepsDelta)} vs. ${previous.label.toLowerCase()}</small>
      </div>
      <div class="assessment-metric">
        <span>Volume total</span>
        <strong>${formatNumber(current.totalVolume, 0)} kg·rep</strong>
        <small class="${deltaClass(evaluation.volumeDelta)}">${formatDelta(evaluation.volumeDelta)} vs. ${previous.label.toLowerCase()}</small>
      </div>
    </div>
    <div class="assessment-summary">
      <strong>${evaluation.title}</strong>
      ${evaluation.message}
    </div>
    <div class="assessment-history">
      <h4>Histórico do exercício</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Semana</th><th>Carga máx.</th><th>Reps totais</th><th>Reps/série</th><th>Volume</th><th>RPE médio</th></tr>
          </thead>
          <tbody>${historyRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderProgressCharts() {
  const exercise = $("#progressExercise").value;
  const metrics = getExerciseMetrics(exercise);

  renderProgressAssessment(exercise, metrics);

  const points = metrics.map(item => ({
    label: item.shortLabel,
    value: item.maxLoad
  }));
  $("#strengthChart").innerHTML = svgLine(points, "kg");

  const runPoints = [];
  for (let week = 1; week <= 6; week++) {
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

let timerSeconds = 0;
let timerInitialSeconds = 0;
let timerId = null;
let timerRunning = false;
let timerContext = { completedSet: null, totalSets: null };

function startTimer(name, seconds, completedSet = null, totalSets = null) {
  timerSeconds = Math.max(0, Number(seconds) || 60);
  timerInitialSeconds = timerSeconds;
  timerContext = { completedSet, totalSets };

  $("#timerExercise").textContent = name;
  $("#timerSetProgress").textContent = completedSet && totalSets
    ? (completedSet < totalSets
        ? `Série ${completedSet} de ${totalSets} concluída • próxima: série ${completedSet + 1}`
        : `Série ${completedSet} de ${totalSets} concluída • exercício finalizado`)
    : "Descanso manual";
  $("#timerDialog").classList.remove("timer-finished");

  updateTimerDisplay();
  if (!$("#timerDialog").open) $("#timerDialog").showModal();

  timerRunning = true;
  $("#pauseTimer").textContent = "Pausar";
  clearInterval(timerId);
  timerId = setInterval(tickTimer, 1000);
}

function tickTimer() {
  if (!timerRunning) return;
  timerSeconds = Math.max(0, timerSeconds - 1);
  updateTimerDisplay();

  if (timerSeconds === 0) {
    clearInterval(timerId);
    timerId = null;
    timerRunning = false;
    $("#pauseTimer").textContent = "Reiniciar";
    $("#timerDialog").classList.add("timer-finished");
    $("#timerSetProgress").textContent = timerContext.completedSet && timerContext.totalSets
      ? (timerContext.completedSet < timerContext.totalSets
          ? `Descanso concluído • pronta para a série ${timerContext.completedSet + 1}`
          : "Descanso concluído • exercício finalizado")
      : "Descanso concluído";
    document.title = "Meu Treino — 6 semanas";
    notifyTimerFinished();
  }
}

function updateTimerDisplay() {
  $("#timerValue").textContent =
    `${String(Math.floor(timerSeconds / 60)).padStart(2,"0")}:${String(timerSeconds % 60).padStart(2,"0")}`;

  const percent = timerInitialSeconds > 0 ? (timerSeconds / timerInitialSeconds) * 100 : 0;
  $("#timerProgressBar").style.width = `${Math.max(0, Math.min(100, percent))}%`;
  document.title = timerRunning
    ? `${$("#timerValue").textContent} — descanso`
    : "Meu Treino — 6 semanas";
}

function adjustTimer(amount) {
  timerSeconds = Math.max(0, timerSeconds + amount);
  timerInitialSeconds = Math.max(timerInitialSeconds, timerSeconds);
  $("#timerDialog").classList.remove("timer-finished");
  updateTimerDisplay();
}

function pauseTimer() {
  if (timerSeconds === 0) {
    resetTimer();
    timerRunning = true;
    $("#pauseTimer").textContent = "Pausar";
    clearInterval(timerId);
    timerId = setInterval(tickTimer, 1000);
    return;
  }

  timerRunning = !timerRunning;
  $("#pauseTimer").textContent = timerRunning ? "Pausar" : "Continuar";
  if (timerRunning && !timerId) timerId = setInterval(tickTimer, 1000);
}

function resetTimer() {
  timerSeconds = timerInitialSeconds || 60;
  timerRunning = false;
  clearInterval(timerId);
  timerId = null;
  $("#pauseTimer").textContent = "Continuar";
  $("#timerDialog").classList.remove("timer-finished");
  updateTimerDisplay();
}

function notifyTimerFinished() {
  navigator.vibrate?.([250, 120, 250]);

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.45);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.45);
  } catch (_) {
    // O alerta visual e a vibração continuam funcionando.
  }
}

function resetWeek() {
  if (!confirm(`Limpar todos os registros da semana ${state.week}?`)) return;
  const prefix=`${state.week}|`;
  ["agenda","exercises","sessions","runs"].forEach(group => {
    Object.keys(state[group]).filter(k=>k.startsWith(prefix)).forEach(k=>delete state[group][k]);
  });
  saveState(); renderAll();
}
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Falha ao ler a foto."));
    reader.readAsDataURL(blob);
  });
}

function dataURLToBlob(dataURL) {
  const [header, base64] = String(dataURL).split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

async function exportData() {
  const button = $("#exportBtn");
  button.disabled = true;
  button.textContent = "Preparando backup...";

  try {
    const photoRecords = await getAllAssessmentPhotos().catch(() => []);
    const photos = [];

    for (const record of photoRecords) {
      photos.push({
        id: record.id,
        assessmentId: record.assessmentId,
        position: record.position,
        originalName: record.originalName || "",
        savedAt: record.savedAt || "",
        dataURL: await blobToDataURL(record.blob)
      });
    }

    const payload = {
      format: "TREINO-LYANA-BACKUP",
      version: 3,
      exportedAt: new Date().toISOString(),
      state,
      photos
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-treino-lyana-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error(error);
    alert("Não foi possível criar o backup completo.");
  } finally {
    button.disabled = false;
    button.textContent = "Exportar backup";
  }
}

async function restoreImportedPhotos(photos) {
  if (!Array.isArray(photos) || !photos.length) return;

  const database = await openDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readwrite");
  const store = transaction.objectStore(PHOTO_STORE);

  photos.forEach(photo => {
    if (!photo?.id || !photo?.dataURL) return;
    const blob = dataURLToBlob(photo.dataURL);
    store.put({
      id: photo.id,
      assessmentId: photo.assessmentId,
      position: photo.position,
      originalName: photo.originalName || "",
      savedAt: photo.savedAt || new Date().toISOString(),
      mimeType: blob.type,
      blob
    });
  });

  await transactionAsPromise(transaction);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed?.format === "TREINO-LYANA-BACKUP" ? parsed.state : parsed;
      const importedPhotos = parsed?.format === "TREINO-LYANA-BACKUP" ? parsed.photos : [];

      await clearDatabase();
      state = normalizeState(importedState);
      await restoreImportedPhotos(importedPhotos);
      saveState();
      await saveQueue;
      renderAll();
      alert("Backup importado, incluindo as fotos disponíveis.");
    } catch (error) {
      console.error(error);
      alert("Arquivo de backup inválido ou incompleto.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function eraseAll() {
  if (!confirm("Apagar definitivamente todo o histórico deste navegador?")) return;

  localStorage.removeItem(STORAGE_KEY);
  await clearDatabase();
  state = structuredClone(defaultState);
  await persistStateToDatabase(structuredClone(state)).catch(() => {});
  renderAll();
  setDatabaseStatus("Banco de dados reiniciado. Todos os registros foram apagados.", "ready");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

async function bootstrap() {
  state = await loadState();
  init();
}

bootstrap();
