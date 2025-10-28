const algorithms = {
  linear: {
    name: 'Lineare Suche',
    description:
      'Durchläuft das Array Element für Element und vergleicht jeden Wert mit dem Suchziel. Ideal für kleine oder unsortierte Datensätze.',
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    tags: ['unsortiert', 'einfach', 'sequentiell'],
    highlight: 'Prüft jedes Element nacheinander, bis der Wert gefunden wird oder das Ende erreicht ist.',
    simulate(data, target) {
      const steps = [];
      for (let i = 0; i < data.length; i++) {
        steps.push({
          active: [i],
          message: `Vergleiche Index ${i} (Wert ${data[i]}) mit dem Ziel ${target}.`,
          found: data[i] === target,
        });
        if (data[i] === target) {
          return { steps, foundIndex: i };
        }
      }
      return { steps, foundIndex: -1 };
    },
  },
  binary: {
    name: 'Binäre Suche',
    description:
      'Teilt ein sortiertes Array wiederholt in zwei Hälften. Vergleicht den mittleren Wert, um die Suche einzugrenzen.',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    tags: ['sortiert', 'divide & conquer', 'schnell'],
    highlight: 'Erlaubt sehr schnelle Suchen in sortierten Daten, indem der Suchraum kontinuierlich halbiert wird.',
    simulate(data, target) {
      const steps = [];
      let left = 0;
      let right = data.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        steps.push({
          active: [mid],
          range: [left, right],
          message: `Prüfe Mitte bei Index ${mid} (Wert ${data[mid]}). Suche aktuell zwischen ${left} und ${right}.`,
          found: data[mid] === target,
        });
        if (data[mid] === target) {
          return { steps, foundIndex: mid };
        }
        if (data[mid] < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return { steps, foundIndex: -1 };
    },
  },
  jump: {
    name: 'Sprungsuche',
    description:
      'Springt durch das Array in Blöcken fester Größe und führt anschließend eine lineare Suche innerhalb des relevanten Blocks durch.',
    best: 'O(1)',
    average: 'O(√n)',
    worst: 'O(√n)',
    tags: ['sortiert', 'blöcke', 'hybrid'],
    highlight: 'Kombiniert große Sprünge mit linearer Suche, ideal für größere sortierte Listen.',
    simulate(data, target) {
      const steps = [];
      const n = data.length;
      const step = Math.max(1, Math.floor(Math.sqrt(n)));
      let prev = 0;
      let current = 0;

      while (current < n) {
        steps.push({
          active: [current],
          range: [prev, Math.min(current + step - 1, n - 1)],
          message: `Sprung zu Index ${current}. Suche blockweise mit Schrittweite ${step}.`,
          found: data[current] === target,
        });

        if (data[current] === target) {
          return { steps, foundIndex: current };
        }

        if (data[current] > target) {
          break;
        }

        prev = current;
        current = Math.min(current + step, n - 1);
        if (current === prev) break;
      }

      for (let i = prev; i < n && i <= current; i++) {
        steps.push({
          active: [i],
          range: [prev, current],
          message: `Lineare Suche innerhalb des Blocks: Index ${i} (Wert ${data[i]}).`,
          found: data[i] === target,
        });
        if (data[i] === target) {
          return { steps, foundIndex: i };
        }
      }

      return { steps, foundIndex: -1 };
    },
  },
  exponential: {
    name: 'Exponentielle Suche',
    description:
      'Verdoppelt den Suchbereich, bis das Ziel überschritten ist, und wendet anschließend eine Binärsuche innerhalb dieses Bereichs an.',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    tags: ['sortiert', 'verdoppeln', 'binärsuche'],
    highlight: 'Effizient für unendlich große oder unklare Datenstrukturen wie Streams oder Listen mit unbekannter Länge.',
    simulate(data, target) {
      const steps = [];
      if (data[0] === target) {
        steps.push({ active: [0], message: 'Starte bei Index 0 und finde sofort den Wert.', found: true });
        return { steps, foundIndex: 0 };
      }

      let bound = 1;
      while (bound < data.length && data[bound] < target) {
        steps.push({
          active: [bound],
          range: [bound / 2, bound],
          message: `Verdopple Bereich: prüfe Index ${bound}.`,
          found: false,
        });
        bound *= 2;
      }

      const left = Math.floor(bound / 2);
      const right = Math.min(bound, data.length - 1);
      steps.push({
        range: [left, right],
        message: `Binäre Suche im Bereich ${left} bis ${right}.`,
        active: [left],
        found: false,
      });

      let l = left;
      let r = right;
      while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        steps.push({
          active: [mid],
          range: [l, r],
          message: `Binäre Suche: prüfe Index ${mid}.`,
          found: data[mid] === target,
        });
        if (data[mid] === target) {
          return { steps, foundIndex: mid };
        }
        if (data[mid] < target) {
          l = mid + 1;
        } else {
          r = mid - 1;
        }
      }

      return { steps, foundIndex: -1 };
    },
  },
};

const state = {
  data: [],
  algorithm: 'linear',
  target: null,
  steps: [],
  currentStep: -1,
  timer: null,
};

const algorithmTabs = document.getElementById('algorithmTabs');
const algorithmInfo = document.getElementById('algorithmInfo');
const arrayContainer = document.getElementById('arrayContainer');
const stepInfo = document.getElementById('stepInfo');
const targetInput = document.getElementById('targetInput');
const generateDataBtn = document.getElementById('generateData');
const playStepsBtn = document.getElementById('playSteps');
const nextStepBtn = document.getElementById('nextStep');
const resetStepsBtn = document.getElementById('resetSteps');
const useRandomBtn = document.getElementById('useRandom');
const algorithmCards = document.getElementById('algorithmCards');
const comparisonTable = document.getElementById('comparisonTable');

function generateData() {
  const length = 14;
  let current = Math.floor(Math.random() * 10) + 2;
  state.data = Array.from({ length }, () => {
    const value = current;
    current += Math.floor(Math.random() * 9) + 2;
    return value;
  });
  renderArray();
  resetSteps();
}

function renderAlgorithmTabs() {
  algorithmTabs.innerHTML = '';
  Object.entries(algorithms).forEach(([key, algorithm]) => {
    const tab = document.createElement('button');
    tab.className = `algorithm-tab ${state.algorithm === key ? 'active' : ''}`;
    tab.textContent = algorithm.name;
    tab.addEventListener('click', () => {
      state.algorithm = key;
      renderAlgorithmTabs();
      updateAlgorithmInfo();
      resetSteps();
    });
    algorithmTabs.appendChild(tab);
  });
}

function updateAlgorithmInfo() {
  const algorithm = algorithms[state.algorithm];
  algorithmInfo.innerHTML = `
    <div class="badge"><span class="dot"></span>${algorithm.name}</div>
    <h3>${algorithm.highlight}</h3>
    <p>${algorithm.description}</p>
    <div class="complexity-grid">
      <div class="complexity-card"><span>Best Case</span><strong>${algorithm.best}</strong></div>
      <div class="complexity-card"><span>Average Case</span><strong>${algorithm.average}</strong></div>
      <div class="complexity-card"><span>Worst Case</span><strong>${algorithm.worst}</strong></div>
    </div>
  `;
}

function renderArray(step = null) {
  arrayContainer.innerHTML = '';
  const { data, target } = state;
  data.forEach((value, index) => {
    const item = document.createElement('div');
    item.className = 'array-item';
    if (step) {
      if (step.range && index >= step.range[0] && index <= step.range[1]) {
        item.classList.add('range');
      }
      if (step.active && step.active.includes(index)) {
        item.classList.add('active');
      }
      if (step.found && step.active && step.active.includes(index)) {
        item.classList.add('target');
      }
    }
    if (target !== null && value === target) {
      item.dataset.targetValue = true;
    }
    item.innerHTML = `${value}<span>#${index}</span>`;
    arrayContainer.appendChild(item);
  });
}

function resetSteps() {
  stopPlayback();
  state.steps = [];
  state.currentStep = -1;
  updateStatus('Bereit', 'Lege los, indem du auf „Start“ klickst oder einen Schritt weitergehst.');
  renderArray();
}

function prepareSteps() {
  const target = Number(targetInput.value);
  if (Number.isNaN(target)) {
    updateStatus('Hinweis', 'Bitte gib einen gültigen Suchwert ein oder wähle „Zufällig“.');
    return false;
  }
  state.target = target;
  const { steps, foundIndex } = algorithms[state.algorithm].simulate(state.data, target);
  state.steps = steps;
  state.foundIndex = foundIndex;
  state.currentStep = -1;
  return true;
}

function applyStep(direction = 1) {
  if (state.steps.length === 0) {
    const ok = prepareSteps();
    if (!ok) return;
  }

  const nextIndex = state.currentStep + direction;
  if (nextIndex < 0 || nextIndex >= state.steps.length) {
    stopPlayback();
    const found = state.foundIndex >= 0;
    updateStatus(
      found ? 'Gefunden' : 'Nicht gefunden',
      found
        ? `Der Wert ${state.target} wurde bei Index ${state.foundIndex} gefunden.`
        : `Der Wert ${state.target} befindet sich nicht in der aktuellen Datenmenge.`,
      found ? 'success' : 'fail'
    );
    return;
  }

  state.currentStep = nextIndex;
  const step = state.steps[nextIndex];
  renderArray(step);
  updateStatus(step.found ? 'Gefunden' : 'Aktiv', step.message, step.found ? 'success' : 'active');
}

function updateStatus(status, message, variant = '') {
  stepInfo.innerHTML = `
    <div class="status-label ${variant}">${status}</div>
    <p>${message}</p>
  `;
}

function stopPlayback() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
    playStepsBtn.textContent = 'Start';
  }
}

function togglePlayback() {
  if (state.timer) {
    stopPlayback();
    return;
  }

  const ok = prepareSteps();
  if (!ok) return;

  playStepsBtn.textContent = 'Stopp';
  applyStep(1);
  state.timer = setInterval(() => {
    applyStep(1);
    if (state.currentStep >= state.steps.length - 1) {
      stopPlayback();
    }
  }, 1200);
}

function useRandomTarget() {
  if (!state.data.length) return;
  const randomValue = state.data[Math.floor(Math.random() * state.data.length)];
  targetInput.value = randomValue;
  state.target = randomValue;
}

function renderAlgorithmCards() {
  algorithmCards.innerHTML = '';
  Object.values(algorithms).forEach((algorithm) => {
    const card = document.createElement('article');
    card.className = 'algorithm-card';
    card.innerHTML = `
      <div class="badge"><span class="dot"></span>${algorithm.name}</div>
      <h3>${algorithm.highlight}</h3>
      <p>${algorithm.description}</p>
      <div class="tag-list">
        ${algorithm.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
      </div>
    `;
    algorithmCards.appendChild(card);
  });
}

function renderComparisonTable() {
  comparisonTable.innerHTML = '';
  Object.values(algorithms).forEach((algorithm) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div>${algorithm.name}</div>
      <div>${algorithm.best}</div>
      <div>${algorithm.average}</div>
      <div>${algorithm.worst}</div>
      <div>${algorithm.highlight}</div>
    `;
    comparisonTable.appendChild(row);
  });
}

function init() {
  renderAlgorithmTabs();
  updateAlgorithmInfo();
  renderAlgorithmCards();
  renderComparisonTable();
  generateData();
}

useRandomBtn.addEventListener('click', () => {
  useRandomTarget();
  resetSteps();
});

generateDataBtn.addEventListener('click', () => {
  generateData();
  if (state.target !== null) {
    resetSteps();
  }
});

playStepsBtn.addEventListener('click', togglePlayback);
nextStepBtn.addEventListener('click', () => applyStep(1));
resetStepsBtn.addEventListener('click', () => {
  resetSteps();
});

targetInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    resetSteps();
    applyStep(1);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPlayback();
  }
});

init();
