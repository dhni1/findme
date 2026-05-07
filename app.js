const STORAGE_KEY = "findme-items-v1";

const TYPE_KEYWORDS = {
  텀블러: ["텀블러", "보틀", "물병"],
  우산: ["우산"],
  필통: ["필통", "파우치"],
  이어폰케이스: ["이어폰", "에어팟", "버즈", "케이스"],
  옷: ["후드", "가디건", "점퍼", "옷", "외투", "체육복"],
  책: ["책", "노트", "교재", "문제집"],
  지갑: ["지갑", "카드지갑"],
  안경: ["안경"],
};

const DEFAULT_TYPES = ["텀블러", "우산", "필통", "이어폰케이스", "옷", "책", "지갑", "안경", "기타"];

const COLOR_PALETTE = [
  { name: "검정", rgb: [40, 40, 40] },
  { name: "하양", rgb: [235, 235, 235] },
  { name: "회색", rgb: [145, 145, 145] },
  { name: "파랑", rgb: [66, 116, 220] },
  { name: "빨강", rgb: [206, 69, 62] },
  { name: "초록", rgb: [61, 141, 90] },
  { name: "노랑", rgb: [231, 193, 66] },
  { name: "주황", rgb: [220, 133, 52] },
  { name: "보라", rgb: [122, 88, 179] },
  { name: "분홍", rgb: [221, 137, 176] },
  { name: "갈색", rgb: [125, 88, 49] },
];

const sampleItems = [
  {
    id: crypto.randomUUID(),
    title: "검은 텀블러",
    description: "뚜껑에 작은 스크래치가 있고 스티커 자국이 남아 있어요.",
    storageLocation: "2층 학생안전부",
    foundPlace: "본관 3층 복도",
    foundAt: offsetDate(-2),
    type: "텀블러",
    color: "검정",
    image: "",
    status: "active",
    createdAt: offsetDate(-2),
    receivedAt: "",
    hidden: false,
    autoTags: ["검정", "텀블러"],
  },
  {
    id: crypto.randomUUID(),
    title: "파란 우산",
    description: "손잡이가 곡선형이고 안쪽에 흰 줄무늬가 있어요.",
    storageLocation: "1층 행정실 앞 분실물함",
    foundPlace: "급식실 입구",
    foundAt: offsetDate(-6),
    type: "우산",
    color: "파랑",
    image: "",
    status: "active",
    createdAt: offsetDate(-6),
    receivedAt: "",
    hidden: false,
    autoTags: ["파랑", "우산"],
  },
  {
    id: crypto.randomUUID(),
    title: "흰 에어팟 케이스",
    description: "케이스 앞면에 작은 별 스티커가 붙어 있습니다.",
    storageLocation: "도서관 데스크",
    foundPlace: "도서관 열람실",
    foundAt: offsetDate(-1),
    type: "이어폰케이스",
    color: "하양",
    image: "",
    status: "received",
    createdAt: offsetDate(-1),
    receivedAt: offsetDate(0),
    hidden: false,
    autoTags: ["하양", "이어폰케이스"],
  },
];

const state = {
  items: [],
  showStaleOnly: false,
};

const elements = {
  activeCount: document.querySelector("#activeCount"),
  todayCount: document.querySelector("#todayCount"),
  receivedCount: document.querySelector("#receivedCount"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  colorFilter: document.querySelector("#colorFilter"),
  placeFilter: document.querySelector("#placeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  resultText: document.querySelector("#resultText"),
  itemGrid: document.querySelector("#itemGrid"),
  registerForm: document.querySelector("#registerForm"),
  itemImage: document.querySelector("#itemImage"),
  itemTitle: document.querySelector("#itemTitle"),
  itemType: document.querySelector("#itemType"),
  itemColor: document.querySelector("#itemColor"),
  itemDescription: document.querySelector("#itemDescription"),
  autoTagBox: document.querySelector("#autoTagBox"),
  imagePreview: document.querySelector("#imagePreview"),
  seedSamples: document.querySelector("#seedSamples"),
  adminList: document.querySelector("#adminList"),
  archiveReceived: document.querySelector("#archiveReceived"),
  highlightStale: document.querySelector("#highlightStale"),
  itemCardTemplate: document.querySelector("#itemCardTemplate"),
  adminRowTemplate: document.querySelector("#adminRowTemplate"),
};

bootstrap();

function bootstrap() {
  state.items = loadItems();
  setDefaultFoundAt();
  wireEvents();
  refreshFilters();
  render();
}

function wireEvents() {
  [
    elements.searchInput,
    elements.typeFilter,
    elements.colorFilter,
    elements.placeFilter,
    elements.statusFilter,
  ].forEach((node) => node.addEventListener("input", render));

  elements.resetFilters.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.typeFilter.value = "";
    elements.colorFilter.value = "";
    elements.placeFilter.value = "";
    elements.statusFilter.value = "all";
    render();
  });

  elements.registerForm.addEventListener("submit", handleRegister);
  elements.itemImage.addEventListener("change", handleImageSelect);
  elements.itemTitle.addEventListener("input", updateAutoTagsFromForm);
  elements.itemDescription.addEventListener("input", updateAutoTagsFromForm);
  elements.seedSamples.addEventListener("click", seedSamples);
  elements.archiveReceived.addEventListener("click", hideReceivedItems);
  elements.highlightStale.addEventListener("click", () => {
    state.showStaleOnly = !state.showStaleOnly;
    elements.highlightStale.textContent = state.showStaleOnly
      ? "전체 항목 보기"
      : "14일 이상 항목 보기";
    renderAdminList();
  });
}

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
    return [...sampleItems];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
    return [...sampleItems];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function render() {
  renderStats();
  renderItems();
  renderAdminList();
}

function renderStats() {
  const visible = state.items.filter((item) => !item.hidden);
  const today = new Date().toISOString().slice(0, 10);

  elements.activeCount.textContent = visible.filter(
    (item) => item.status === "active",
  ).length;
  elements.receivedCount.textContent = visible.filter(
    (item) => item.status === "received",
  ).length;
  elements.todayCount.textContent = visible.filter((item) =>
    item.createdAt.startsWith(today),
  ).length;
}

function renderItems() {
  const filtered = getFilteredItems();
  elements.itemGrid.innerHTML = "";

  elements.resultText.textContent =
    filtered.length > 0
      ? `${filtered.length}개의 분실물이 조건에 맞아요.`
      : "조건에 맞는 분실물이 없어요.";

  if (filtered.length === 0) {
    elements.itemGrid.innerHTML =
      '<div class="empty-state">검색어를 조금 바꾸거나 필터를 풀어보세요.</div>';
    return;
  }

  filtered.forEach((item) => {
    const node = elements.itemCardTemplate.content.firstElementChild.cloneNode(true);
    const image = node.querySelector(".card-image");
    const status = node.querySelector(".card-status");
    const title = node.querySelector(".card-title");
    const age = node.querySelector(".card-age");
    const description = node.querySelector(".card-description");
    const facts = node.querySelector(".card-facts");
    const tags = node.querySelector(".card-tags");
    const receiveButton = node.querySelector(".receive-button");

    image.src = item.image || buildPlaceholderDataUrl(item.color);
    image.alt = `${item.title} 사진`;
    status.textContent = item.status === "received" ? "수령 완료" : "보관 중";
    status.className = `card-status ${
      item.status === "received" ? "status-received" : "status-active"
    }`;
    title.textContent = item.title;
    age.textContent = relativeText(item.foundAt);
    description.textContent =
      item.description || "아직 메모가 없어요. 사진과 태그를 참고해 주세요.";

    facts.innerHTML = [
      factMarkup("보관 위치", item.storageLocation),
      factMarkup("발견 장소", item.foundPlace),
      factMarkup("종류", item.type || "미분류"),
      factMarkup("색상", item.color || "미분류"),
    ].join("");

    const tagList = Array.from(
      new Set([item.type, item.color, ...(item.autoTags || [])].filter(Boolean)),
    );
    tags.innerHTML = tagList
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join("");

    if (item.status === "received") {
      receiveButton.textContent = "수령 처리됨";
      receiveButton.disabled = true;
    } else {
      receiveButton.addEventListener("click", () => markReceived(item.id));
    }

    elements.itemGrid.appendChild(node);
  });
}

function renderAdminList() {
  const rows = state.items
    .filter((item) => !item.hidden)
    .filter((item) => !state.showStaleOnly || isStale(item));

  elements.adminList.innerHTML = "";

  if (rows.length === 0) {
    elements.adminList.innerHTML =
      '<div class="empty-state">표시할 관리 항목이 없습니다.</div>';
    return;
  }

  rows
    .slice()
    .sort((a, b) => new Date(b.foundAt) - new Date(a.foundAt))
    .forEach((item) => {
      const node = elements.adminRowTemplate.content.firstElementChild.cloneNode(true);
      const title = node.querySelector(".admin-row-title");
      const meta = node.querySelector(".admin-row-meta");
      const restoreButton = node.querySelector(".restore-button");
      const removeButton = node.querySelector(".remove-button");

      title.textContent = `${item.title} · ${item.status === "received" ? "수령 완료" : "보관 중"}`;
      meta.textContent = `${item.storageLocation} 보관 / ${item.foundPlace} 발견 / ${formatDate(item.foundAt)}`;

      if (isStale(item)) {
        node.classList.add("is-stale");
      }

      restoreButton.textContent = item.status === "received" ? "보관 중 복구" : "상태 유지";
      restoreButton.disabled = item.status !== "received";
      restoreButton.addEventListener("click", () => restoreItem(item.id));
      removeButton.addEventListener("click", () => removeItem(item.id));

      elements.adminList.appendChild(node);
    });
}

function getFilteredItems() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const typeValue = elements.typeFilter.value;
  const colorValue = elements.colorFilter.value;
  const placeValue = elements.placeFilter.value;
  const statusValue = elements.statusFilter.value;

  return state.items
    .filter((item) => !item.hidden)
    .filter((item) => {
      if (statusValue === "active") return item.status === "active";
      if (statusValue === "received") return item.status === "received";
      return true;
    })
    .filter((item) => !typeValue || item.type === typeValue)
    .filter((item) => !colorValue || item.color === colorValue)
    .filter((item) => !placeValue || item.foundPlace === placeValue)
    .filter((item) => matchesSearch(item, query))
    .sort((a, b) => new Date(b.foundAt) - new Date(a.foundAt));
}

function matchesSearch(item, query) {
  if (!query) return true;

  const haystack = [
    item.title,
    item.description,
    item.storageLocation,
    item.foundPlace,
    item.type,
    item.color,
    ...(item.autoTags || []),
  ]
    .join(" ")
    .toLowerCase();

  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

async function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(elements.registerForm);
  const imageFile = formData.get("image");
  const title = formData.get("title").trim();
  const description = formData.get("description").trim();
  const storageLocation = formData.get("storageLocation").trim();
  const foundPlace = formData.get("foundPlace").trim();
  const foundAt = formData.get("foundAt");
  const type = formData.get("type").trim();
  const color = formData.get("color").trim();

  const imageDataUrl = imageFile && imageFile.size > 0 ? await fileToDataUrl(imageFile) : "";
  const normalizedType = normalizeType(type || detectType(`${title} ${description}`));
  const autoTags = deriveAutoTags({
    title,
    description,
    type: normalizedType,
    color,
  });

  state.items.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    storageLocation,
    foundPlace,
    foundAt,
    type: normalizedType,
    color,
    image: imageDataUrl,
    status: "active",
    createdAt: new Date().toISOString(),
    receivedAt: "",
    hidden: false,
    autoTags,
  });

  persist();
  refreshFilters();
  render();
  elements.registerForm.reset();
  setDefaultFoundAt();
  resetPreview();
  updateAutoTags([]);
  alert("분실물이 등록되었습니다.");
}

async function handleImageSelect(event) {
  const [file] = event.target.files || [];
  if (!file) {
    resetPreview();
    updateAutoTagsFromForm();
    return;
  }

  const previewUrl = await fileToDataUrl(file);
  elements.imagePreview.innerHTML = `<img src="${previewUrl}" alt="업로드한 분실물 사진 미리보기">`;
  elements.imagePreview.classList.remove("empty");

  const dominantColor = await detectColor(previewUrl);
  const suggestedType = detectType(`${elements.itemTitle.value} ${file.name}`);

  if (!elements.itemColor.value && dominantColor) {
    elements.itemColor.value = dominantColor;
  }

  if (!elements.itemType.value && suggestedType) {
    elements.itemType.value = suggestedType;
  }

  updateAutoTagsFromForm();
}

function updateAutoTagsFromForm() {
  const tags = deriveAutoTags({
    title: elements.itemTitle.value.trim(),
    description: elements.itemDescription.value.trim(),
    type: elements.itemType.value.trim(),
    color: elements.itemColor.value.trim(),
  });
  updateAutoTags(tags);
}

function deriveAutoTags({ title, description, type, color }) {
  const merged = `${title} ${description}`;
  const suggestedType = type || detectType(merged);
  const suggestedColor = color || detectColorFromText(merged);

  return Array.from(new Set([suggestedType, suggestedColor].filter(Boolean)));
}

function updateAutoTags(tags) {
  if (!tags.length) {
    elements.autoTagBox.innerHTML =
      '<span class="muted">사진이나 제목을 넣으면 추천 태그가 표시됩니다.</span>';
    return;
  }

  elements.autoTagBox.innerHTML = tags
    .map((tag) => `<span class="pill">추천 · ${escapeHtml(tag)}</span>`)
    .join("");
}

function markReceived(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  const confirmed = confirm("이 물건을 수령 완료로 표시할까요?");
  if (!confirmed) return;

  item.status = "received";
  item.receivedAt = new Date().toISOString();
  persist();
  render();
}

function restoreItem(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  item.status = "active";
  item.receivedAt = "";
  persist();
  render();
}

function removeItem(id) {
  const confirmed = confirm("이 항목을 완전히 삭제할까요?");
  if (!confirmed) return;

  state.items = state.items.filter((entry) => entry.id !== id);
  persist();
  refreshFilters();
  render();
}

function hideReceivedItems() {
  let changed = 0;
  state.items.forEach((item) => {
    if (item.status === "received" && !item.hidden) {
      item.hidden = true;
      changed += 1;
    }
  });
  persist();
  refreshFilters();
  render();
  alert(changed > 0 ? `${changed}개의 수령 완료 항목을 숨겼습니다.` : "숨길 항목이 없습니다.");
}

function refreshFilters() {
  fillSelect(elements.typeFilter, uniqueValues("type", DEFAULT_TYPES));
  fillSelect(elements.colorFilter, uniqueValues("color"));
  fillSelect(elements.placeFilter, uniqueValues("foundPlace"));
}

function uniqueValues(key, seedValues = []) {
  return Array.from(
    new Set([
      ...seedValues,
      ...state.items
        .filter((item) => !item.hidden)
        .map((item) => item[key])
        .filter(Boolean),
    ]),
  ).sort((a, b) => a.localeCompare(b, "ko"));
}

function fillSelect(selectNode, values) {
  const current = selectNode.value;
  const firstOption = selectNode.querySelector("option")?.outerHTML || "";
  selectNode.innerHTML =
    firstOption + values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  if (values.includes(current)) {
    selectNode.value = current;
  }
}

function setDefaultFoundAt() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  elements.registerForm.querySelector("#foundAt").value = now.toISOString().slice(0, 16);
}

function seedSamples() {
  const confirmed = confirm("현재 데이터를 샘플 데이터로 덮어쓸까요?");
  if (!confirmed) return;

  state.items = [...sampleItems];
  persist();
  refreshFilters();
  render();
}

function resetPreview() {
  elements.imagePreview.classList.add("empty");
  elements.imagePreview.innerHTML = "<span>사진 미리보기</span>";
}

function detectType(text) {
  const normalized = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return type;
    }
  }
  return "";
}

function normalizeType(type) {
  return type && type.trim() ? type.trim() : "기타";
}

function detectColorFromText(text) {
  const map = {
    검정: ["검정", "검은", "블랙"],
    하양: ["하양", "흰", "화이트"],
    회색: ["회색", "그레이"],
    파랑: ["파랑", "파란", "블루"],
    빨강: ["빨강", "빨간", "레드"],
    초록: ["초록", "초록색", "그린"],
    노랑: ["노랑", "노란", "옐로"],
    주황: ["주황", "오렌지"],
    보라: ["보라", "퍼플"],
    분홍: ["분홍", "핑크"],
    갈색: ["갈색", "브라운"],
  };

  const normalized = text.toLowerCase();
  for (const [color, keywords] of Object.entries(map)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return color;
    }
  }
  return "";
}

async function detectColor(dataUrl) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  context.drawImage(image, 0, 0, size, size);

  const { data } = context.getImageData(0, 0, size, size);
  let r = 0;
  let g = 0;
  let b = 0;
  let pixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 120) continue;
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
    pixels += 1;
  }

  if (pixels === 0) return "";

  const average = [r / pixels, g / pixels, b / pixels];
  return nearestColor(average);
}

function nearestColor([r, g, b]) {
  let winner = "";
  let score = Number.POSITIVE_INFINITY;

  COLOR_PALETTE.forEach((color) => {
    const [cr, cg, cb] = color.rgb;
    const distance = Math.sqrt(
      (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2,
    );
    if (distance < score) {
      score = distance;
      winner = color.name;
    }
  });

  return winner;
}

function buildPlaceholderDataUrl(colorName = "") {
  const colorMap = {
    검정: "#454545",
    하양: "#f3efe9",
    회색: "#9a9a9a",
    파랑: "#4b74dc",
    빨강: "#d45b53",
    초록: "#4c9974",
    노랑: "#e7c95c",
    주황: "#dc8a51",
    보라: "#8d71d3",
    분홍: "#ea98bc",
    갈색: "#927050",
  };
  const fill = colorMap[colorName] || "#d8c5b1";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${fill}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#f4ebe1" stop-opacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="640" height="440" fill="url(#g)" rx="32" />
      <circle cx="126" cy="92" r="42" fill="rgba(255,255,255,0.35)" />
      <text x="50%" y="48%" text-anchor="middle" fill="#fffaf2" font-size="42" font-family="SUIT, sans-serif" font-weight="800">FINDME</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#fffaf2" font-size="20" font-family="SUIT, sans-serif">등록된 이미지가 없는 분실물</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function factMarkup(term, value) {
  return `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function relativeText(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "오늘 발견";
  if (diffDays === 1) return "어제 발견";
  return `${diffDays}일 전 발견`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function isStale(item) {
  const ageMs = Date.now() - new Date(item.foundAt).getTime();
  return ageMs >= 14 * 24 * 60 * 60 * 1000;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
