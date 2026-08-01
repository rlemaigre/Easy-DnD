// Forked from https://gist.github.com/gre/296291b8ce0d8fe6e1c3ea4f1d1c5c3b
const regex = /(auto|scroll)/;

const scroll = (node: Element) => {
  const style = getComputedStyle(node, null);
  return regex.test(style.overflow + style.overflowY + style.overflowX);
};

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
