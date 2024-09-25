import {
  CodeAction,
  CodeActionKind,
  CodeActionProvider,
  Command,
  ProviderResult,
  Range,
  Selection,
  TextDocument,
} from "vscode";
import {
  convertStatelessToConsumerStatefulWidgetCommand,
  convertStatelessToConsumerWidgetCommand,
} from "../commands/convert_from_stateless";
import { convertStatefulToConsumerStatefulCommand } from "../commands/convert_from_stateful";
import {
  convertConsumerToConsumerStatefulWidgetCommand,
  convertConsumerToStatelessCommand,
} from "../commands/convert_from_consumer";

const ACTION_TITLES = {
  toStateful: "Convert to StatefulWidget",
  toStateless: "Convert to StatelessWidget",
  toConsumer: "Convert to ConsumerWidget",
  toConsumerState: "Convert to ConsumerStatefulWidget",
};

const REGEX_PATTERNS = {
  StatelessWidget: /class\s\w+\sextends\sStatelessWidget/,
  StatefulWidget: /class\s\w+\sextends\sStatefulWidget/,
  ConsumerWidget: /class\s\w+\sextends\sConsumerWidget/,
  ConsumerStatefulWidget: /class\s\w+\sextends\sConsumerStatefulWidget/,
  ClassDefinition: /class\s\w+\sextends\s\w+/,
};

class RiverpodCodeActionProvider implements CodeActionProvider {
  provideCodeActions(
    document: TextDocument,
    range: Range | Selection
  ): ProviderResult<(CodeAction | Command)[]> {
    const actions: CodeAction[] = [];
    const documentTextArray = document.getText().split(/\r?\n/g);
    const selectedLineText = documentTextArray[range.start.line];

    // Determine widget types
    const isClassDefinition =
      REGEX_PATTERNS.ClassDefinition.test(selectedLineText);
    const isStatelessWidget =
      REGEX_PATTERNS.StatelessWidget.test(selectedLineText);
    const isStatefulWidget =
      REGEX_PATTERNS.StatefulWidget.test(selectedLineText);
    const isConsumerWidget =
      REGEX_PATTERNS.ConsumerWidget.test(selectedLineText);
    const isConsumerStatefulWidget =
      REGEX_PATTERNS.ConsumerStatefulWidget.test(selectedLineText);

    if (isClassDefinition) {
      if (isStatelessWidget) {
        registerCodeAction(
          ACTION_TITLES.toConsumer,
          convertStatelessToConsumerWidgetCommand,
          document,
          range,
          actions
        );

        registerCodeAction(
          ACTION_TITLES.toConsumerState,
          convertStatelessToConsumerStatefulWidgetCommand,
          document,
          range,
          actions
        );
      }

      if (isStatefulWidget) {
        registerCodeAction(
          ACTION_TITLES.toConsumerState,
          convertStatefulToConsumerStatefulCommand,
          document,
          range,
          actions
        );
      }

      if (isConsumerWidget) {
        registerCodeAction(
          ACTION_TITLES.toStateless,
          convertConsumerToStatelessCommand,
          document,
          range,
          actions
        );
        registerCodeAction(
          ACTION_TITLES.toConsumerState,
          convertConsumerToConsumerStatefulWidgetCommand,
          document,
          range,
          actions
        );
      }
    }

    return actions;
  }

  resolveCodeAction?(codeAction: CodeAction): ProviderResult<CodeAction> {
    return codeAction;
  }
}

function registerCodeAction(
  commandTitle: string,
  commandName: string,
  document: TextDocument,
  range: Range | Selection,
  actions: CodeAction[]
) {
  const codeAction = new CodeAction(
    commandTitle,
    CodeActionKind.RefactorRewrite
  );

  codeAction.command = {
    title: commandTitle,
    command: commandName,
    arguments: [document, range],
  };

  actions.push(codeAction);
}

export default RiverpodCodeActionProvider;
