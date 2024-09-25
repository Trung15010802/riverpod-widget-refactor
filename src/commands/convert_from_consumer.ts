import {
  Position,
  Range,
  TextDocument,
  workspace,
  WorkspaceEdit,
} from "vscode";
import { indexFrom } from "../functions/index_from";
import { insertImportStatement } from "../functions/insert_import_statement";
import { replaceLine } from "../functions/replace_lin";

export const convertConsumerToStatelessCommand =
  "extension.convertConsumerToStateless";
export function convertConsumerToStateless(
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

  const consumerWidgetLineText = `class ${className} extends StatelessWidget {`;

  // Replace the build method with the ConsumerWidget version
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
