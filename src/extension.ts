import { commands, ExtensionContext, languages, window } from "vscode";
import RiverpodCodeActionProvider from "./provider/riverpod_code_action_provider";
import {
  convertStatelessToConsumerStatefulWidget,
  convertStatelessToConsumerStatefulWidgetCommand,
  convertStatelessToConsumerWidget,
  convertStatelessToConsumerWidgetCommand,
} from "./commands/convert_from_stateless";
import {
  convertStatefulToConsumerStateful,
  convertStatefulToConsumerStatefulCommand,
} from "./commands/convert_from_stateful";
import {
  convertConsumerToStateless,
  convertConsumerToStatelessCommand,
} from "./commands/convert_from_consumer";

export function activate(context: ExtensionContext) {
  languages.registerCodeActionsProvider(
    "dart",
    new RiverpodCodeActionProvider()
  );
  commands.registerCommand(
    convertStatelessToConsumerWidgetCommand,
    convertStatelessToConsumerWidget
  );
  commands.registerCommand(
    convertStatelessToConsumerStatefulWidgetCommand,
    convertStatelessToConsumerStatefulWidget
  );
  commands.registerCommand(
    convertStatefulToConsumerStatefulCommand,
    convertStatefulToConsumerStateful
  );
  commands.registerCommand(
    convertConsumerToStatelessCommand,
    convertConsumerToStateless
  );
}

export function deactivate() {}
