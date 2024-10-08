import * as vscode from "vscode";

export function activate({ subscriptions }: vscode.ExtensionContext) {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10000
  );
  Object.assign(statusBar, {
    tooltip: "Go to Line/Column",
    // call natives command gotToLine
    command: "workbench.action.gotoLine"
  })

  const onChange = () => onChangeStatusBar(statusBar)

  subscriptions.push(
    statusBar,
    vscode.window.onDidChangeActiveTextEditor(onChange),
    vscode.window.onDidChangeTextEditorSelection(onChange)
  );

  onChange();
}

function onChangeStatusBar(statusBar: vscode.StatusBarItem): void {
  const editor = vscode.window.activeTextEditor

  // not active
  if (!editor) {
    statusBar.hide();
    return
  }

  const info = {
    ln: editor.selections[0].start.line + 1,
    col: editor.selections[0].start.character + 1,

    selected: { ln: 0, word: 0 }
  }

  editor.selections.forEach((el) => {
    // selected lines
    let ln = el.end.line - el.start.line
    if (el.end.character === 0) {
      ln -= 1;
    }
    info.selected.ln += Math.max(ln, 0)

    // selected word
    const range = new vscode.Range(el.start.line, el.start.character, el.end.line, el.end.character)
    info.selected.word += editor.document.getText(range).length

  });

  statusBar.text = `Ln ${info.ln}, Col ${info.col}`;
  if (info.selected.ln > 0 || info.selected.word > 0) {
    statusBar.text += `(Ln ${info.selected.ln + 1}, ${info.selected.word} Selected)`
  }
  statusBar.show();
}