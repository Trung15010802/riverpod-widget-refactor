import { Position, TextDocument, WorkspaceEdit } from "vscode";

export function insertImportStatement(
  edit: WorkspaceEdit,
  document: TextDocument,
  documentTextArray: string[],
  importStatement: string
) {
  // only insert the import statement if it doesn't already exist
  const importStatementRegex = new RegExp(importStatement);
  const importStatementExists = documentTextArray.some((line) =>
    line.match(importStatementRegex)
  );
  if (importStatementExists) {
    return;
  }

  // insert at the top of the file
  const position = new Position(0, 0);
  edit.insert(document.uri, position, `${importStatement}\n`);
}
