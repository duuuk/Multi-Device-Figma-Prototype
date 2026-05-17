const socket = io({ transports: ["websocket"] });
let currentAreas = [];
let dragArea = null;
let dragType = null;
let startX, startY, startLeft, startTop, startWidth, startHeight;
let allAvailableDevices = [];
let editorCurrentNodeId = null;

function parseFigmaUrl(url) {
  try {
    const u = new URL(url);
    const pathParts = u.pathname.split('/');
    const fileId = pathParts[2];
    const nodeId = u.searchParams.get('node-id')?.replace(/-/g, ':').replace(/%3A/gi, ':');
    return { fileId, nodeId };
  } catch (e) {
    return { fileId: null, nodeId: null };
  }
}

window.openGlobalAreaEditor = function() {
  allAvailableDevices = Array.from(document.querySelectorAll('.device-row')).map((r, i) => ({
    id: `target-${i}`, name: r.querySelector('.device-name').value
  }));
  
  document.getElementById('editor-frame-url').value = '';
  document.getElementById('editor-figma-preview').src = '';
  currentAreas = [];
  editorCurrentNodeId = null;
  
  renderCanvas(); renderList();
  openModal('modal-areas');
};

// Kept for backward compatibility if old buttons are clicked
window.openAreaEditor = function(row) {
  window.openGlobalAreaEditor();
  const url = row.querySelector('.device-url').value;
  if (url) {
    document.getElementById('editor-frame-url').value = url;
    document.getElementById('btnLoadEditorFrame').click();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const btnLoad = document.getElementById('btnLoadEditorFrame');
  if (btnLoad) {
    btnLoad.addEventListener('click', () => {
      const url = document.getElementById('editor-frame-url').value;
      const { fileId, nodeId } = parseFigmaUrl(url);
      const clientId = document.getElementById('clientId').value;
      
      if (!fileId || !nodeId) {
        alert("Invalid Figma URL. Please ensure it contains a node-id.");
        return;
      }
      
      editorCurrentNodeId = nodeId;
      const embedUrl = `https://embed.figma.com/proto/${fileId}/?node-id=${nodeId}&scaling=scale-down&hide-ui=1&client-id=${clientId}`;
      document.getElementById('editor-figma-preview').src = embedUrl;
      
      // Fetch existing areas from server
      socket.emit("get-config", nodeId, (areas) => {
        currentAreas = areas || [];
        renderCanvas(); renderList();
      });
    });
  }

  const btnAdd = document.getElementById('btnAddArea');
  if (btnAdd) btnAdd.addEventListener('click', () => {
    if (!editorCurrentNodeId) return alert("Please load a Figma screen first!");
    currentAreas.push({
      id: 'area_' + Date.now(), x: 10, y: 10, w: 20, h: 20,
      action: 'jump', target: 'all', frameMappings: []
    });
    renderCanvas(); renderList();
  });

  const btnSave = document.getElementById('btnSaveAreas');
  if (btnSave) btnSave.addEventListener('click', () => {
    if (!editorCurrentNodeId) return alert("No screen loaded!");
    socket.emit("save-config", { nodeId: editorCurrentNodeId, areas: currentAreas });
    const originalText = btnSave.textContent;
    btnSave.textContent = "Saved to Server!";
    setTimeout(() => btnSave.textContent = originalText, 1500);
  });

  const canvas = document.getElementById('editor-canvas');
  if (canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const ev = { target: e.target, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() };
      onMouseDown(ev);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (!dragArea) return;
      const touch = e.touches[0];
      onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });
    window.addEventListener('touchend', onMouseUp);
  }
});

function renderCanvas() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas) return;
  
  // Keep the iframe, remove only the areas
  Array.from(canvas.children).forEach(c => {
    if (c.id !== 'editor-figma-preview') c.remove();
  });

  currentAreas.forEach((area, index) => {
    const el = document.createElement('div');
    el.className = 'tap-area';
    el.dataset.index = index;
    el.style.left = area.x + '%'; el.style.top = area.y + '%';
    el.style.width = area.w + '%'; el.style.height = area.h + '%';
    el.innerHTML = `<div class="resize-handle" data-index="${index}"></div>
                    <div style="pointer-events:none;color:#000;font-size:12px;font-weight:bold;text-align:center;margin-top:4px;">${index + 1}</div>`;
    canvas.appendChild(el);
  });
}

function renderList() {
  const list = document.getElementById('areas-list');
  if (!list) return;
  list.innerHTML = '';

  const selStyle = 'width:100%;padding:8px;border-radius:var(--radius);background:var(--geist-bg);color:var(--geist-foreground);border:1px solid var(--accents-2)';

  const deviceOpts = `<option value="self">This Device (self)</option>` +
    allAvailableDevices.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  currentAreas.forEach((area, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'background:var(--accents-1);padding:12px;border-radius:6px;border:1px solid var(--accents-2)';

    const isJump = area.action === 'jump';

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
            <input type="text" class="mapping-url" data-area="${index}" data-mapping="${mi}" value="${m.frameUrl || ''}" placeholder="Figma frame URL..." style="font-size:13px; ${selStyle}">
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
          <option value="jump" ${area.action==='jump'?'selected':''}>Jump to Target Screen</option>
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
          <label style="margin-bottom:8px">Device → Target Screen</label>
          <p style="font-size:11px;color:var(--accents-4);margin-bottom:10px">When tapped, these devices will instantly jump to these Figma screens.</p>
          ${mappingsHtml}
          <button type="button" class="btn btn-outline" onclick="addMapping(${index})" style="padding:6px 12px;font-size:12px;width:auto">+ Add Device Target</button>
        </div>
      `}
    `;
    list.appendChild(item);
  });

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
