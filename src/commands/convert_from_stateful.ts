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
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Define regular expressions for identifying the class and state definitions
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const createStateDefinitionRegex =
    /State<\w+>\s+createState\(\)\s*=>\s*_\w+State\(\);/;
  const stateClassDefinitionRegex = /class\s+_\w+\s+extends\s+State<\w+>\s*{/;

  // Get the starting line number of the class definition
  const startingClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[startingClassDefinitionLineNumber];

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch =
    widgetClassDefinitionLineText.match(classDefinitionRegex);

  if (!widgetClassDefinitionLineMatch) {
    window.showErrorMessage("Unable to find class definition.");
    return;
  }

  const className = widgetClassDefinitionLineMatch[1];

  // Find the line numbers of createState and state class definitions
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

  // Define new lines for the ConsumerStatefulWidget and its state class
  const consumerStatefulWidgetLineText = `class ${className} extends ConsumerStatefulWidget {`;
  const consumerCreateStateLineText = `  ConsumerState<${className}> createState() => _${className}State();`;
  const consumerStateLineText = `class _${className}State extends ConsumerState<${className}> {`;

  const edit = new WorkspaceEdit();

  // Replace the original StatefulWidget with the new ConsumerStatefulWidget
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

  // Replace the state class definition
  const stateClassRange = new Range(
    new Position(stateClassLineNumber, 0),
    new Position(
      stateClassLineNumber,
      documentTextArray[stateClassLineNumber].length
    )
  );
  replaceLine(edit, document, stateClassRange, consumerStateLineText);

  // Insert the Riverpod import statement if it's not already present
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  // Apply all changes to the document
  workspace.applyEdit(edit);
}

export const convertStatefulToConsumerCommand =
  "extension.convertStatefulToConsumer";

/**
 * Converts a StatefulWidget to a ConsumerWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatefulToConsumer(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);

  // Get the starting line number of the class definition
  const startingClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[startingClassDefinitionLineNumber];

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch =
    widgetClassDefinitionLineText.match(classDefinitionRegex);

  if (!widgetClassDefinitionLineMatch) {
    window.showErrorMessage("Unable to find class definition.");
    return;
  }

  const className = widgetClassDefinitionLineMatch[1];

  const edit = new WorkspaceEdit();

  // Create a regex to find the createState method
  const createStateRegex = new RegExp(
    `State<${className}> createState\\(\\) => _${className}State\\(\\);`
  );
  const overrideRegex = /@override/;

  // Find the line number of the createState method
  const createStateLineNumber = indexFrom(
    documentTextArray,
    createStateRegex,
    startingClassDefinitionLineNumber
  );
  if (createStateLineNumber !== -1) {
    const overrideLineNumber = createStateLineNumber - 1;

    // Remove the override annotation if present
    if (overrideRegex.test(documentTextArray[overrideLineNumber].trim())) {
      const overrideRange = new Range(
        new Position(overrideLineNumber, 0),
        new Position(overrideLineNumber + 1, 0)
      );
      edit.delete(document.uri, overrideRange);
    }

    // Remove the createState method
    const createStateRange = new Range(
      new Position(createStateLineNumber, 0),
      new Position(createStateLineNumber + 1, 0)
    );
    edit.delete(document.uri, createStateRange);
  }

  // Create a regex to find the state class definition
  const stateClassRegex = new RegExp(
    `class _${className}State extends State<${className}> \\{`
  );
  const stateClassLineNumber = indexFrom(
    documentTextArray,
    stateClassRegex,
    startingClassDefinitionLineNumber
  );
  if (stateClassLineNumber !== -1) {
    // Remove the state class if found
    const stateClassRange = new Range(
      new Position(stateClassLineNumber, 0),
      new Position(stateClassLineNumber + 1, 0)
    );
    edit.delete(document.uri, stateClassRange);
  }

  // Replace the original StatefulWidget with the new ConsumerWidget
  const classWidgetRange = new Range(
    new Position(startingClassDefinitionLineNumber, 0),
    new Position(
      startingClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );
  const consumerWidgetLineText = `class ${className} extends ConsumerWidget {`;
  replaceLine(edit, document, classWidgetRange, consumerWidgetLineText);

  // Find the end of the class and remove it
  let endOfClassLineNumber = startingClassDefinitionLineNumber + 1;
  while (endOfClassLineNumber < documentTextArray.length) {
    const lineText = documentTextArray[endOfClassLineNumber].trim();
    if (lineText === "}") {
      break;
    }
    endOfClassLineNumber++;
  }

  const classEndRange = new Range(
    new Position(endOfClassLineNumber, 0),
    new Position(endOfClassLineNumber + 1, 0)
  );

  edit.delete(document.uri, classEndRange);

  // Update the build method to the new signature for ConsumerWidget
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

  // Apply all changes to the document
  workspace.applyEdit(edit);
}

export const convertStatefulToStatelessCommand =
  "extension.convertStatefulToStateless";

/**
 * Converts a StatefulWidget to a StatelessWidget in a given document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatefulToStateless(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);
  const classDefinitionRegex = /class\s(\w+)\sextends\s(\w+)/;
  const buildMethodRegex = /Widget\s+build\((.*?)\)/;

  // Get the starting line number of the class definition
  const startingClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[startingClassDefinitionLineNumber];

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch =
    widgetClassDefinitionLineText.match(classDefinitionRegex);

  if (!widgetClassDefinitionLineMatch) {
    window.showErrorMessage("Unable to find class definition.");
    return;
  }

  const className = widgetClassDefinitionLineMatch[1];

  const edit = new WorkspaceEdit();

  // Create a regex to find the createState method
  const createStateRegex = new RegExp(
    `State<${className}> createState\\(\\) => _${className}State\\(\\);`
  );
  const overrideRegex = /@override/;

  // Find the line number of the createState method
  const createStateLineNumber = indexFrom(
    documentTextArray,
    createStateRegex,
    startingClassDefinitionLineNumber
  );
  if (createStateLineNumber !== -1) {
    const overrideLineNumber = createStateLineNumber - 1;

    // Remove the override annotation if present
    if (overrideRegex.test(documentTextArray[overrideLineNumber].trim())) {
      const overrideRange = new Range(
        new Position(overrideLineNumber, 0),
        new Position(overrideLineNumber + 1, 0)
      );
      edit.delete(document.uri, overrideRange);
    }

    // Remove the createState method
    const createStateRange = new Range(
      new Position(createStateLineNumber, 0),
      new Position(createStateLineNumber + 1, 0)
    );
    edit.delete(document.uri, createStateRange);
  }

  // Create a regex to find the state class definition
  const stateClassRegex = new RegExp(
    `class _${className}State extends State<${className}> \\{`
  );
  const stateClassLineNumber = indexFrom(
    documentTextArray,
    stateClassRegex,
    startingClassDefinitionLineNumber
  );
  if (stateClassLineNumber !== -1) {
    // Remove the state class if found
    const stateClassRange = new Range(
      new Position(stateClassLineNumber, 0),
      new Position(stateClassLineNumber + 1, 0)
    );
    edit.delete(document.uri, stateClassRange);
  }

  // Replace the original StatefulWidget with the new StatelessWidget
  const classWidgetRange = new Range(
    new Position(startingClassDefinitionLineNumber, 0),
    new Position(
      startingClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );
  const statelessWidgetLineText = `class ${className} extends StatelessWidget {`;
  replaceLine(edit, document, classWidgetRange, statelessWidgetLineText);

  // Find the end of the class and remove it
  let endOfClassLineNumber = startingClassDefinitionLineNumber + 1;
  while (endOfClassLineNumber < documentTextArray.length) {
    const lineText = documentTextArray[endOfClassLineNumber].trim();
    if (lineText === "}") {
      break;
    }
    endOfClassLineNumber++;
  }

  const classEndRange = new Range(
    new Position(endOfClassLineNumber, 0),
    new Position(endOfClassLineNumber + 1, 0)
  );

  edit.delete(document.uri, classEndRange);

  // Update the build method to the new signature for StatelessWidget
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    startingClassDefinitionLineNumber
  );

  const buildMethodLineText = documentTextArray[buildMethodLineNumber];
  const statelessWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context)"
  );
  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );

  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    statelessWidgetBuildMethodLineText
  );

  // Apply all changes to the document
  workspace.applyEdit(edit);
}
