import _ from 'lodash';
import wrap from 'array-wrap';
import XML2JS from 'xml2js';
import Done from 'promise-done'
import Descriptor from './descriptor';
import TreeNodeExt from './tree_node_ext';

class Profile {
  constructor(document, url) {
    if (!document || !url) {
      throw 'Invalid parameter';
    }
    this.document = document;
    this.url = url;
    this.rootNodes = [];
    this.descriptors = {};
    this.insubstantialDescriptors = [];
  }

  static parse(document, url) {
    let profile = new Profile(document, url);
    return profile._parse();
  }

  findNode(id) {
    return this.rootNodes.reduce((result, rootNode) => {
      result || rootNode.find((node) => node.name === id && !node.descriptor.reference);
    }, null);
  }

  findDescriptor(id) {
    if (id.startsWith('#')) {
      id = id.substr(1);
    }
    return this.descriptors[id] || this.insubstantialDescriptors.find((descriptor) => descriptor.id === id);
  }

  firstDescriptor() {
    return this.rootNodes[0].descriptor;
  }

  rootDescriptors() {
    return this.rootNodes.map((rootNode) => rootNode.descriptor);
  }

  allDescriptors() {
    return _.values(this.descriptors);
  }

  _defineAll(doc) {
    if (!doc || !doc.alps) {
      throw 'Invalid document';
    }
    wrap(doc.alps.descriptor).forEach((data) => {
      this.rootNodes.push(this._defineDescriptor(data));
    })
    // this.rootNodes = wrap(doc.alps.descriptor).map((data) => this._defineDescriptor(data));
    return this;
  }

  _parse() {
    if (this.document.match(/^\s*{/)) {
      return Promise.resolve(JSON.parse(this.document)).then((doc) => {
        return this._defineAll(doc);
      }).catch(Done);
    } else if (this.document.match(/^\s*</)) {
      return new Promise((resolve, reject) => {
        XML2JS.parseString(this.document, {explicitArray: false, mergeAttrs: true}, (err, doc) => {
          resolve(doc);
        });
      }).then((doc) => {
        return this._defineAll(doc)
      }).catch(Done);
    } else {
      throw 'Invalid document format';
    }
  }

  _defineDescriptor(data) {
    var id, descriptor;
    if (data.id) { // substantial
      id = data.id;
      descriptor = new Descriptor({id: id, name: data.name, type: data.type, rt: data.rt, href: data.href, doc: data.doc, ext: data.ext});
      this.descriptors[id] = descriptor;
      this._setReference(id, descriptor);
    } else { // insubstantial
      let url, reference = null;
      [url, id] = data.href.split('#');
      if (!url) {
        reference = this.descriptors[id];
      }
      descriptor = new Descriptor({id: id, name: data.name, type: data.type, rt: data.rt, href: data.href, doc: data.doc, ext: data.ext, reference: reference});
      this.insubstantialDescriptors.push(descriptor);
    }
    var node = new TreeNodeExt({name: id, descriptor: descriptor});
    if (data.descriptor) {
      wrap(data.descriptor).forEach((dataChild) => {
        let child = this._defineDescriptor(dataChild);
        node.addChildNode(child);
      });
    }
    return node;
  }

  _setReference(id, descriptor) {
    this.insubstantialDescriptors.forEach((insubstantialDescriptor) => {
      if (!insubstantialDescriptor.reference && insubstantialDescriptor.id === id) {
        insubstantialDescriptor.reference = descriptor;
      }
    });
  }
}

export default Profile;
