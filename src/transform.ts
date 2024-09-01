import { transformCode } from './node';
import type { JsxNodeElement, Tree } from './types';

interface VFile {
  history: string[];
  cwd: string;
}

interface Options {
  /**
   * Specify custom component name, component will receive sandpack files as prop
   * @default Sandpack
   */
  componentName?: string | string[];
}

export const transform = (options?: Options) => {
  const componentName = Array.isArray(options?.componentName)
    ? options?.componentName
    : [options?.componentName || 'Sandpack'];
  return async (tree: Tree, file: VFile): Promise<void> => {
    const visit = await import('unist-util-visit').then(
      (module) => module.visit
    );
    const promises: Array<() => Promise<void>> = [];

    visit(tree, 'mdxJsxFlowElement', (jsxNode: JsxNodeElement) => {
      if (!componentName.includes(jsxNode.name)) return;

      promises.push(async () => transformCode(jsxNode, file));
    });

    await Promise.all(promises.map((p) => p()));
  };
};

