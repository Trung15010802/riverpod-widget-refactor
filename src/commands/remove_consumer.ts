import { convertTo } from "../functions/convert_to";

const removeConsumerSnippet = (child: string) => {
  return `${child}`;
};

export const removeConsumer = async () => convertTo(removeConsumerSnippet);

export const removeConsumerCommand = "extension.remove_consumer";
