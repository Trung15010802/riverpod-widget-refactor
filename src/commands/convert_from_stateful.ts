import {
  Position,
  Range,
  TextDocument,
  window,
  workspace,
  WorkspaceEdit,
} from "vscode";
import { insertImportStatement } from "../functions/insert_import_statement";
import { indexFrom } from "../functions/index_from";
import { replaceLine } from "../functions/replace_line";

export const convertStatefulToConsumerStatefulCommand =
  "extension.convertStatefulToConsumerStateful";

/**
 * Converts a StatefulWidget to a ConsumerStatefulWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatefulToConsumerStateful(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Regular expressions to find class definitions and methods
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const createStateDefinitionRegex =
    /State<\w+>\s+createState\(\)\s*=>\s*_\w+State\(\);/;
  const stateClassDefinitionRegex = /class\s+_\w+\s+extends\s+State<\w+>\s*{/;

  //This variable stores the line number from the given range, which represents the starting line of the selected class definition. The `range` object typically refers to the selection or cursor position in the VSCode editor, and `.start.line` retrieves the starting line of this range. This line is then used to locate the specific class definition in the document.
  const startingClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[startingClassDefinitionLineNumber];

  // Find the widget class definition line
  const widgetClassDefinitionLineMatch =
    widgetClassDefinitionLineText.match(classDefinitionRegex);

  if (!widgetClassDefinitionLineMatch) {
    window.showErrorMessage("Unable to find class definition.");
    return;
  }

  const className = widgetClassDefinitionLineMatch[1];

  // Locate the createState method and the State class
  const createStateClassLineNumber = indexFrom(
    documentTextArray,
    createStateDefinitionRegex,
    startingClassDefinitionLineNumber
  );
  const stateClassLineNumber = indexFrom(
    documentTextArray,
    stateClassDefinitionRegex,
    startingClassDefinitionLineNumber
  );

  if (createStateClassLineNumber === -1) {
    window.showErrorMessage("Unable to find the createState method.");
    return;
  }

  // Prepare the replacement lines
  const consumerStatefulWidgetLineText = `class ${className} extends ConsumerStatefulWidget {`;
  const consumerCreateStateLineText = `  ConsumerState<${className}> createState() => _${className}State();`;
  const consumerStateLineText = `class _${className}State extends ConsumerState<${className}> {`;

  const edit = new WorkspaceEdit();

  // Replace the StatefulWidget class with ConsumerStatefulWidget
  const classWidgetRange = new Range(
    new Position(startingClassDefinitionLineNumber, 0),
    new Position(
      startingClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );
  replaceLine(edit, document, classWidgetRange, consumerStatefulWidgetLineText);

  // Replace the createState method
  const createStateClassRange = new Range(
    new Position(createStateClassLineNumber, 0),
    new Position(
      createStateClassLineNumber,
      documentTextArray[createStateClassLineNumber].length
    )
  );
  replaceLine(
    edit,
    document,
    createStateClassRange,
    consumerCreateStateLineText
  );

  // Replace the State class with the ConsumerState class
  const stateClassRange = new Range(
    new Position(stateClassLineNumber, 0),
    new Position(
      stateClassLineNumber,
      documentTextArray[stateClassLineNumber].length
    )
  );
  replaceLine(edit, document, stateClassRange, consumerStateLineText);

  // Insert the required import statement for Riverpod
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );
  // Apply the changes to the document
  workspace.applyEdit(edit);
}
