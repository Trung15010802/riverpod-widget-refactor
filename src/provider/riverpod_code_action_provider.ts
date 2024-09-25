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
import { convertConsumerToStatelessCommand } from "../commands/convert_from_consumer";

class RiverpodCodeActionProvider implements CodeActionProvider {
  provideCodeActions(
    document: TextDocument,
    range: Range | Selection
  ): ProviderResult<(CodeAction | Command)[]> {
    const actions: CodeAction[] = [];

    const documentTextArray = document.getText().split(/\r?\n/g);
    const StatelessWidget = new RegExp(/class\s\w+\sextends\sStatelessWidget/);
    const StatefulWidget = new RegExp(/class\s\w+\sextends\sStatefulWidget/);

    const isSelectedLineStatelessWidget = StatelessWidget.test(
      documentTextArray[range.start.line]
    );
    const isSelectedLineStatefulWidget = StatefulWidget.test(
      documentTextArray[range.start.line]
    );
    const consumerWidgetRegex = new RegExp(
      /class\s\w+\sextends\sConsumerWidget/
    );
    const consumerStatefulWidgetRegex = new RegExp(
      /class\s\w+\sextends\sConsumerStatefulWidget/
    );
    const classDefinitionRegex = new RegExp(/class\s\w+\sextends\s\w+/);

    const isSelectedLineClassDefinition = classDefinitionRegex.test(
      documentTextArray[range.start.line]
    );
    const isSelectedLineConsumerWidget = consumerWidgetRegex.test(
      documentTextArray[range.start.line]
    );
    const isSelectedLineConsumerStatefulWidget =
      consumerStatefulWidgetRegex.test(documentTextArray[range.start.line]);

    if (isSelectedLineClassDefinition && !isSelectedLineConsumerWidget) {
      if (isSelectedLineStatelessWidget) {
        registerCodeAction(
          "Convert to ConsumerWidget",
          convertStatelessToConsumerWidgetCommand,
          document,
          range,
          actions
        );
      }
      if (isSelectedLineStatefulWidget) {
        console.log("Selected line is a StatefulWidget");

        registerCodeAction(
          "Convert to ConsumerStatefulWidget",
          convertStatefulToConsumerStatefulCommand,
          document,
          range,
          actions
        );
      }
    }

    if (
      isSelectedLineClassDefinition &&
      !isSelectedLineConsumerStatefulWidget &&
      isSelectedLineStatelessWidget
    ) {
      registerCodeAction(
        "Convert to ConsumerStatefulWidget",
        convertStatelessToConsumerStatefulWidgetCommand,
        document,
        range,
        actions
      );
    }

    if (isSelectedLineClassDefinition && !isSelectedLineStatelessWidget) {
      registerCodeAction(
        "Convert to StatelessWidget",
        convertConsumerToStatelessCommand,
        document,
        range,
        actions
      );
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
