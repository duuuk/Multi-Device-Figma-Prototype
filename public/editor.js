let currentEditingRow = null;
let currentAreas = [];
let dragArea = null;
let dragType = null;
let startX, startY, startLeft, startTop, startWidth, startHeight;
let allAvailableDevices = [];

window.openAreaEditor = function(row) {
  currentEditingRow = row;
  document.getElementById('editor-device-name').textContent = row.querySelector('.device-name').value;

  allAvailableDevices = Array.from(document.querySelectorAll('.device-row')).map((r, i) => ({
    id: `target-${i}`, name: r.querySelector('.device-name').value
  }));

  const res = row.querySelector('.device-resolution').value;
  const ori = row.querySelector('.device-orientation').value;
  let w, h;
  if (res === 'custom') {
    w = parseInt(row.querySelector('.custom-w').value) || 1024;
    h = parseInt(row.querySelector('.custom-h').value) || 768;
  } else { const p = res.split('x'); w = parseInt(p[0]); h = parseInt(p[1]); }
  if (ori === 'portrait') { const t = w; w = h; h = t; }

  document.getElementById('editor-canvas').style.aspectRatio = `${w} / ${h}`;

  try { currentAreas = JSON.parse(row.querySelector('.device-areas').value); }
  catch(e) { currentAreas = []; }

  renderCanvas();
  renderList();
  openModal('modal-areas');
};

function saveAreas() {
  if (currentEditingRow) currentEditingRow.querySelector('.device-areas').value = JSON.stringify(currentAreas);
  closeModals();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnAdd = document.getElementById('btnAddArea');
  if (btnAdd) btnAdd.addEventListener('click', () => {
    currentAreas.push({ id: 'area_' + Date.now(), x: 10, y: 10, w: 20, h: 20,
      action: 'next', target: 'all', targetFrameUrl: '', selfFrameUrl: '' });
    renderCanvas(); renderList();
  });

  const btnSave = document.getElementById('btnSaveAreas');
  if (btnSave) btnSave.addEventListener('click', saveAreas);

  const canvas = document.getElementById('editor-canvas');
  if (canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
});

function renderCanvas() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  currentAreas.forEach((area, index) => {
    const div = document.createElement('div');
    div.className = 'tap-area';
    div.style.left = area.x + '%'; div.style.top = area.y + '%';
    div.style.width = area.w + '%'; div.style.height = area.h + '%';
    div.dataset.index = index;

    const targetName = area.target === 'all' ? 'All' :
      (allAvailableDevices.find(d => d.id === area.target)?.name || area.target);
    div.textContent = area.action === 'jump' ? `JUMP → ${targetName}` : `${area.action.toUpperCase()} → ${targetName}`;

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.dataset.index = index;
    div.appendChild(handle);
    canvas.appendChild(div);
  });
}

function renderList() {
  const list = document.getElementById('areas-list');
  if (!list) return;
  list.innerHTML = '';
  currentAreas.forEach((area, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'background:var(--accents-1);padding:12px;border-radius:6px;border:1px solid var(--accents-2)';
    const isJump = area.action === 'jump';
    const selStyle = 'width:100%;padding:8px;border-radius:var(--radius);background:var(--geist-bg);color:var(--geist-foreground);border:1px solid var(--accents-2)';

    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <strong style="color:var(--geist-foreground)">Area ${index + 1}</strong>
        <button type="button" class="btn-remove" onclick="removeArea(${index})">Delete</button>
      </div>
      <div class="form-group" style="margin-bottom:8px">
        <label>Target Device</label>
        <select class="area-target" data-index="${index}" style="${selStyle}">
          <option value="all" ${area.target==='all'?'selected':''}>All Devices</option>
          ${allAvailableDevices.map(d => `<option value="${d.id}" ${area.target===d.id?'selected':''}>${d.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin-bottom:8px">
        <label>Action</label>
        <select class="area-action" data-index="${index}" style="${selStyle}">
          <option value="next" ${area.action==='next'?'selected':''}>Next Frame (→)</option>
          <option value="prev" ${area.action==='prev'?'selected':''}>Prev Frame (←)</option>
          <option value="jump" ${area.action==='jump'?'selected':''}>Jump to Frame (instant)</option>
        </select>
      </div>
      <div class="jump-fields" style="display:${isJump?'block':'none'}">
        <div class="form-group" style="margin-bottom:8px">
          <label>Target Device → Frame URL</label>
          <input type="text" class="area-target-frame" data-index="${index}" value="${area.targetFrameUrl||''}" placeholder="Figma URL for the target device...">
          <p style="font-size:11px;color:var(--accents-4);margin-top:4px">The frame the target device will show (pre-loaded, instant switch)</p>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label>This Device → Frame URL <span style="color:var(--accents-4);font-weight:400">(optional)</span></label>
          <input type="text" class="area-self-frame" data-index="${index}" value="${area.selfFrameUrl||''}" placeholder="Figma URL for this device...">
          <p style="font-size:11px;color:var(--accents-4);margin-top:4px">Leave empty to keep this device unchanged</p>
        </div>
      </div>`;
    list.appendChild(item);
  });

  list.querySelectorAll('.area-action').forEach(s => s.addEventListener('change', e => {
    currentAreas[e.target.dataset.index].action = e.target.value;
    renderList(); renderCanvas();
  }));
  list.querySelectorAll('.area-target').forEach(s => s.addEventListener('change', e => {
    currentAreas[e.target.dataset.index].target = e.target.value; renderCanvas();
  }));
  list.querySelectorAll('.area-target-frame').forEach(s => s.addEventListener('input', e => {
    currentAreas[e.target.dataset.index].targetFrameUrl = e.target.value;
  }));
  list.querySelectorAll('.area-self-frame').forEach(s => s.addEventListener('input', e => {
    currentAreas[e.target.dataset.index].selfFrameUrl = e.target.value;
  }));
}

window.removeArea = function(i) { currentAreas.splice(i, 1); renderCanvas(); renderList(); };

function onMouseDown(e) {
  if (e.target.classList.contains('resize-handle')) { dragType = 'resize'; dragArea = currentAreas[e.target.dataset.index]; }
  else if (e.target.classList.contains('tap-area')) { dragType = 'move'; dragArea = currentAreas[e.target.dataset.index]; }
  else return;
  startX = e.clientX; startY = e.clientY;
  startLeft = dragArea.x; startTop = dragArea.y; startWidth = dragArea.w; startHeight = dragArea.h;
  e.preventDefault();
}

function onMouseMove(e) {
  if (!dragArea) return;
  const rect = document.getElementById('editor-canvas').getBoundingClientRect();
  const dx = ((e.clientX - startX) / rect.width) * 100;
  const dy = ((e.clientY - startY) / rect.height) * 100;
  if (dragType === 'move') {
    dragArea.x = Math.max(0, Math.min(100 - dragArea.w, startLeft + dx));
    dragArea.y = Math.max(0, Math.min(100 - dragArea.h, startTop + dy));
  } else {
    dragArea.w = Math.max(5, Math.min(100 - dragArea.x, startWidth + dx));
    dragArea.h = Math.max(5, Math.min(100 - dragArea.y, startHeight + dy));
  }
  renderCanvas();
}

function onMouseUp() { dragArea = null; dragType = null; }
