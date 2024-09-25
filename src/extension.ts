import { commands, ExtensionContext, languages } from "vscode";
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
  convertConsumerToConsumerStatefulWidget,
  convertConsumerToConsumerStatefulWidgetCommand,
  convertConsumerToStateless,
  convertConsumerToStatelessCommand,
} from "./commands/convert_from_consumer";
import {
  convertConsumerStatefulToConsumer,
  convertConsumerStatefulToConsumerCommand,
} from "./commands/convert_from_consumer_stateful";

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
  commands.registerCommand(
    convertConsumerToConsumerStatefulWidgetCommand,
    convertConsumerToConsumerStatefulWidget
  );
  commands.registerCommand(
    convertConsumerStatefulToConsumerCommand,
    convertConsumerStatefulToConsumer
  );
}

export function deactivate() {}
