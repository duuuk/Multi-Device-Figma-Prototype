let currentEditingRow = null;
let currentAreas = [];
let dragArea = null;
let dragType = null; // 'move' or 'resize'
let startX, startY, startLeft, startTop, startWidth, startHeight;
let allAvailableDevices = [];

window.openAreaEditor = function(row) {
  currentEditingRow = row;
  const name = row.querySelector('.device-name').value;
  document.getElementById('editor-device-name').textContent = name;
  
  allAvailableDevices = Array.from(document.querySelectorAll('.device-row')).map((r, i) => {
      return { id: `target-${i}`, name: r.querySelector('.device-name').value };
  });
  
  const res = row.querySelector('.device-resolution').value;
  const ori = row.querySelector('.device-orientation').value;
  let w, h;
  if (res === 'custom') {
     w = parseInt(row.querySelector('.custom-w').value) || 1024;
     h = parseInt(row.querySelector('.custom-h').value) || 768;
  } else {
     const parts = res.split('x');
     w = parseInt(parts[0]);
     h = parseInt(parts[1]);
  }
  if (ori === 'portrait') {
     const temp = w; w = h; h = temp;
  }
  
  const canvas = document.getElementById('editor-canvas');
  canvas.style.aspectRatio = `${w} / ${h}`;
  
  const areasStr = row.querySelector('.device-areas').value;
  try {
     currentAreas = JSON.parse(areasStr);
  } catch(e) {
     currentAreas = [];
  }
  
  renderCanvas();
  renderList();
  openModal('modal-areas');
};

function saveAreas() {
  if (currentEditingRow) {
     currentEditingRow.querySelector('.device-areas').value = JSON.stringify(currentAreas);
  }
  closeModals();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnAdd = document.getElementById('btnAddArea');
  if(btnAdd) {
    btnAdd.addEventListener('click', () => {
      currentAreas.push({
        id: 'area_' + Date.now(),
        x: 10, y: 10, w: 20, h: 20,
        action: 'next',
        target: 'all',
        url: ''
      });
      renderCanvas();
      renderList();
    });
  }
  
  const btnSave = document.getElementById('btnSaveAreas');
  if(btnSave) {
    btnSave.addEventListener('click', saveAreas);
  }
  
  const canvas = document.getElementById('editor-canvas');
  if(canvas) {
     canvas.addEventListener('mousedown', onMouseDown);
     document.addEventListener('mousemove', onMouseMove);
     document.addEventListener('mouseup', onMouseUp);
  }
});

function renderCanvas() {
  const canvas = document.getElementById('editor-canvas');
  if(!canvas) return;
  canvas.innerHTML = '';
  currentAreas.forEach((area, index) => {
     const div = document.createElement('div');
     div.className = 'tap-area';
     div.style.left = area.x + '%';
     div.style.top = area.y + '%';
     div.style.width = area.w + '%';
     div.style.height = area.h + '%';
     div.dataset.index = index;
     div.textContent = area.action.toUpperCase();
     
     const handle = document.createElement('div');
     handle.className = 'resize-handle';
     handle.dataset.index = index;
     div.appendChild(handle);
     
     canvas.appendChild(div);
  });
}

function renderList() {
  const list = document.getElementById('areas-list');
  if(!list) return;
  list.innerHTML = '';
  currentAreas.forEach((area, index) => {
    const item = document.createElement('div');
    item.style.background = 'var(--accents-1)';
    item.style.padding = '12px';
    item.style.borderRadius = '6px';
    item.style.border = '1px solid var(--accents-2)';
    
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong style="color: var(--geist-foreground);">Area ${index + 1}</strong>
        <button type="button" class="btn-remove" onclick="removeArea(${index})">Delete</button>
      </div>
      <div class="form-group" style="margin-bottom: 8px;">
        <label>Target Device</label>
        <select class="area-target" data-index="${index}" style="width:100%; padding:8px; border-radius: var(--radius); background:var(--geist-bg); color:var(--geist-foreground); border:1px solid var(--accents-2);">
           <option value="all" ${area.target==='all'?'selected':''}>All Devices</option>
           ${allAvailableDevices.map(d => `<option value="${d.id}" ${area.target===d.id?'selected':''}>${d.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin-bottom: 8px;">
        <label>Action</label>
        <select class="area-action" data-index="${index}" style="width:100%; padding:8px; border-radius: var(--radius); background:var(--geist-bg); color:var(--geist-foreground); border:1px solid var(--accents-2);">
           <option value="next" ${area.action==='next'?'selected':''}>Next</option>
           <option value="prev" ${area.action==='prev'?'selected':''}>Prev</option>
           <option value="jump" ${area.action==='jump'?'selected':''}>Jump to URL</option>
        </select>
      </div>
      <div class="form-group url-group" style="margin-bottom: 0; display: ${area.action==='jump'?'block':'none'}">
        <label>Target URL</label>
        <input type="text" class="area-url" data-index="${index}" value="${area.url || ''}" placeholder="https://...">
      </div>
    `;
    list.appendChild(item);
  });
  
  list.querySelectorAll('.area-action').forEach(sel => {
    sel.addEventListener('change', (e) => {
       const idx = e.target.dataset.index;
       currentAreas[idx].action = e.target.value;
       renderList();
       renderCanvas();
    });
  });
  
  list.querySelectorAll('.area-target').forEach(sel => {
    sel.addEventListener('change', (e) => {
       const idx = e.target.dataset.index;
       currentAreas[idx].target = e.target.value;
    });
  });
  
  list.querySelectorAll('.area-url').forEach(inp => {
    inp.addEventListener('input', (e) => {
       const idx = e.target.dataset.index;
       currentAreas[idx].url = e.target.value;
    });
  });
}

window.removeArea = function(index) {
  currentAreas.splice(index, 1);
  renderCanvas();
  renderList();
};

function onMouseDown(e) {
  if (e.target.classList.contains('resize-handle')) {
    dragType = 'resize';
    dragArea = currentAreas[e.target.dataset.index];
  } else if (e.target.classList.contains('tap-area')) {
    dragType = 'move';
    dragArea = currentAreas[e.target.dataset.index];
  } else {
    return;
  }
  
  const canvas = document.getElementById('editor-canvas');
  const rect = canvas.getBoundingClientRect();
  
  startX = e.clientX;
  startY = e.clientY;
  startLeft = dragArea.x;
  startTop = dragArea.y;
  startWidth = dragArea.w;
  startHeight = dragArea.h;
  
  e.preventDefault();
}

function onMouseMove(e) {
  if (!dragArea) return;
  
  const canvas = document.getElementById('editor-canvas');
  const rect = canvas.getBoundingClientRect();
  
  const dx = ((e.clientX - startX) / rect.width) * 100;
  const dy = ((e.clientY - startY) / rect.height) * 100;
  
  if (dragType === 'move') {
    dragArea.x = Math.max(0, Math.min(100 - dragArea.w, startLeft + dx));
    dragArea.y = Math.max(0, Math.min(100 - dragArea.h, startTop + dy));
  } else if (dragType === 'resize') {
    dragArea.w = Math.max(5, Math.min(100 - dragArea.x, startWidth + dx));
    dragArea.h = Math.max(5, Math.min(100 - dragArea.y, startHeight + dy));
  }
  
  renderCanvas();
}

function onMouseUp(e) {
  dragArea = null;
  dragType = null;
}
