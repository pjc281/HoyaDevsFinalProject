// --- State ---
let classes = [];
let students = [];
let attendance = [];

let activeClassId = null;
let attendanceBuffer = {}; // { studentId: 'Present' | 'Absent' | 'Late' }
let historyCurrentDate = new Date();
let historySelectedDate = null;

// --- DOM Elements ---
const views = {
  dashboard: document.getElementById('view-dashboard'),
  class: document.getElementById('view-class'),
  takeAttendance: document.getElementById('view-take-attendance'),
  history: document.getElementById('view-history')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Re-fetch views in case they weren't ready
  views.dashboard = document.getElementById('view-dashboard');
  views.class = document.getElementById('view-class');
  views.takeAttendance = document.getElementById('view-take-attendance');
  views.history = document.getElementById('view-history');

  setupEventListeners();
  renderDashboard();
});

function setupEventListeners() {
  // Dashboard
  document.getElementById('add-class-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-class-name');
    if (!input.value.trim()) return;
    
    const newClass = { id: Date.now(), name: input.value };
    classes.push(newClass);
    input.value = '';
    renderDashboard();
  });

  // Class Detail
  document.getElementById('back-to-dashboard').addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btn-take-attendance').addEventListener('click', startAttendance);
  document.getElementById('btn-view-history').addEventListener('click', () => {
    renderHistory();
    switchView('history');
  });

  document.getElementById('add-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('new-student-name');
    const idInput = document.getElementById('new-student-id');
    const emailInput = document.getElementById('new-student-email');

    if (!nameInput.value.trim()) return;

    const student = {
      id: Date.now(),
      classId: activeClassId,
      name: nameInput.value,
      studentId: idInput.value,
      email: emailInput.value
    };
    students.push(student);
    
    nameInput.value = '';
    idInput.value = '';
    emailInput.value = '';
    renderClassDetail();
  });

  // Take Attendance
  document.getElementById('cancel-attendance').addEventListener('click', () => switchView('class'));
  document.getElementById('save-attendance').addEventListener('click', saveAttendance);

  // History
  document.getElementById('back-from-history').addEventListener('click', () => switchView('class'));
  
  document.getElementById('prev-month').addEventListener('click', () => {
    historyCurrentDate.setMonth(historyCurrentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    historyCurrentDate.setMonth(historyCurrentDate.getMonth() + 1);
    renderCalendar();
  });
}

// --- Navigation ---
function switchView(viewName) {
  Object.values(views).forEach(el => el.style.display = 'none');
  views[viewName].style.display = 'block';
  
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'class') renderClassDetail();
}

function openClass(id) {
  activeClassId = id;
  switchView('class');
}

// --- Render Functions ---

function renderDashboard() {
  const grid = document.getElementById('class-grid');
  const emptyMsg = document.getElementById('no-classes-msg');
  
  grid.innerHTML = '';
  
  if (classes.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    classes.forEach(c => {
      const studentCount = students.filter(s => s.classId === c.id).length;
      const card = document.createElement('div');
      card.className = 'card class-card';
      card.innerHTML = `<h3>${c.name}</h3><p>${studentCount} Students</p>`;
      card.onclick = () => openClass(c.id);
      grid.appendChild(card);
    });
  }
}

function renderClassDetail() {
  const activeClass = classes.find(c => c.id === activeClassId);
  if (!activeClass) return;

  document.getElementById('active-class-name').textContent = activeClass.name;
  
  const rosterContainer = document.getElementById('roster-container');
  const classStudents = students.filter(s => s.classId === activeClassId);

  if (classStudents.length === 0) {
    rosterContainer.innerHTML = '<p>No students enrolled.</p>';
  } else {
    let html = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>NetID</th><th>Email</th></tr></thead>
        <tbody>
    `;
    classStudents.forEach(s => {
      html += `
        <tr>
          <td>${s.name}</td>
          <td>${s.studentId || '-'}</td>
          <td>${s.email || '-'}</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    rosterContainer.innerHTML = html;
  }
}

function startAttendance() {
  const activeClass = classes.find(c => c.id === activeClassId);
  document.getElementById('attendance-class-name').textContent = activeClass.name;
  
  // Set date to today
  const dateInput = document.getElementById('attendance-date');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  dateInput.value = `${year}-${month}-${day}`;

  // Initialize buffer
  attendanceBuffer = {};
  const classStudents = students.filter(s => s.classId === activeClassId);
  classStudents.forEach(s => attendanceBuffer[s.id] = 'Present');

  renderAttendanceList();
  switchView('takeAttendance');
}

function renderAttendanceList() {
  const list = document.getElementById('attendance-list');
  list.innerHTML = '';
  
  const classStudents = students.filter(s => s.classId === activeClassId);
  
  classStudents.forEach(student => {
    const row = document.createElement('div');
    row.className = 'attendance-row';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'student-name';
    nameSpan.textContent = student.name;
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'status-buttons';
    
    ['Present', 'Absent', 'Late'].forEach(status => {
      const btn = document.createElement('button');
      const isSelected = attendanceBuffer[student.id] === status;
      btn.className = `status-btn ${isSelected ? status.toLowerCase() : ''}`;
      btn.textContent = status;
      btn.onclick = () => {
        attendanceBuffer[student.id] = status;
        renderAttendanceList(); // Re-render to update styles
      };
      btnGroup.appendChild(btn);
    });
    
    row.appendChild(nameSpan);
    row.appendChild(btnGroup);
    list.appendChild(row);
  });
}

function saveAttendance() {
  const date = document.getElementById('attendance-date').value;
  
  // Remove existing
  attendance = attendance.filter(a => !(a.classId === activeClassId && a.date === date));
  
  const record = {
    id: Date.now(),
    classId: activeClassId,
    date: date,
    records: { ...attendanceBuffer }
  };
  
  attendance.push(record);
  switchView('class');
}

function renderHistory() {
  const activeClass = classes.find(c => c.id === activeClassId);
  document.getElementById('history-class-name').textContent = activeClass.name;
  
  // Reset to current month when opening history
  historyCurrentDate = new Date();
  historySelectedDate = null;
  
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('calendar-month-year');
  const details = document.getElementById('history-details');
  
  grid.innerHTML = '';
  
  const year = historyCurrentDate.getFullYear();
  const month = historyCurrentDate.getMonth();
  
  // Update Header
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;
  
  // Calculate Days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Render Empty Slots
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }
  
  // Render Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = attendance.find(a => a.classId === activeClassId && a.date === dateStr);
    
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = d;
    
    if (record) {
      cell.classList.add('has-record');
      cell.onclick = () => {
        historySelectedDate = dateStr;
        renderCalendar(); // Re-render to update selection
      };
    }
    
    if (historySelectedDate === dateStr) {
      cell.classList.add('selected');
    }
    
    grid.appendChild(cell);
  }

  // Render Details Section
  if (historySelectedDate) {
    renderHistoryDetails(historySelectedDate);
  } else {
    details.innerHTML = '<p class="empty-state">Select a highlighted date to view details.</p>';
  }
}

function renderHistoryDetails(dateStr) {
  const details = document.getElementById('history-details');
  const record = attendance.find(a => a.classId === activeClassId && a.date === dateStr);
  const classStudents = students.filter(s => s.classId === activeClassId);

  if (!record) return;
  
  const pCount = Object.values(record.records).filter(v => v === 'Present').length;
  const aCount = Object.values(record.records).filter(v => v === 'Absent').length;
  const lCount = Object.values(record.records).filter(v => v === 'Late').length;

  let html = `
    <div class="history-card">
      <div class="history-header">
        <h4>${record.date}</h4>
        <span>P: ${pCount} | A: ${aCount} | L: ${lCount}</span>
      </div>
      <table class="mini-table"><tbody>
  `;
  
  classStudents.forEach(s => {
    const status = record.records[s.id] || 'N/A';
    html += `
      <tr>
        <td>${s.name}</td>
        <td class="status-text ${status.toLowerCase()}">${status}</td>
      </tr>
    `;
  });
  
  html += '</tbody></table></div>';
  details.innerHTML = html;
}