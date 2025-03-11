const vscode = require("vscode");
const path = require("path");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "chatAssistant.open",
    function () {
      const panel = vscode.window.createWebviewPanel(
        "chatAssistant",
        "Chat Assistant",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        }
      );

      const htmlPath = vscode.Uri.file(
        path.join(context.extensionPath, "webview.html")
      );

      panel.webview.html = getWebviewContent(panel, htmlPath);
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

function getWebviewContent(panel, htmlPath) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Assistant</title>
        <link rel="stylesheet" href="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(htmlPath.fsPath, "../style.css"))
        )}">
    </head>
    <body>
        <div class="chat-container">
            <div class="chat-messages" id="chatMessages"></div>
            <div class="input-container">
                <input type="text" id="chatInput" placeholder="Type a message...">
                <button id="sendBtn" disabled>➤</button>
            </div>
        </div>
        <script src="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(htmlPath.fsPath, "../script.js"))
        )}"></script>
    </body>
    </html>
  `;
}

module.exports = { activate, deactivate };
