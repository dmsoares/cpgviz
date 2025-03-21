interface Node {
  name: string;
  astParentFullName: string;
  _id: number;
  signature: string;
  astParentType: string;
  lineNumberEnd: number;
  _label: string;
  columnNumberEnd: number;
  fullName: string;
  genericSignature: string;
  code: string;
  isExternal: boolean;
  lineNumber: number;
  columnNumber: number;
  order: number;
  filename: string;
}

export const nodesToDot = (nodes: Node[]): string => {
  let dot = "digraph G {\n";

  // Create a map to store nodes by their IDs
  const nodeMap = new Map<number, Node>();
  nodes.forEach((node) => {
    nodeMap.set(node._id, node);
  });

  // Add nodes to the DOT graph
  nodes.forEach((node) => {
    dot += `  ${node._id} [label="${node.name}"];\n`;
  });

  // Add edges to the DOT graph
  nodes.forEach((node) => {
    if (node.astParentFullName) {
      const parentNode = Array.from(nodeMap.values()).find((n) =>
        n.fullName === node.astParentFullName
      );
      if (parentNode) {
        dot += `  ${parentNode._id} -> ${node._id};\n`;
      }
    }
  });

  dot += "}\n";
  return dot;
};
