export function indexFrom(
  documentTextArray: string[],
  regex: RegExp,
  startingFrom: number
) {
  for (let i = startingFrom; i < documentTextArray.length; i++) {
    if (regex.test(documentTextArray[i])) {
      return i;
    }
  }

  return -1;
}
