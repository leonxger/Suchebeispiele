const algorithms = [
  {
    id: "linear",
    name: "Lineare Suche",
    complexity: "O(n)",
    description:
      "Durchläuft jede Position, bis der gesuchte Wert gefunden wird. Ideal für unsortierte Listen.",
    dataset: [12, 7, 19, 3, 23, 31, 4, 15, 9, 27],
    target: 23,
    tags: ["unsortiert", "einfach", "array"],
    buildSteps({ dataset, target }) {
      const steps = [];
      let found = false;
      for (let index = 0; index < dataset.length; index += 1) {
        const value = dataset[index];
        steps.push({
          type: "visit",
          index,
          message: `Vergleiche ${value} mit ${target}`,
        });
        if (value === target) {
          steps.push({
            type: "found",
            index,
            message: `Treffer bei Index ${index}`,
            variant: "success",
          });
          found = true;
          break;
        }
      }
      if (!found) {
        steps.push({
          type: "not-found",
          message: "Kein Treffer gefunden",
          variant: "warning",
        });
      }
      return steps;
    },
    render(container, context) {
      return createArrayVisualizer(container, context.dataset);
    },
  },
  {
    id: "binary",
    name: "Binäre Suche",
    complexity: "O(log n)",
    description:
      "Halbiert den Suchbereich iterativ. Funktioniert nur auf sortierten Listen.",
    dataset: [3, 9, 12, 17, 23, 31, 44, 52, 67, 88],
    target: 44,
    tags: ["sortiert", "array", "divide-and-conquer"],
    buildSteps({ dataset, target }) {
      const steps = [];
      let low = 0;
      let high = dataset.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        steps.push({
          type: "window",
          low,
          high,
          mid,
          message: `Prüfe Bereich [${low}, ${high}] → Mitte bei ${mid}`,
        });
        steps.push({
          type: "visit",
          index: mid,
          message: `Vergleiche ${dataset[mid]} mit ${target}`,
        });
        if (dataset[mid] === target) {
          steps.push({
            type: "found",
            index: mid,
            message: `Treffer bei Index ${mid}`,
            variant: "success",
          });
          return steps;
        }
        if (dataset[mid] < target) {
          low = mid + 1;
          steps.push({
            type: "note",
            message: `${dataset[mid]} ist kleiner → suche rechts weiter`,
          });
        } else {
          high = mid - 1;
          steps.push({
            type: "note",
            message: `${dataset[mid]} ist größer → suche links weiter`,
          });
        }
      }
      steps.push({
        type: "not-found",
        message: "Wert nicht gefunden",
        variant: "warning",
      });
      return steps;
    },
    render(container, context) {
      return createArrayVisualizer(container, context.dataset);
    },
  },
  {
    id: "jump",
    name: "Jump Search",
    complexity: "O(√n)",
    description:
      "Springt blockweise durch eine sortierte Liste und durchsucht den passenden Block linear.",
    dataset: [4, 7, 9, 12, 16, 21, 25, 29, 34, 38, 41, 47, 53],
    target: 29,
    tags: ["sortiert", "array", "optimiert"],
    buildSteps({ dataset, target }) {
      const steps = [];
      const size = dataset.length;
      const blockSize = Math.floor(Math.sqrt(size));
      let start = 0;
      let end = blockSize;
      steps.push({
        type: "note",
        message: `Blockgröße √${size} ≈ ${blockSize}`,
      });
      while (start < size && dataset[Math.min(end, size) - 1] < target) {
        steps.push({
          type: "block",
          start,
          end: Math.min(end, size) - 1,
          message: `Block [${start}, ${Math.min(end, size) - 1}] ist zu klein`,
        });
        start = end;
        end += blockSize;
      }
      steps.push({
        type: "block",
        start,
        end: Math.min(end, size) - 1,
        message: `Suche linear im Block [${start}, ${Math.min(end, size) - 1}]`,
      });
      for (let i = start; i < Math.min(end, size); i += 1) {
        steps.push({
          type: "visit",
          index: i,
          message: `Vergleiche ${dataset[i]} mit ${target}`,
        });
        if (dataset[i] === target) {
          steps.push({
            type: "found",
            index: i,
            message: `Treffer bei Index ${i}`,
            variant: "success",
          });
          return steps;
        }
      }
      steps.push({
        type: "not-found",
        message: "Wert nicht im Block gefunden",
        variant: "warning",
      });
      return steps;
    },
    render(container, context) {
      return createArrayVisualizer(container, context.dataset);
    },
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    complexity: "O(E log V)",
    description:
      "Bestimmt den kürzesten Pfad in gewichteten Graphen – ideal für Navigation und Routing.",
    graph: {
      nodes: [
        { id: "A", x: 18, y: 78 },
        { id: "B", x: 50, y: 14 },
        { id: "C", x: 82, y: 74 },
        { id: "D", x: 25, y: 32 },
        { id: "E", x: 50, y: 60 },
        { id: "F", x: 75, y: 36 },
      ],
      edges: [
        { from: "A", to: "D", weight: 4 },
        { from: "A", to: "B", weight: 6 },
        { from: "D", to: "B", weight: 3 },
        { from: "D", to: "E", weight: 5 },
        { from: "B", to: "F", weight: 2 },
        { from: "E", to: "F", weight: 4 },
        { from: "E", to: "C", weight: 6 },
        { from: "F", to: "C", weight: 3 },
      ],
      start: "A",
      target: "C",
    },
    tags: ["graph", "pfad", "gewichtete-netzwerke"],
    buildSteps({ graph }) {
      return buildDijkstraSteps(graph);
    },
    render(container, context) {
      return createGraphVisualizer(container, context.graph);
    },
  },
];

const cardStates = new Map();
let activeFilter = "Alle";
let complexityChart;

function init() {
  buildAlgorithmCards();
  buildTagFilter();
  initComplexityChart();
  initHeroAnimation();
  initThemeToggle();
}

function buildAlgorithmCards() {
  const grid = document.getElementById("algorithmGrid");
  const template = document.getElementById("cardTemplate");
  if (!grid || !template) return;

  algorithms.forEach((algorithm) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const title = node.querySelector(".card__title");
    const complexity = node.querySelector(".card__complexity");
    const description = node.querySelector(".card__description");
    const visualContainer = node.querySelector(".card__visual");
    const statusEl = node.querySelector(".card__status");
    const tagsEl = node.querySelector(".card__tags");

    title.textContent = algorithm.name;
    complexity.textContent = algorithm.complexity;
    description.textContent = algorithm.description;
    statusEl.textContent = "Bereit";

    const visualizer = algorithm.render(visualContainer, algorithm);
    const steps = algorithm.buildSteps(algorithm);

    algorithm.tags.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      tagsEl.appendChild(li);
    });

    node.dataset.tags = algorithm.tags.join(",");
    node.dataset.id = algorithm.id;

    const cardState = {
      algorithm,
      visualizer,
      steps,
      index: 0,
      playing: false,
      timer: null,
      node,
      statusEl,
    };

    node.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => handleAction(cardState, btn.dataset.action));
    });

    cardStates.set(algorithm.id, cardState);
    grid.appendChild(node);
  });
}

function buildTagFilter() {
  const filter = document.getElementById("tagFilter");
  if (!filter) return;
  const unique = new Set(["Alle"]);
  algorithms.forEach((algo) => algo.tags.forEach((tag) => unique.add(tag)));

  unique.forEach((tag) => {
    const chip = document.createElement("button");
    chip.className = "filter__chip";
    chip.textContent = tag;
    if (tag === activeFilter) chip.classList.add("filter__chip--active");
    chip.addEventListener("click", () => toggleFilter(tag));
    filter.appendChild(chip);
  });
}

function toggleFilter(tag) {
  activeFilter = activeFilter === tag ? "Alle" : tag;
  const filter = document.getElementById("tagFilter");
  if (!filter) return;
  filter.querySelectorAll(".filter__chip").forEach((chip) => {
    chip.classList.toggle("filter__chip--active", chip.textContent === activeFilter);
  });

  cardStates.forEach((state) => {
    const matches = activeFilter === "Alle" || state.algorithm.tags.includes(activeFilter);
    state.node.style.display = matches ? "grid" : "none";
  });
}

function handleAction(state, action) {
  switch (action) {
    case "play":
      playState(state);
      break;
    case "step":
      stepState(state);
      break;
    case "reset":
      resetState(state);
      break;
    default:
      break;
  }
}

function playState(state) {
  if (state.playing) {
    clearInterval(state.timer);
    state.playing = false;
    updateStatus(state, "Pausiert");
    return;
  }
  state.playing = true;
  updateStatus(state, "Simulation läuft …");
  state.timer = setInterval(() => {
    const hasMore = stepState(state);
    if (!hasMore) {
      clearInterval(state.timer);
      state.playing = false;
    }
  }, 900);
}

function stepState(state) {
  if (state.index >= state.steps.length) {
    updateStatus(state, "Simulation beendet");
    return false;
  }
  const step = state.steps[state.index];
  state.visualizer.apply(step);
  updateStatus(state, step.message || "Schritt ausgeführt", step.variant);
  state.index += 1;
  return state.index < state.steps.length;
}

function resetState(state) {
  clearInterval(state.timer);
  state.playing = false;
  state.index = 0;
  state.steps = state.algorithm.buildSteps(state.algorithm);
  state.visualizer.reset();
  updateStatus(state, "Zurückgesetzt");
}

function updateStatus(state, message, variant) {
  const el = state.statusEl;
  el.textContent = message;
  el.classList.remove("badge--success", "badge--warning");
  if (variant === "success") el.classList.add("badge--success");
  if (variant === "warning") el.classList.add("badge--warning");
}

function createArrayVisualizer(container, dataset) {
  container.classList.add("visual--array");
  container.innerHTML = "";
  const bars = dataset.map((value, index) => {
    const el = document.createElement("div");
    el.className = "bar";
    el.dataset.index = index;
    el.textContent = value;
    container.appendChild(el);
    return el;
  });
  let activeIndex = null;

  return {
    reset() {
      bars.forEach((bar) => {
        bar.className = "bar";
      });
      activeIndex = null;
    },
    apply(step) {
      switch (step.type) {
        case "window":
          applyWindow(step.low, step.high, step.mid);
          break;
        case "block":
          applyWindow(step.start, step.end);
          break;
        case "visit":
          markVisited(step.index);
          break;
        case "found":
          markFound(step.index);
          break;
        case "note":
          break;
        case "not-found":
          break;
        default:
          break;
      }
    },
  };

  function applyWindow(low, high, focus) {
    bars.forEach((bar, idx) => {
      bar.classList.toggle("bar--inactive", idx < low || idx > high);
    });
    if (typeof focus === "number") {
      markVisited(focus);
    }
  }

  function markVisited(index) {
    if (typeof index !== "number") return;
    if (activeIndex !== null && bars[activeIndex]) {
      bars[activeIndex].classList.remove("bar--active");
    }
    const bar = bars[index];
    if (!bar) return;
    bar.classList.remove("bar--inactive");
    bar.classList.add("bar--visited", "bar--active");
    activeIndex = index;
  }

  function markFound(index) {
    markVisited(index);
    const bar = bars[index];
    if (!bar) return;
    bar.classList.add("bar--found");
  }
}

function createGraphVisualizer(container, graph) {
  container.classList.add("visual--graph");
  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "graph";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  const edgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.append(edgeGroup, labelGroup);
  wrapper.appendChild(svg);
  container.appendChild(wrapper);

  const nodeLayer = document.createElement("div");
  nodeLayer.style.position = "absolute";
  nodeLayer.style.inset = "0";
  nodeLayer.style.pointerEvents = "none";
  wrapper.appendChild(nodeLayer);

  const nodes = new Map();
  graph.nodes.forEach((node) => {
    const el = document.createElement("div");
    el.className = "graph__node";
    el.textContent = node.id;
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;
    el.style.transform = "translate(-50%, -50%)";
    nodeLayer.appendChild(el);
    nodes.set(node.id, el);
  });

  const edges = [];
  graph.edges.forEach((edge) => {
    const from = graph.nodes.find((n) => n.id === edge.from);
    const to = graph.nodes.find((n) => n.id === edge.to);
    if (!from || !to) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.classList.add("graph__edge");
    edgeGroup.appendChild(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (from.x + to.x) / 2);
    label.setAttribute("y", (from.y + to.y) / 2);
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("text-anchor", "middle");
    label.textContent = edge.weight;
    labelGroup.appendChild(label);

    edges.push({ key: `${edge.from}-${edge.to}`, line });
  });

  return {
    reset() {
      nodes.forEach((nodeEl) => {
        nodeEl.classList.remove("graph__node--visited", "graph__node--active");
      });
      edges.forEach((edgeObj) => edgeObj.line.classList.remove("graph__edge--active"));
    },
    apply(step) {
      switch (step.type) {
        case "visit-node":
          visitNode(step.id);
          break;
        case "activate-node":
          activateNode(step.id);
          break;
        case "edge":
          highlightEdge(step.from, step.to);
          break;
        case "path":
          highlightEdge(step.from, step.to);
          activateNode(step.to);
          break;
        default:
          break;
      }
    },
  };

  function visitNode(id) {
    const node = nodes.get(id);
    if (!node) return;
    node.classList.add("graph__node--visited");
  }

  function activateNode(id) {
    nodes.forEach((nodeEl) => nodeEl.classList.remove("graph__node--active"));
    const node = nodes.get(id);
    if (node) node.classList.add("graph__node--active");
  }

  function highlightEdge(from, to) {
    const edge = edges.find((item) => item.key === `${from}-${to}` || item.key === `${to}-${from}`);
    if (edge) edge.line.classList.add("graph__edge--active");
  }
}

function buildDijkstraSteps(graph) {
  const steps = [];
  const distances = new Map();
  const visited = new Set();
  const previous = new Map();

  graph.nodes.forEach((node) => distances.set(node.id, Infinity));
  distances.set(graph.start, 0);

  steps.push({ type: "activate-node", id: graph.start, message: `Starte bei ${graph.start}` });

  while (visited.size < graph.nodes.length) {
    const current = [...graph.nodes]
      .map((n) => n.id)
      .filter((id) => !visited.has(id))
      .sort((a, b) => distances.get(a) - distances.get(b))[0];
    if (!current || distances.get(current) === Infinity) break;

    visited.add(current);
    steps.push({ type: "visit-node", id: current, message: `Besuche ${current}` });
    if (current === graph.target) {
      steps.push({ type: "note", message: "Ziel erreicht" });
      break;
    }

    const neighbors = graph.edges
      .filter((edge) => edge.from === current || edge.to === current)
      .map((edge) => ({
        id: edge.from === current ? edge.to : edge.from,
        weight: edge.weight,
        from: edge.from,
        to: edge.to,
      }));

    neighbors.forEach((neighbor) => {
      if (visited.has(neighbor.id)) return;
      const newDist = distances.get(current) + neighbor.weight;
      steps.push({
        type: "edge",
        from: current,
        to: neighbor.id,
        message: `Kosten von ${current} → ${neighbor.id}: ${newDist}`,
      });
      if (newDist < distances.get(neighbor.id)) {
        distances.set(neighbor.id, newDist);
        previous.set(neighbor.id, current);
        steps.push({
          type: "note",
          message: `Neuer kürzerer Pfad zu ${neighbor.id} mit Kosten ${newDist}`,
        });
      }
    });

    const next = [...graph.nodes]
      .map((n) => n.id)
      .filter((id) => !visited.has(id))
      .sort((a, b) => distances.get(a) - distances.get(b))[0];
    if (next) {
      steps.push({ type: "activate-node", id: next, message: `Wähle nächsten Kandidaten ${next}` });
    }
  }

  const path = [];
  let current = graph.target;
  while (current && previous.has(current)) {
    const from = previous.get(current);
    path.unshift({ from, to: current });
    current = from;
  }

  path.forEach((segment) => {
    steps.push({
      type: "path",
      from: segment.from,
      to: segment.to,
      message: `Pfadteil ${segment.from} → ${segment.to}`,
      variant: "success",
    });
  });

  if (!path.length) {
    steps.push({
      type: "not-found",
      message: "Kein Pfad gefunden",
      variant: "warning",
    });
  }

  return steps;
}

function initComplexityChart() {
  const ctx = document.getElementById("complexityChart");
  if (!ctx) return;
  const labels = Array.from({ length: 8 }, (_, i) => (i + 1) * 10);
  const theme = getComputedStyle(document.body);
  const textColor = theme.getPropertyValue("--text-muted") || "#94a3b8";
  const gridColor = "rgba(148, 163, 184, 0.18)";

  complexityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Linear O(n)",
          data: labels.map((n) => n),
          borderColor: "#60a5fa",
          tension: 0.35,
          fill: false,
        },
        {
          label: "Binär O(log n)",
          data: labels.map((n) => Math.log2(n) * 10),
          borderColor: "#f97316",
          tension: 0.35,
          fill: false,
        },
        {
          label: "Dijkstra O(E log V)",
          data: labels.map((n) => n * Math.log2(n)),
          borderColor: "#34d399",
          tension: 0.35,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
      },
    },
  });
}

function refreshChartTheme() {
  if (!complexityChart) return;
  const theme = getComputedStyle(document.body);
  const textColor = theme.getPropertyValue("--text-muted") || "#94a3b8";
  complexityChart.options.plugins.legend.labels.color = textColor;
  complexityChart.options.scales.x.ticks.color = textColor;
  complexityChart.options.scales.y.ticks.color = textColor;
  complexityChart.update();
}

function initHeroAnimation() {
  const container = document.getElementById("heroCanvas");
  if (!container) return;
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const nodes = Array.from({ length: 16 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
  }));

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  window.addEventListener("resize", () => {
    resize();
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node, i) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      for (let j = i + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160) {
          const alpha = 1 - dist / 160;
          ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    nodes.forEach((node) => {
      ctx.fillStyle = "rgba(96, 165, 250, 0.8)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const stored = localStorage.getItem("search-theme");
  if (stored === "light") {
    document.body.classList.add("theme-light");
  }
  updateIcon();
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("theme-light");
    const mode = document.body.classList.contains("theme-light") ? "light" : "dark";
    localStorage.setItem("search-theme", mode);
    updateIcon();
    refreshChartTheme();
  });

  function updateIcon() {
    const icon = toggle.querySelector("span");
    if (!icon) return;
    icon.textContent = document.body.classList.contains("theme-light") ? "☀" : "☾";
  }
}

document.addEventListener("DOMContentLoaded", init);
