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

  try { currentAreas = JSON.parse(row.querySelector('.device-areas').value); } catch(e) { currentAreas = []; }
  // Migrate old format: convert target/targetFrameUrl/selfFrameUrl to frameMappings
  currentAreas.forEach(a => {
    if (a.action === 'jump' && !a.frameMappings) {
      a.frameMappings = [];
      if (a.targetFrameUrl) a.frameMappings.push({ device: a.target || 'target-0', frameUrl: a.targetFrameUrl });
      if (a.selfFrameUrl) a.frameMappings.push({ device: 'self', frameUrl: a.selfFrameUrl });
      delete a.target; delete a.targetFrameUrl; delete a.selfFrameUrl;
    }
  });

  renderCanvas(); renderList();
  openModal('modal-areas');
};

function saveAreas() {
  if (currentEditingRow) currentEditingRow.querySelector('.device-areas').value = JSON.stringify(currentAreas);
  closeModals();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnAdd = document.getElementById('btnAddArea');
  if (btnAdd) btnAdd.addEventListener('click', () => {
    currentAreas.push({
      id: 'area_' + Date.now(), x: 10, y: 10, w: 20, h: 20,
      action: 'next', target: 'all', frameMappings: []
    });
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

    if (area.action === 'jump') {
      const count = (area.frameMappings || []).length;
      div.textContent = `JUMP (${count} device${count !== 1 ? 's' : ''})`;
    } else {
      const tn = area.target === 'all' ? 'All' : (allAvailableDevices.find(d => d.id === area.target)?.name || area.target);
      div.textContent = `${area.action.toUpperCase()} → ${tn}`;
    }

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

  const selStyle = 'width:100%;padding:8px;border-radius:var(--radius);background:var(--geist-bg);color:var(--geist-foreground);border:1px solid var(--accents-2)';

  // Build device options including "This Device (self)"
  const deviceOpts = `<option value="self">This Device (self)</option>` +
    allAvailableDevices.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  currentAreas.forEach((area, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'background:var(--accents-1);padding:12px;border-radius:6px;border:1px solid var(--accents-2)';

    const isJump = area.action === 'jump';

    // Build mappings HTML
    let mappingsHtml = '';
    if (isJump) {
      const mappings = area.frameMappings || [];
      mappingsHtml = mappings.map((m, mi) => `
        <div style="display:flex;gap:8px;align-items:start;margin-bottom:8px;padding:10px;background:var(--geist-bg);border:1px solid var(--accents-2);border-radius:4px">
          <div style="flex:0 0 140px">
            <select class="mapping-device" data-area="${index}" data-mapping="${mi}" style="${selStyle};font-size:13px">
              ${deviceOpts.replace(`value="${m.device}"`, `value="${m.device}" selected`)}
            </select>
          </div>
          <div style="flex:1">
            <input type="text" class="mapping-url" data-area="${index}" data-mapping="${mi}" value="${m.frameUrl || ''}" placeholder="Figma frame URL..." style="font-size:13px">
          </div>
          <button type="button" class="btn-remove" onclick="removeMapping(${index},${mi})" style="flex:0 0 auto;padding:4px 8px">✕</button>
        </div>
      `).join('');
    }

    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <strong style="color:var(--geist-foreground)">Area ${index + 1}</strong>
        <button type="button" class="btn-remove" onclick="removeArea(${index})">Delete</button>
      </div>
      <div class="form-group" style="margin-bottom:8px">
        <label>Action</label>
        <select class="area-action" data-index="${index}" style="${selStyle}">
          <option value="next" ${area.action==='next'?'selected':''}>Next Frame (→)</option>
          <option value="prev" ${area.action==='prev'?'selected':''}>Prev Frame (←)</option>
          <option value="jump" ${area.action==='jump'?'selected':''}>Jump to Frame</option>
        </select>
      </div>
      ${!isJump ? `
        <div class="form-group" style="margin-bottom:0">
          <label>Target Device</label>
          <select class="area-target" data-index="${index}" style="${selStyle}">
            <option value="all" ${area.target==='all'?'selected':''}>All Devices</option>
            ${allAvailableDevices.map(d => `<option value="${d.id}" ${area.target===d.id?'selected':''}>${d.name}</option>`).join('')}
          </select>
        </div>
      ` : `
        <div style="margin-bottom:8px">
          <label style="margin-bottom:8px">Device → Frame Mappings</label>
          <p style="font-size:11px;color:var(--accents-4);margin-bottom:10px">Each device listed will instantly jump to its assigned frame. Pre-loaded, no loading screen.</p>
          ${mappingsHtml}
          <button type="button" class="btn btn-outline" onclick="addMapping(${index})" style="padding:6px 12px;font-size:12px;width:auto">+ Add Device</button>
        </div>
      `}
    `;
    list.appendChild(item);
  });

  // Bind events
  list.querySelectorAll('.area-action').forEach(s => s.addEventListener('change', e => {
    const idx = e.target.dataset.index;
    currentAreas[idx].action = e.target.value;
    if (e.target.value === 'jump' && !currentAreas[idx].frameMappings) currentAreas[idx].frameMappings = [];
    renderList(); renderCanvas();
  }));
  list.querySelectorAll('.area-target').forEach(s => s.addEventListener('change', e => {
    currentAreas[e.target.dataset.index].target = e.target.value; renderCanvas();
  }));
  list.querySelectorAll('.mapping-device').forEach(s => s.addEventListener('change', e => {
    const ai = e.target.dataset.area, mi = e.target.dataset.mapping;
    currentAreas[ai].frameMappings[mi].device = e.target.value; renderCanvas();
  }));
  list.querySelectorAll('.mapping-url').forEach(s => s.addEventListener('input', e => {
    const ai = e.target.dataset.area, mi = e.target.dataset.mapping;
    currentAreas[ai].frameMappings[mi].frameUrl = e.target.value;
  }));
}

window.addMapping = function(areaIndex) {
  if (!currentAreas[areaIndex].frameMappings) currentAreas[areaIndex].frameMappings = [];
  currentAreas[areaIndex].frameMappings.push({ device: 'self', frameUrl: '' });
  renderList(); renderCanvas();
};

window.removeMapping = function(areaIndex, mappingIndex) {
  currentAreas[areaIndex].frameMappings.splice(mappingIndex, 1);
  renderList(); renderCanvas();
};

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
