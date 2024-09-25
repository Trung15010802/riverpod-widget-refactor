import { Range, TextDocument, WorkspaceEdit } from "vscode";

export function replaceLine(
  edit: WorkspaceEdit,
  document: TextDocument,
  range: Range,
  newLineText: string
) {
  edit.replace(document.uri, range, newLineText);
}
