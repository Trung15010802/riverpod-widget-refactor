import {
  Position,
  Range,
  TextDocument,
  workspace,
  WorkspaceEdit,
} from "vscode";
import { indexFrom } from "../functions/index_from";
import { insertImportStatement } from "../functions/insert_import_statement";
import { replaceLine } from "../functions/replace_line";

export const convertConsumerToStatelessCommand =
  "extension.convertConsumerToStateless";
export function convertConsumerToStateless(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;

  const className = widgetClassDefinitionLineMatch[1];

  const consumerWidgetLineText = `class ${className} extends StatelessWidget {`;

  const buildMethodRegex = new RegExp(
    /Widget\s+build\(\s*BuildContext\s+\w+,\s*WidgetRef\s+\w+\s*\)\s*{/
  );
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );
  const buildMethodLineText = documentTextArray[buildMethodLineNumber];
  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );

  const consumerWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context){"
  );

  const edit = new WorkspaceEdit();

  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );
  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    consumerWidgetLineText
  );
  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    consumerWidgetBuildMethodLineText
  );

  workspace.applyEdit(edit);
}

export const convertConsumerToConsumerStatefulWidgetCommand =
  "extension.convertConsumerToConsumerStatefulWidget";
export function convertConsumerToConsumerStatefulWidget(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;

  const className = widgetClassDefinitionLineMatch[1];

  const consumerStatefulWidgetLineText = `class ${className} extends ConsumerStatefulWidget {`;

  const createStateLineText = `  @override\n  ConsumerState<${className}> createState() => _${className}State();`;

  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );
  const buildMethodLineText = documentTextArray[buildMethodLineNumber];

  const consumerWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context)"
  );

  const edit = new WorkspaceEdit();
  const stateClassLineText = `}\nclass _${className}State extends ConsumerState<${className}> {`;

  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );
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
  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    consumerWidgetBuildMethodLineText
  );

  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    consumerStatefulWidgetLineText
  );

  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  workspace.applyEdit(edit);
}

export const convertConsumerToStatefulWidgetCommand =
  "extension.convertConsumerToStatefulWidget";
export function convertConsumerToStatefulWidget(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  const classDefinitionRegex = new RegExp(/class\s(\w+)\sextends\s(\w+)/);
  const widgetClassDefinitionLineNumber = range.start.line;
  const widgetClassDefinitionLineText =
    documentTextArray[widgetClassDefinitionLineNumber];
  const widgetClassDefinitionLineRange = new Range(
    new Position(widgetClassDefinitionLineNumber, 0),
    new Position(
      widgetClassDefinitionLineNumber,
      widgetClassDefinitionLineText.length
    )
  );

  const widgetClassDefinitionLineMatch = widgetClassDefinitionLineText.match(
    classDefinitionRegex
  ) as RegExpMatchArray;

  const className = widgetClassDefinitionLineMatch[1];

  const statefulWidgetLineText = `class ${className} extends StatefulWidget {`;

  const createStateLineText = `  @override\n  State<${className}> createState() => _${className}State();`;

  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );
  const buildMethodLineText = documentTextArray[buildMethodLineNumber];

  const consumerWidgetBuildMethodLineText = buildMethodLineText.replace(
    buildMethodRegex,
    "Widget build(BuildContext context)"
  );

  const edit = new WorkspaceEdit();
  const stateClassLineText = `}\nclass _${className}State extends State<${className}> {`;

  const buildMethodLineRange = new Range(
    new Position(buildMethodLineNumber, 0),
    new Position(buildMethodLineNumber, buildMethodLineText.length)
  );
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
  replaceLine(
    edit,
    document,
    buildMethodLineRange,
    consumerWidgetBuildMethodLineText
  );

  replaceLine(
    edit,
    document,
    widgetClassDefinitionLineRange,
    statefulWidgetLineText
  );

  insertImportStatement(
    edit,
    document,
    documentTextArray,
    "import 'package:flutter_riverpod/flutter_riverpod.dart';"
  );

  workspace.applyEdit(edit);
}
