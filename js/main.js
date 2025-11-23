// === OPSLAAN – NU MET TWEE KNOPPEN: TXT + DOCX ===
const saveLogBtn = document.getElementById('saveLogBtn');

// Verander de bestaande knop in TXT-knop
saveLogBtn.textContent = 'TXT';
saveLogBtn.title = 'Opslaan als platte tekst';

// Maak nieuwe DOCX-knop rechts ervan
const saveDocxBtn = document.createElement('button');
saveDocxBtn.id = 'saveDocxBtn';
saveDocxBtn.textContent = 'DOCX';
saveDocxBtn.title = 'Opslaan als mooi Word-document (met kleuren)';
saveDocxBtn.style.marginLeft = '8px';
saveLogBtn.parentNode.appendChild(saveDocxBtn);

// === TXT EXPORT (blijft zoals voorheen) ===
saveLogBtn.onclick = () => {
  let content = `LESOBSERVATIE – ${new Date().toLocaleDateString('nl-BE')}\n${'='.repeat(60)}\n\n`;
  content += `Lesonderwerp: ${state.info.subject}\nLesgever: ${state.info.teacher}\nDoelgroep: ${state.info.group}\n\n`;
  content += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\nTIJDVERDELING\n${'-'.repeat(30)}\n`;
  categories.forEach((cat, i) => {
    const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
    content += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
  });
  content += `\nLOGBOEK\n${'-'.repeat(30)}\n`;
  document.querySelectorAll('#log > div').forEach(el => {
    let line = el.textContent || '';
    if (el.classList.contains('log-note')) line = '      ' + line;
    if (el.classList.contains('log-sub')) line = '   ' + line;
    if (el.classList.contains('log-section')) line = '\n' + line.toUpperCase();
    if (el.classList.contains('log-title')) line = '\n' + line.toUpperCase() + '\n';
    if (el.classList.contains('info')) line = '   ' + line;
    content += line + '\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.info.subject} - ${state.info.teacher} - ${state.info.group}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// === DOCX EXPORT – PRACHTIGE WORD-FILE MET KLEUREN ===
saveDocxBtn.onclick = async () => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const doc = new Document({
    creator: "Sportles Observatie Tool",
    title: "Lesobservatie",
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: "LESOBSERVATIE", bold: true, size: 32 })],
          alignment: "center",
          spacing: { after: 400 }
        }),
        new Paragraph({ text: `Lesonderwerp: ${state.info.subject}`, indent: { left: 720 } }),
        new Paragraph({ text: `Lesgever: ${state.info.teacher}`, indent: { left: 720 } }),
        new Paragraph({ text: `Doelgroep: ${state.info.group}`, indent: { left: 720 } }),
        new Paragraph({ text: `Datum: ${new Date().toLocaleDateString('nl-BE')}`, indent: { left: 720 } }),
        new Paragraph({ text: ``, spacing: { before: 300, after: 300 } }),

        new Paragraph({
          text: "TIJDVERDELING",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        }),
      ]
    }]
  });

  // Tijdverdeling
  categories.forEach((cat, i) => {
    const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
    doc.sections[0].children.push(
      new Paragraph({
        text: `• ${cat.name}: ${formatTime(state.accum[i])} (${perc}%)`,
        indent: { left: 720 }
      })
    );
  });

  doc.sections[0].children.push(new Paragraph({ text: "", spacing: { before: 400, after: 400 } }));
  doc.sections[0].children.push(new Paragraph({ text: "LOGBOEK", heading: HeadingLevel.HEADING_2 }));

  // Logboekregels
  document.querySelectorAll('#log > div').forEach(el => {
    const text = el.textContent || '';
    if (!text.trim()) return;

    let runOptions = { size: 24 };

    if (el.classList.contains('log-title') || el.classList.contains('log-section')) {
      doc.sections[0].children.push(new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }));
    }
    else if (el.classList.contains('info')) {
      doc.sections[0].children.push(new Paragraph({
        text: `   ${text}`,
        indent: { left: 720 }
      }));
    }
    else if (el.classList.contains('log-sub')) {
      doc.sections[0].children.push(new Paragraph({
        text: `   ${text}`,
        indent: { left: 720 }
      }));
    }
    else if (el.classList.contains('log-note')) {
      let prefix = text.match(/^\[[^\]]+\]\s*([Checkmark✗→])\s*/)?.[1] || '→';
      let noteText = text.replace(/^\[[^\]]+\]\s*[Checkmark✗→]\s*/, '');

      if (prefix === 'Checkmark') {
        runOptions.color = "008000";
        runOptions.bold = true;
      } else if (prefix === '✗') {
        runOptions.color = "C00000";
        runOptions.bold = true;
      }

      doc.sections[0].children.push(new Paragraph({
        children: [
          new TextRun({ text: `      [${formatTime(state.totalElapsed)}] ${prefix} `, ...runOptions }),
          new TextRun({ text: noteText, size: 24 })
        ],
        indent: { left: 720 }
      }));
    }
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.info.subject} - ${state.info.teacher} - ${state.info.group}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};
