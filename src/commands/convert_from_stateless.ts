import {
  TextDocument,
  Range,
  Position,
  WorkspaceEdit,
  workspace,
  window,
} from "vscode";
import { insertImportStatement } from "../functions/insert_import_statement";
import { replaceLine } from "../functions/replace_line";
import { indexFrom } from "../functions/index_from";

export const convertStatelessToConsumerWidgetCommand =
  "extension.convertToConsumerWidget";

/**
 * Converts a StatelessWidget to a ConsumerWidget in the provided document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatelessToConsumerWidget(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Regex to match class definitions
  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];

  // Define the range for the widget class definition line
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;
  const className = widgetClassDefinitionLineMatch[1];

  // Define the new ConsumerWidget class definition line
  const consumerWidgetLineText = `class ${className} extends ConsumerWidget {`;

  // Regex to find the build method
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );
  const buildMethodLineText = documentTextArray[buildMethodLineNumber];

  // Define the range for the build method line
  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );

  // Update the build method to the new signature for ConsumerWidget
  const consumerWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context, WidgetRef ref)"
  );

  const edit = new WorkspaceEdit();

  // Insert the Riverpod import statement if it's not present
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  // Replace the StatelessWidget class definition with the ConsumerWidget class definition
  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    consumerWidgetLineText
  );

  // Replace the build method with the updated signature
  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    consumerWidgetBuildMethodLineText
  );

  // Apply all changes to the document
  workspace.applyEdit(edit);
}

export const convertStatelessToConsumerStatefulWidgetCommand =
  "extension.convertToConsumerStatefulWidget";

/**
 * Converts a StatelessWidget to a ConsumerStatefulWidget in the provided document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatelessToConsumerStatefulWidget(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Regex to match class definitions
  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];

  // Define the range for the widget class definition line
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;
  const className = widgetClassDefinitionLineMatch[1];

  // Define the new ConsumerStatefulWidget class definition line
  const consumerStatefulWidgetLineText = `class ${className} extends ConsumerStatefulWidget {`;

  // Define the createState method text
  const createStateLineText = `  @override\n  ConsumerState<${className}> createState() => _${className}State();`;

  // Regex to find the build method
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );

  // Define the state class text
  const stateClassLineText = `}\nclass _${className}State extends ConsumerState<${className}> {`;
  const edit = new WorkspaceEdit();

  // Insert the createState method and state class definition before the build method
  const insertCreateStatePosition = new Position(buildMethodLineNumber - 1, 0);
  edit.insert(
    document.uri,
    insertCreateStatePosition,
    createStateLineText + "\n"
  );
  const insertStateClassPosition = new Position(buildMethodLineNumber - 1, 0);
  edit.insert(
    document.uri,
    insertStateClassPosition,
    stateClassLineText + "\n"
  );

  // Replace the StatelessWidget class definition with the ConsumerStatefulWidget class definition
  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    consumerStatefulWidgetLineText
  );

  // Insert the Riverpod import statement if it's not present
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  // Apply all changes to the document
  workspace.applyEdit(edit);
}

export const convertStatelessToStatefulWidgetCommand =
  "extension.convertToStatefulWidget";

/**
 * Converts a StatelessWidget to a StatefulWidget in the provided document.
 *
 * @param document - The TextDocument object representing the current file.
 * @param range - The Range object representing the user's selection or position in the document.
 */
export function convertStatelessToStatefulWidget(
  document: TextDocument,
  range: Range
) {
  // Split the document text into an array of lines for easier processing
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Regex to match class definitions
  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];

  // Define the range for the widget class definition line
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  // Match the class definition line to extract the class name
  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;
  const className = widgetClassDefinitionLineMatch[1];

  // Define the new StatefulWidget class definition line
  const consumerStatefulWidgetLineText = `class ${className} extends StatefulWidget {`;

  // Define the createState method text
  const createStateLineText = `  @override\n  State<${className}> createState() => _${className}State();`;

  // Regex to find the build method
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );

  // Define the state class text
  const stateClassLineText = `}\nclass _${className}State extends State<${className}> {`;
  const edit = new WorkspaceEdit();

  // Insert the createState method and state class definition before the build method
  const insertCreateStatePosition = new Position(buildMethodLineNumber - 1, 0);
  edit.insert(
    document.uri,
    insertCreateStatePosition,
    createStateLineText + "\n"
  );
  const insertStateClassPosition = new Position(buildMethodLineNumber - 1, 0);
  edit.insert(
    document.uri,
    insertStateClassPosition,
    stateClassLineText + "\n"
  );

  // Replace the StatelessWidget class definition with the ConsumerStatefulWidget class definition
  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    consumerStatefulWidgetLineText
  );

  // Insert the Riverpod import statement if it's not present
  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  // Apply all changes to the document
  workspace.applyEdit(edit);
}
