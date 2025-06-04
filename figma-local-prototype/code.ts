figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    const name = msg.name || 'prototype';
    const selection = figma.currentPage.selection.filter(node => node.type === 'FRAME') as FrameNode[];
    if (selection.length === 0) {
      figma.notify('Please select frames before running the plugin.');
      figma.ui.postMessage({ type: 'error', message: 'No frames selected' });
      return;
    }

    const frameIndex: Record<string, number> = {};
    selection.forEach((frame, i) => {
      frameIndex[frame.id] = i;
    });

    const framesData = [] as any[];
    for (let i = 0; i < selection.length; i++) {
      const frame = selection[i];
      const bytes = await frame.exportAsync({ format: 'PNG' });
      const b64 = figma.base64Encode(bytes);
      const links: any[] = [];
      const frameBox = frame.absoluteBoundingBox!;
      const nodes = frame.findAll(n => n.reactions && n.reactions.length > 0);
      for (const node of nodes) {
        const bbox = node.absoluteBoundingBox;
        if (!bbox) continue;
        for (const reaction of node.reactions) {
          if (reaction.action.type === 'NODE' && reaction.trigger.type === 'ON_CLICK') {
            const destIndex = frameIndex[reaction.action.destinationId!];
            if (destIndex !== undefined) {
              links.push({
                x: bbox.x - frameBox.x,
                y: bbox.y - frameBox.y,
                w: bbox.width,
                h: bbox.height,
                target: destIndex
              });
            }
          }
        }
      }
      framesData.push({ index: i, width: frame.width, height: frame.height, b64, links });
    }

    figma.ui.postMessage({ type: 'data', name, frames: framesData });
  }
};
