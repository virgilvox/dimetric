/**
 * HTML template for standalone export.
 * Placeholders: {{TITLE}}, {{MAP_JSON}}, {{RUNTIME_SCRIPT}}
 */
export const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}}</title>
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.mjs" type="module"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #1a1a2e; }
    #game { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module">
    {{RUNTIME_SCRIPT}}

    const mapData = {{MAP_JSON}};

    async function main() {
      const container = document.getElementById('game');
      // Minimal bootstrap: render map layers
      const app = new PIXI.Application();
      await app.init({
        resizeTo: container,
        backgroundColor: 0x1a1a2e,
      });
      container.appendChild(app.canvas);

      // Simple isometric renderer
      const tw = mapData.tileSize.width;
      const th = mapData.tileSize.height;

      for (const layer of mapData.layers) {
        if (layer.type !== 'tile') continue;
        const layerContainer = new PIXI.Container();
        for (let row = 0; row < layer.height; row++) {
          for (let col = 0; col < layer.width; col++) {
            const gid = layer.data[row * layer.width + col];
            if (gid === 0) continue;
            const sx = (col - row) * (tw / 2);
            const sy = (col + row) * (th / 2);
            const g = new PIXI.Graphics();
            g.poly([tw/2, 0, tw, th/2, tw/2, th, 0, th/2]);
            g.fill(gid === 1 ? 0x4a7c59 : 0x5a5a6e);
            g.stroke({ color: 0x333333, width: 1 });
            g.position.set(sx, sy);
            layerContainer.addChild(g);
          }
        }
        app.stage.addChild(layerContainer);
      }

      // Center the view
      const cx = mapData.mapSize.width * tw / 2;
      const cy = mapData.mapSize.height * th / 2;
      app.stage.position.set(
        app.canvas.width / 2 - cx,
        app.canvas.height / 2 - cy / 2,
      );
    }

    main().catch(console.error);
  <\/script>
</body>
</html>`;
