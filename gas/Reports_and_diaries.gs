  const CONFIGS = [
    ["training_diary_advanced_adults", "adult", "advanced", "advanced_adults"],
    ["training_diary_advanced_underage", "underage", "advanced", "advanced_underage"],
    ["training_diary_basic_adults", "adult", "basic", "basic_adults"],
    ["training_diary_basic_underage", "underage", "basic", "basic_underage"],
    ["training_diary_free_sparring_adults", "adult", "free/sparring", "free_sparring_adults"],
    ["training_diary_free_sparring_underage", "underage", "free/sparring", "free_sparring_underage"],
    ["training_diary_fitness_adults", "adult", "fittness", "fitness_adults"],
    ["training_diary_fitness_underage", "underage", "fittness", "fitness_underage"],
    ["training_diary_camp_adults", "adult", "camp", "camp_adults"],
    ["training_diary_camp_underage", "underage", "camp", "camp_underage"]
  ];

const SheetsCache = {
  regData: null,

  loadRegistrationData() {
    if (this.regData) return this.regData;

    const reg = getSheetByName('trainee_registrations');
    const values = reg.getRange(2, 2, reg.getLastRow() - 1, 10).getValues();

    this.regData = values;
    return values;
  }
};

function clearAllTrainingDiaries() {
  CONFIGS.forEach(cfg => {
    try {
      const diary = getSheetByName(cfg[0]);
      diary.getRange("A10:ND200").clearContent();
    } catch (e) {
      Logger.log("ERROR clearing " + cfg[0] + ": " + e);
    }
  });  
}

function fillAllTrainingDiaries() {
  CONFIGS.forEach(cfg => {
    try {
      fillTrainingDiary(cfg[0], cfg[1], cfg[2]);
      //createTrainingDiaryCharts(cfg[0]);
    } catch (e) {
      Logger.log("ERROR in " + cfg[0] + ": " + e);
    }
  });
}

function fillAllTrainingDiariesAndDashboard() {
  fillAllTrainingDiaries();          // täyttää kaikki diaryt
  collectDiaryDataToDashboard();     // kerää dashboard-data
  createDashboardCharts();           // piirtää graafit
}

function fillTrainingDiary(sheetName, ageGroup, sessionType) {
  const diary = getSheetByName(sheetName);

  // --- NOPEA CACHE-LUKU ---
  const regValues = SheetsCache.loadRegistrationData();
  // B = first, C = last, D = age_group, F = session_type, G = camp_id, H = date, K = realized

  const isCamp = sessionType === 'camp';

  // --- 2. SUODATUS ---
  const rows = regValues.filter(r => {
    const [first, last, age, , sessType, campId, date, , , realized] = r;

    if (!realized) return false;
    if (age !== ageGroup) return false;

    if (!isCamp) {
      return sessType === sessionType;
    }

    // CAMP: session_type must contain "-camp"
    return typeof sessType === 'string' && sessType.toLowerCase().includes('camp');
  });

  if (rows.length === 0) {
    Logger.log(`DEBUG: Ei rivejä sheetille ${sheetName} (age=${ageGroup}, session=${sessionType})`);    
    diary.getRange("A10:ND200").clearContent();
    return;
  }

  // --- 3. MUODOSTA HARRASTAJALISTA ---
  const names = [...new Set(rows.map(r => r[0] + " " + r[1]))].sort();
  Logger.log(`DEBUG: ${sheetName} — harrastajia: ${names.length}`);

  // --- 4. MUODOSTA TREENIKERRAT ---
  // Camp: jokainen sessio on oma treenikerta, vaikka päivämäärä sama
  let sessions = [];

  rows.forEach(r => {
    const sessType = r[4];
    const date = r[6];

    if (!date) return;

    if (isCamp) {
      sessions.push({
        date,
        key: date + " | " + sessType // erottaa saman päivän eri sessiot
      });
    } else {
      sessions.push({
        date,
        key: date.toISOString().slice(0, 10)
      });
    }
  });

  // Uniikit sessiot
  const uniqueSessions = [
    ...new Map(sessions.map(s => [s.key, s])).values()
  ].sort((a, b) => a.date - b.date);

  Logger.log(`DEBUG: ${sheetName} — treenikertoja: ${uniqueSessions.length}`);

  const sessionDates = uniqueSessions.map(s => s.date);

  // --- 5. TÄYTÄ PÄIVÄT JA KUUKAUDET (RIVIT 6 JA 7) ---
  const dayRow = [null, null, null];
  const monthRow = [null, null, null];

  sessionDates.forEach(d => {
    dayRow.push(d.getDate());
    monthRow.push(d.getMonth() + 1);
  });

  diary.getRange(6, 4, 1, dayRow.length - 3).setValues([dayRow.slice(3)]);
  diary.getRange(7, 4, 1, monthRow.length - 3).setValues([monthRow.slice(3)]);

  // --- 6. TÄYTÄ HARRASTAJIEN NIMET (A10:A) ---
  const nameStartRow = 10;
  const nameRange = diary.getRange(nameStartRow, 1, names.length, 1);
  nameRange.setValues(names.map(n => [n]));

  // --- 7. RAKENNA X-MERKINNÄT ---
  const matrix = names.map(() => Array(uniqueSessions.length).fill(""));

  rows.forEach(r => {
    const fullName = r[0] + " " + r[1];
    const date = r[6];
    const sessType = r[4];

    const nameIndex = names.indexOf(fullName);
    if (nameIndex === -1) return;

    const key = isCamp
      ? date + " | " + sessType
      : date.toISOString().slice(0, 10);

    const sessionIndex = uniqueSessions.findIndex(s => s.key === key);
    if (sessionIndex !== -1) {
      matrix[nameIndex][sessionIndex] = "X";
    }
  });

  // --- 8. KIRJOITA X-MERKINNÄT (D10:...) ---
  diary.getRange(nameStartRow, 4, matrix.length, matrix[0].length).setValues(matrix);

  // --- 9. C-SARAKKEEN LASKENTA (osallistumismäärä per harrastaja) ---
  const counts = matrix.map(row => {
    const c = row.filter(x => x === "X").length;
    return c > 0 ? c : "";
  });

  diary.getRange(nameStartRow, 3, counts.length, 1).setValues(counts.map(c => [c]));

  // --- 10. B4 ja B5 ---
  diary.getRange("B4").setValue(names.length);
  diary.getRange("B5").setValue(uniqueSessions.length);

  // --- 11. D8:ND8 (rastien kokonaismäärä per sarake) ---
  const colTotals = [];
  for (let col = 0; col < uniqueSessions.length; col++) {
    let total = 0;
    for (let row = 0; row < matrix.length; row++) {
      if (matrix[row][col] === "X") total++;
    }
    colTotals.push(total > 0 ? total : "");
  }

  diary.getRange(8, 4, 1, colTotals.length).setValues([colTotals]);
}

function debugTrainee(fullName) {
  const data = SheetsCache.loadRegistrationData();
  const matches = data.filter(r => (r[0] + " " + r[1]) === fullName);

  if (matches.length === 0) {
    Logger.log("Ei löytynyt trainee_registrations -välilehdeltä: " + fullName);
    return;
  }

  matches.forEach((r, i) => {
    Logger.log(
      `Match ${i+1}:
       first: ${r[0]}
       last: ${r[1]}
       age_group: ${r[2]}
       session_type: ${r[4]}
       camp_id: ${r[5]}
       date: ${r[6]}
       realized: ${r[9]}`
    );
  });
}

function debugSession(dateString, sessionType) {
  const data = SheetsCache.loadRegistrationData();
  const targetDate = new Date(dateString);

  const matches = data.filter(r => {
    const d = r[6];
    if (!d) return false;
    return d.getFullYear() === targetDate.getFullYear() &&
           d.getMonth() === targetDate.getMonth() &&
           d.getDate() === targetDate.getDate() &&
           r[4] === sessionType;
  });

  if (matches.length === 0) {
    Logger.log(`Ei treenikertoja päivälle ${dateString} session_type: ${sessionType}`);
    return;
  }

  Logger.log(`Löytyi ${matches.length} treenimerkintää:`);
  matches.forEach(r => {
    Logger.log(
      `${r[0]} ${r[1]} | age: ${r[2]} | camp_id: ${r[5]} | realized: ${r[9]}`
    );
  });
}

function createTrainingDiaryCharts(sheetName) {
  const sheet = getSheetByName(sheetName);

  // Selvitä sarakkeiden määrä (päivien määrä)
  const lastCol = sheet.getLastColumn();
  if (lastCol < 4) return; // ei dataa

  // Päivä- ja kuukausirivit
  const days = sheet.getRange(6, 4, 1, lastCol - 3).getValues()[0];
  const months = sheet.getRange(7, 4, 1, lastCol - 3).getValues()[0];

  // Rastien määrä per päivä (D8:…)
  const totals = sheet.getRange(8, 4, 1, lastCol - 3).getValues()[0];

  // Poista vanhat graafit
  const charts = sheet.getCharts();
  charts.forEach(c => sheet.removeChart(c));

  // --- 1) Harjoituskerrat per päivä ---
  const chart1 = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange(6, 4, 3, lastCol - 3)) // päivät, kuukaudet, rastit
    .setPosition(2, lastCol + 2, 0, 0)
    .setOption('title', 'Harjoituskerrat per päivä')
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: 'Päivä' })
    .setOption('vAxis', { title: 'Kerrat' })
    .build();

  sheet.insertChart(chart1);

  // --- 2) Osallistujamäärät per päivä ---
  // Lasketaan osallistujat per päivä (X-määrät sarakkeittain)
  const nameRows = sheet.getRange(10, 4, sheet.getLastRow() - 9, lastCol - 3).getValues();
  const participantCounts = [];

  for (let col = 0; col < lastCol - 3; col++) {
    let count = 0;
    for (let row = 0; row < nameRows.length; row++) {
      if (nameRows[row][col] === "X") count++;
    }
    participantCounts.push(count);
  }

  // Kirjoitetaan osallistujamäärät apuriville (rivi 9)
  sheet.getRange(9, 4, 1, participantCounts.length).setValues([participantCounts]);

  const chart2 = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sheet.getRange(6, 4, 4, lastCol - 3)) // päivät, kuukaudet, rastit, osallistujat
    .setPosition(20, lastCol + 2, 0, 0)
    .setOption('title', 'Osallistujamäärät per päivä')
    .setOption('legend', { position: 'bottom' })
    .setOption('hAxis', { title: 'Päivä' })
    .setOption('vAxis', { title: 'Osallistujat' })
    .build();

  sheet.insertChart(chart2);
}

function collectDiaryDataToDashboard() {
  const dashboard = getSheetByName("training_dashboard");

  // tyhjennetään vanha data (jätetään otsikko)
  if (dashboard.getLastRow() > 1) {
    dashboard.getRange(2, 1, dashboard.getLastRow() - 1, 4).clearContent();
  }

  let output = [];

  CONFIGS.forEach(cfg => {
    const sheet = getSheetByName(cfg[0]);
    if (!sheet) {
      Logger.log(`Dashboard: välilehteä ${cfg[0]} ei löydy — ohitetaan.`);
      return;
    }

    const lastCol = sheet.getLastColumn();
    if (lastCol < 4) {
      Logger.log(`Dashboard: ${cfg[0]} ei sisällä treenipäiviä — ohitetaan.`);
      return;
    }

    const days = sheet.getRange(6, 4, 1, lastCol - 3).getValues()[0];
    const months = sheet.getRange(7, 4, 1, lastCol - 3).getValues()[0];
    const sessions = sheet.getRange(8, 4, 1, lastCol - 3).getValues()[0];

    // osallistujat lasketaan riviltä 10 alaspäin
    const dataRowCount = sheet.getLastRow() - 9;
    if (dataRowCount < 1) {
      Logger.log(`Dashboard: ${cfg[0]} ei sisällä yhtään harrastajariviä — ohitetaan.`);
      return;
    }

    const nameRows = sheet.getRange(10, 4, dataRowCount, lastCol - 3).getValues();
    const participants = [];

    for (let col = 0; col < lastCol - 3; col++) {
      let count = 0;
      for (let row = 0; row < nameRows.length; row++) {
        if (nameRows[row][col] === "X") count++;
      }
      participants.push(count);
    }

    for (let i = 0; i < days.length; i++) {
      if (!days[i]) continue;

      const date = new Date(2026, months[i] - 1, days[i]);

      output.push([
        date,
        cfg[3],
        sessions[i] || 0,
        participants[i] || 0
      ]);
    }
  });

  if (output.length === 0) {
    Logger.log("Dashboard: ei yhtään treenipäivää — ei kirjoiteta mitään.");
    return;
  }

  dashboard.getRange(2, 1, output.length, 4).setValues(output);
}

function createDashboardCharts() {
  const sheet = getSheetByName("training_dashboard");

  // poista vanhat graafit
  sheet.getCharts().forEach(c => sheet.removeChart(c));

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  // --- 1) Harjoituskerrat ---
  const chart1 = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sheet.getRange(1, 1, lastRow, 3)) // date + sessions
    .setPosition(2, 6, 0, 0)
    .setOption("title", "Harjoituskerrat per päivä (kaikki ryhmät)")
    .setOption("legend", { position: "bottom" })
    .setOption("hAxis", { title: "Päivä" })
    .setOption("vAxis", { title: "Harjoituskerrat" })
    .build();

  sheet.insertChart(chart1);

  // --- 2) Osallistujamäärät ---
  const chart2 = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sheet.getRange(1, 1, lastRow, 4)) // date + participants
    .setPosition(25, 6, 0, 0)
    .setOption("title", "Osallistujamäärät per päivä (kaikki ryhmät)")
    .setOption("legend", { position: "bottom" })
    .setOption("hAxis", { title: "Päivä" })
    .setOption("vAxis", { title: "Osallistujat" })
    .build();

  sheet.insertChart(chart2);
}

function buildCoachMonthlyReport() {
  const src = getSheetByName("coach_registrations");
  const dstName = "report_coach_monthly_sessions";
  let dst = getSheetByName(dstName);

  // Otsikot
  const header = ["coach_name"];
  for (let m = 1; m <= 12; m++) header.push(m);
  dst.getRange(1, 1, 1, 13).setValues([header]);

  // Lue data
  const lastRow = src.getLastRow();
  if (lastRow < 2) return;

  // Sarakkeet:
  // B = first_name
  // C = last_name
  // E = date
  // F = realized
  const values = src.getRange(2, 2, lastRow - 1, 5).getValues();

  // Map: coach -> [12 kuukauden array]
  const coachMap = {};

  values.forEach(row => {
    const [first, last, , date, realized] = row;

    if (!realized || !(date instanceof Date)) return;

    const coach = `${first} ${last}`;
    const month = date.getMonth(); // 0–11

    if (!coachMap[coach]) {
      coachMap[coach] = Array(12).fill(0);
    }

    coachMap[coach][month]++;
  });

  // Muodosta tulosrivit
  const output = [];
  Object.keys(coachMap).sort().forEach(coach => {
    const row = [coach, ...coachMap[coach]];
    output.push(row);
  });

  // Kirjoita data
  if (output.length > 0) {
    dst.getRange(2, 1, output.length, 13).setValues(output);
  }

  // --- Solujen väritys ---
  const dataRange = dst.getRange(2, 2, output.length, 12);
  const values2 = dataRange.getValues();
  const bg = [];

  for (let r = 0; r < values2.length; r++) {
    const rowBg = [];
    for (let c = 0; c < 12; c++) {
      if (values2[r][c] === 0) {
        values2[r][c] = ""; // näytä tyhjänä
        rowBg.push("#F4B084"); // oranssi
      } else {
        rowBg.push("#FFFFFF"); // valkoinen
      }
    }
    bg.push(rowBg);
  }

  dataRange.setValues(values2);
  dataRange.setBackgrounds(bg);
}
