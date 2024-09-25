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

export const convertStatefulToConsumerCommand =
  "extension.convertStatefulToConsumer";

/**
 * Converts a StatefulWidget to a ConsumerStatefulWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatefulToConsumer(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines
  const documentTextArray = document.getText().split(/\n|\r\n/g);
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);

  // Get the starting line number of the class definition
  const startingClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[startingClassDefinitionLineNumber];

  // Match the widget class definition line against the regex
  const widgetClassDefinitionLineMatch =
    widgetClassDefinitionLineText.match(classDefinitionRegex);

  // Show an error message if the class definition is not found
  if (!widgetClassDefinitionLineMatch) {
    window.showErrorMessage("Unable to find class definition.");
    return;
  }

  // Extract the class name from the match
  const className = widgetClassDefinitionLineMatch[1];

  const edit = new WorkspaceEdit();

  // Define regex to find the createState method and the @override annotation
  const createStateRegex = new RegExp(
    `State<${className}> createState\\(\\) => _${className}State\\(\\);`
  );
  const overrideRegex = /@override/;

  // Find the line number for the createState method
  const createStateLineNumber = indexFrom(
    documentTextArray,
    createStateRegex,
    startingClassDefinitionLineNumber
  );
  if (createStateLineNumber !== -1) {
    const overrideLineNumber = createStateLineNumber - 1;

    // Remove the @override annotation if it exists
    if (overrideRegex.test(documentTextArray[overrideLineNumber].trim())) {
      const overrideRange = new Range(
        new Position(overrideLineNumber, 0),
        new Position(overrideLineNumber + 1, 0)
      );
      edit.delete(document.uri, overrideRange);
    }

    // Remove the createState method line
    const createStateRange = new Range(
      new Position(createStateLineNumber, 0),
      new Position(createStateLineNumber + 1, 0)
    );
    edit.delete(document.uri, createStateRange);
  }

  // Find and remove the state class definition
  const stateClassRegex = new RegExp(
    `class _${className}State extends State<${className}> \\{`
  );
  const stateClassLineNumber = indexFrom(
    documentTextArray,
    stateClassRegex,
    startingClassDefinitionLineNumber
  );
  if (stateClassLineNumber !== -1) {
    const stateClassRange = new Range(
      new Position(stateClassLineNumber, 0),
      new Position(stateClassLineNumber + 1, 0)
    );
    edit.delete(document.uri, stateClassRange);
  }

  // Replace the widget class definition with the new ConsumerWidget definition
  const classWidgetRange = new Range(
    new Position(startingClassDefinitionLineNumber, 0),
    new Position(
      startingClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );
  const consumerWidgetLineText = `class ${className} extends ConsumerWidget {`;
  replaceLine(edit, document, classWidgetRange, consumerWidgetLineText);

  // Find the end of the class to remove the closing brace
  let endOfClassLineNumber = startingClassDefinitionLineNumber + 1;
  while (endOfClassLineNumber < documentTextArray.length) {
    const lineText = documentTextArray[endOfClassLineNumber].trim();
    if (lineText === "}") {
      break;
    }
    endOfClassLineNumber++;
  }

  // Remove the closing brace of the class
  const classEndRange = new Range(
    new Position(endOfClassLineNumber, 0),
    new Position(endOfClassLineNumber + 1, 0)
  );

  edit.delete(document.uri, classEndRange);
  // Find and update the build method to fit the new ConsumerWidget
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    startingClassDefinitionLineNumber
  );

  const buildMethodLineText = documentTextArray[buildMethodLineNumber];
  const consumerWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context, WidgetRef ref)"
  );
  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );

  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    consumerWidgetBuildMethodLineText
  );
  // Apply all the edits made to the document
  workspace.applyEdit(edit);
}
