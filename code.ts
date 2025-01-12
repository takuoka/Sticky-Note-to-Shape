/**
 * デバッグ用ロガー関数
 * - console.log() に出力
 * - 追加で、notify 表示が必要なら figma.notify() を呼んでもOK
 */
function debugLog(...messages: any[]) {
  // ここでまとめて console.log() に出力
  console.log("[DEBUG]", ...messages);
  // 必要があれば画面通知:
  // figma.notify(messages.join(" "));
}

// メインの処理を関数として定義
async function convertStickyToShape() {
  // 現在の処理をここに移動
  const selection = figma.currentPage.selection;
  debugLog("Selected nodes:", selection.map(node => node.name));

  // Stickyノード（付箋）だけを抽出
  const stickyNodes = selection.filter(
    (node) => node.type === "STICKY"
  ) as StickyNode[];

  debugLog(`Found ${stickyNodes.length} sticky node(s).`);

  if (stickyNodes.length === 0) {
    figma.notify("No sticky notes found. Please select sticky notes in FigJam.");
    debugLog("No sticky nodes in selection. Exiting plugin.");
    return;
  }

  // 選択中のすべてのStickyについて処理
  for (const sticky of stickyNodes) {
    // 付箋の絶対座標を取得
    const absolutePosition = sticky.absoluteTransform;
    const absoluteX = absolutePosition[0][2];
    const absoluteY = absolutePosition[1][2];

    debugLog(`Processing sticky: ${sticky.name}`, {
      text: sticky.text.characters,
      relativeX: sticky.x,
      relativeY: sticky.y,
      absoluteX,
      absoluteY
    });

    // Shape with text（図形 + テキスト）を作成
    const shapeWithText = figma.createShapeWithText();
    shapeWithText.shapeType = "SQUARE";

    // 絶対座標を使用して配置
    shapeWithText.x = absoluteX + 100;
    shapeWithText.y = absoluteY + 100;

    // Sticky のテキストを Shape with text にコピーする
    debugLog("Loading font for shapeWithText.text...");
    await figma.loadFontAsync(shapeWithText.text.fontName as FontName);

    debugLog("Copying text:", sticky.text.characters);
    shapeWithText.text.characters = sticky.text.characters;

    // 必要に応じて色や大きさなどを調整
    // shapeWithText.resize(150, 100);
    // shapeWithText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 0 } }];

    debugLog(`Created shapeWithText at x=${shapeWithText.x}, y=${shapeWithText.y}`);
  }

  debugLog("All sticky nodes have been processed. Closing plugin.");
}

// プラグインのエントリーポイント
figma.showUI(__html__, { 
  width: 260, 
  height: 220,
  themeColors: true
});

// UIからのメッセージを受け取る
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'convert-sticky') {
    await convertStickyToShape();
  }
};