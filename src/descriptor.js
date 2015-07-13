class Descriptor {
  constructor(attrs) {
    this.id = attrs.id;
    this.name = attrs.name;
    this.type = attrs.type;
    this.rt = attrs.rt;
    this.href = attrs.href;
    this.doc = attrs.doc;
    this.ext = attrs.ext;
    this.reference = attrs.reference;
  }
}

export default Descriptor;
