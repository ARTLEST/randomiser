const wheelData = {
  world: [
    'Healthcare',
    'Gaming',
    'Education',
    'Food',
    'Travel',
    'Sports',
    'Finance',
    'Agriculture',
    'Fashion',
    'Entertainment',
    'Music',
    'Transportation'
  ],
  twist: [
    'AI',
    'Robotics',
    'AR/VR',
    'Automation',
    'Subscription',
    'Marketplace',
    'Personalization',
    'Community',
    'Gamification',
    'Blockchain',
    'Sustainability',
    'Privacy-first',
    'No Technology'
  ],
  people: [
    'Students',
    'Families',
    'Elderly',
    'Creators',
    'Small Businesses',
    'Travelers',
    'Athletes',
    'Gamers',
    'Remote Workers',
    'Rural Communities',
    'Children',
    'Accessibility',
    'Pet Owners'
  ]
};

const state = {
  world: { rotation: 0, selectedIndex: 0 },
  twist: { rotation: 0, selectedIndex: 0 },
  people: { rotation: 0, selectedIndex: 0 }
};

const spinLogList = document.getElementById('spinLogList');
const teamNameInput = document.getElementById('teamNameInput');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const spinEntries = [];

function getTeamName() {
  const value = (teamNameInput?.value || '').trim();
  return value || 'Team';
}

function buildPdfDocument(entries) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('jsPDF failed to load.');
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 42;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 56;

  doc.setFontSize(20);
  doc.text('Million Dollar Idea', margin, y);
  y += 24;

  doc.setFontSize(12);
  doc.text('Spin Log', margin, y);
  y += 18;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 28;

  if (!entries.length) {
    doc.text('No spins recorded.', margin, y);
    return doc;
  }

  entries.forEach((entry, index) => {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }

    doc.setFontSize(11);
    doc.text(`Entry ${index + 1} — ${entry.team}`, margin, y);
    y += 18;
    doc.text(`World: ${entry.world}`, margin, y);
    y += 18;
    doc.text(`Twist: ${entry.twist}`, margin, y);
    y += 18;
    doc.text(`People: ${entry.people}`, margin, y);
    y += 18;
    doc.text(`Time: ${entry.timestamp}`, margin, y);
    y += 24;
  });

  return doc;
}

function downloadSpinLogPdf() {
  const doc = buildPdfDocument(spinEntries.slice());
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'million-dollar-idea-log.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildWheelLabels(slotKey, wheel) {
  const items = wheelData[slotKey];
  const angleStep = 360 / items.length;

  items.forEach((item, index) => {
    const label = document.createElement('span');
    label.className = 'option-label';
    label.style.setProperty('--label-angle', `${(index + 0.5) * angleStep}deg`);
    label.textContent = item;
    wheel.appendChild(label);
  });
}

function getRandomIndex(items) {
  const arrayLength = items.length;

  if (arrayLength <= 0) {
    return 0;
  }

  if (window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] % arrayLength;
  }

  return Math.floor(Math.random() * arrayLength);
}

function addSpinLog(results) {
  const item = {
    team: getTeamName(),
    world: results.world,
    twist: results.twist,
    people: results.people,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  spinEntries.unshift(item);

  const entryEl = document.createElement('li');
  entryEl.className = 'log-entry';
  entryEl.innerHTML = `
    <strong>${item.team}</strong> —
    World: <strong>${item.world}</strong> |
    Twist: <strong>${item.twist}</strong> |
    People: <strong>${item.people}</strong>
    <div>${item.timestamp}</div>
  `;

  const firstChild = spinLogList.querySelector('.is-empty');
  if (firstChild) {
    firstChild.remove();
  }

  spinLogList.prepend(entryEl);

  while (spinLogList.children.length > 6) {
    spinLogList.removeChild(spinLogList.lastElementChild);
  }

  console.log('[Randomiser Spin]', item);
}

function spinWheel(slotKey) {
  const wheel = document.querySelector(`[data-wheel="${slotKey}"]`);
  const items = wheelData[slotKey];
  const selectedIndex = getRandomIndex(items);
  const angleStep = 360 / items.length;
  const finalRotation = state[slotKey].rotation + (360 * 6) + (360 - (selectedIndex * angleStep + angleStep / 2));

  wheel.style.transform = `rotate(${finalRotation}deg)`;
  state[slotKey].rotation = finalRotation;
  state[slotKey].selectedIndex = selectedIndex;

  const resultEl = document.getElementById(`result-${slotKey}`);
  resultEl.textContent = items[selectedIndex];

  return items[selectedIndex];
}

function spinAllWheels() {
  const results = {
    world: spinWheel('world'),
    twist: spinWheel('twist'),
    people: spinWheel('people')
  };

  addSpinLog(results);
}

function initializeWheels() {
  Object.keys(wheelData).forEach((slotKey) => {
    const wheel = document.querySelector(`[data-wheel="${slotKey}"]`);
    const initialValue = wheelData[slotKey][0];
    const resultEl = document.getElementById(`result-${slotKey}`);
    resultEl.textContent = initialValue;
    buildWheelLabels(slotKey, wheel);
  });
}

initializeWheels();

document.getElementById('centerSpinBtn').addEventListener('click', () => {
  spinAllWheels();
});

document.getElementById('spinAllBtn').addEventListener('click', () => {
  spinAllWheels();
});

downloadPdfBtn.addEventListener('click', () => {
  downloadSpinLogPdf();
});

teamNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    spinAllWheels();
  }
});

window.downloadSpinLogPdf = downloadSpinLogPdf;
