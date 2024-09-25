import {
  TextDocument,
  Range,
  Position,
  WorkspaceEdit,
  workspace,
} from "vscode";
import { insertImportStatement } from "../functions/insert_import_statement";
import { replaceLine } from "../functions/replace_line";
import { indexFrom } from "../functions/index_from";
export const convertStatelessToConsumerWidgetCommand =
  "extension.convertToConsumerWidget";
export function convertStatelessToConsumerWidget(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Replace the class definition line with the ConsumerWidget version
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

  const consumerWidgetLineText = `class ${className} extends ConsumerWidget {`;

  // Replace the build method with the ConsumerWidget version
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
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
    "Widget build(BuildContext context, WidgetRef ref)"
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
export const convertStatelessToConsumerStatefulWidgetCommand =
  "extension.convertToConsumerStatefulWidget";
export function convertStatelessToConsumerStatefulWidget(
  document: TextDocument,
  range: Range
) {
  const documentTextArray = document.getText().split(/\n|\r\n/g);

  // Tìm và thay thế dòng định nghĩa class từ StatelessWidget thành ConsumerStatefulWidget
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

  // Thêm phương thức createState sau dòng class
  const createStateLineText = `  @override\n  ConsumerState<${className}> createState() => _${className}State();`;

  // Tìm vị trí dòng đầu tiên của phương thức build
  const buildMethodRegex = new RegExp(/Widget\s+build\((.*?)\)/);
  const buildMethodLineNumber = indexFrom(
    documentTextArray,
    buildMethodRegex,
    widgetClassDefinitionLineNumber
  );
  const stateClassLineText = `}\nclass _${className}State extends ConsumerState<${className}> {`;

  const edit = new WorkspaceEdit();
  // Thêm phương thức createState sau dòng class
  // const classEndLine = widgetClassDefinitionLineNumber + 1;

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

  // Thay thế dòng class cũ bằng dòng class mới với ConsumerStatefulWidget
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
