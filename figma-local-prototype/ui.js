const generateBtn = document.getElementById('generate');

generateBtn.onclick = () => {
  const name = (document.getElementById('name')).value || 'prototype';
  parent.postMessage({ pluginMessage: { type: 'generate', name } }, '*');
};

onmessage = async (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;
  if (msg.type === 'error') {
    alert(msg.message);
  }
  if (msg.type === 'data') {
    const { name, frames } = msg;
    const zip = new JSZip();
    const folder = zip.folder(name);
    frames.forEach(f => {
      folder.file(`frame${f.index}.png`, f.b64, { base64: true });
    });
    const transitions = `const frames = ${JSON.stringify(frames.map(f => ({ w: f.width, h: f.height, img: 'frame' + f.index + '.png', links: f.links })))};\n` +
      `let current = 0;\n` +
      `function showFrame(i){current=i;const fr=frames[i];const cont=document.getElementById('frame');cont.style.width=fr.w+'px';cont.style.height=fr.h+'px';cont.innerHTML='<img src="'+fr.img+'" style="width:100%;height:100%;">';fr.links.forEach(l=>{const a=document.createElement('a');a.style.position='absolute';a.style.left=l.x+'px';a.style.top=l.y+'px';a.style.width=l.w+'px';a.style.height=l.h+'px';a.href='javascript:showFrame('+l.target+')';cont.appendChild(a);});}\n` +
      `function next(){if(current<frames.length-1)showFrame(current+1);}\n` +
      `function prev(){if(current>0)showFrame(current-1);}\n` +
      `function restart(){showFrame(0);}\n` +
      `window.onload=()=>showFrame(0);`;
    folder.file('transitions.js', transitions);
    const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>body{margin:0;}#controls{position:fixed;bottom:10px;right:10px;}#frame{position:relative;}</style></head><body><div id=\"frame\"></div><div id=\"controls\"><button onclick=\"prev()\">\u25C0</button><button onclick=\"next()\">\u25B6</button><button onclick=\"restart()\">\u21BA</button></div><script src=\"transitions.js\"></script></body></html>`;
    folder.file('index.html', html);
    const content = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name + '.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
