// Forked from https://gist.github.com/gre/296291b8ce0d8fe6e1c3ea4f1d1c5c3b
const regex = /(auto|scroll)/;

const style = (node: Element, prop: string) =>
  getComputedStyle(node, null).getPropertyValue(prop);

const scroll = (node: Element) =>
  regex.test(
    style(node, 'overflow') +
    style(node, 'overflow-y') +
    style(node, 'overflow-x'));

const scrollparent = (node: Node | null): HTMLElement => {
  if (!node || node === document.body) {
    return document.body;
  }
  
  if (node instanceof HTMLElement && scroll(node)) {
    return node;
  }
  
  return scrollparent(node.parentNode);
};

export default scrollparent;
