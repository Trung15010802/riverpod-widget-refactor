import {
  Position,
  Range,
  TextDocument,
  window,
  workspace,
  WorkspaceEdit,
} from "vscode";
import { indexFrom } from "../functions/index_from";
import { replaceLine } from "../functions/replace_line";
import { insertImportStatement } from "../functions/insert_import_statement";

// Command identifier for converting ConsumerStatefulWidget to StatefulWidget
export const convertConsumerStatefulToStatefulCommand =
  "extension.convertConsumerStatefulToStateful";

/**
 * Converts a StatefulWidget to a ConsumerStatefulWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertConsumerStatefulToStateful(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Regular expressions to find class definitions and methods
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const createStateDefinitionRegex =
    /ConsumerState<\w+>\s+createState\(\)\s*=>\s*_\w+State\(\);/;
  const stateClassDefinitionRegex =
    /class\s+_\w+\s+extends\s+ConsumerState<\w+>\s*{/;

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

  // Find the line numbers for createState and state class definitions
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

  // Show an error message if the createState method is not found
  if (createStateClassLineNumber === -1) {
    window.showErrorMessage("Unable to find the createState method.");
    return;
  }

  // Prepare the new lines of code for the conversion
  const consumerStatefulWidgetLineText = `class ${className} extends StatefulWidget {`;
  const consumerCreateStateLineText = `  State<${className}> createState() => _${className}State();`;
  const consumerStateLineText = `class _${className}State extends State<${className}> {`;

  const edit = new WorkspaceEdit();

  // Replace the original class definition with the new StatefulWidget definition
  const classWidgetRange = new Range(
    new Position(startingClassDefinitionLineNumber, 0),
    new Position(
      startingClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );
  replaceLine(edit, document, classWidgetRange, consumerStatefulWidgetLineText);

  // Replace the createState method with the new version
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

  // Replace the state class definition with the new one
  const stateClassRange = new Range(
    new Position(stateClassLineNumber, 0),
    new Position(
      stateClassLineNumber,
      documentTextArray[stateClassLineNumber].length
    )
  );
  replaceLine(edit, document, stateClassRange, consumerStateLineText);

  // Insert the necessary import statement for Riverpod
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  // Apply all the edits made to the document
  workspace.applyEdit(edit);
}

// Command identifier for converting ConsumerStatefulWidget to ConsumerWidget
export const convertConsumerStatefulToConsumerCommand =
  "extension.convertConsumerStatefulToConsumer";

/**
 * Converts a ConsumerStatefulWidget to a ConsumerWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertConsumerStatefulToConsumer(
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
    `ConsumerState<${className}> createState\\(\\) => _${className}State\\(\\);`
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
    `class _${className}State extends ConsumerState<${className}> \\{`
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

export const convertConsumerStatefulToStatelessCommand =
  "extension.convertConsumerStatefulToStateless";

export function convertConsumerStatefulToStateless(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines
  const documentTextArray = document.getText().split(/\n|\r\n/g);
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;

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
    `ConsumerState<${className}> createState\\(\\) => _${className}State\\(\\);`
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
    `class _${className}State extends ConsumerState<${className}> \\{`
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
  const consumerWidgetLineText = `class ${className} extends StatelessWidget {`;
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

  // Apply all the edits made to the document
  workspace.applyEdit(edit);
}
