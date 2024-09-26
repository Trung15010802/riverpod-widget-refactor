import { wrapWith } from "../functions/wrap_with";

const consumerSnippet = (widget: string) => {
  return `Consumer(
  builder: (context, ref, child) {
    return ${widget};
  },
)`;
};

export const wrapWithConsumer = async () => wrapWith(consumerSnippet);

export const wrapWithConsumerCommand = "extension.wrap-with-consumer";
