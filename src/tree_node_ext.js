import {TreeNode} from 'treenode';

class TreeNodeExt extends TreeNode {
  addChildNode(childNode) {
    childNode.parent = this;
    this.children.push(childNode);
    return childNode;
  }

  nodeDepth() {
    return this.isRoot ? 0 : 1 + parent.nodeDepth();
  }

  isRoot() {
    return this.parent == null;
  }

  isLeaf() {
    return !hasChildren();
  }

  hasChildren() {
    return this.children.length != 0;
  }

  firstSibling() {
    return this.isRoot() ? this : this.parent.children[0];
  }

  isFirstSibling() {
    return this.firstSibling() === this;
  }

  lastSibling() {
    return this.isRoot() ? this : this.parent.children[this.parent.children.length - 1];
  }

  isLastSibling() {
    return this.lastSibling() === this;
  }

  siblings() {
    if (this.isRoot()) {
      return [];
    }
    let siblings = this.parent.children.slice();
    let index = siblings.indexOf(this);
    siblings.splice(index, 1);
    return siblings;
  }

  printTree(level = this.nodeDepth(), maxDepth = null) {
    var prefix = '';
    if (this.isRoot()) {
      prefix = `${prefix}*`;
    } else {
      if (!this.parent.isLastSibling()) {
        prefix = `${prefix}|`;
      }
      for (let i = 1; i <= (level - 1) * 4; i++) {
        prefix = `${prefix} `;
      }
      prefix = `${prefix}${this.isLastSibling() ? '+' : '|'}`;
      prefix = `${prefix}---`;
      prefix = `${prefix}${this.hasChildren() ? '+' : '>'}`;
    }
    console.log(`${prefix} ${this.data.name}`);
    if (maxDepth && level >= maxDepth) {
      return;
    }
    this.children.forEach((child) => {
      if (child) {
        child.printTree(level + 1, maxDepth);
      }
    });
  }
}

export default TreeNodeExt;
