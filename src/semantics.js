import _ from 'lodash';
import Profile from './profile';
import TreeNodeExt from './tree_node_ext';
import Done from 'promise-done';
import ProfileFetcher from './profile_fetcher'

class Semantics {
  constructor(initialProfile, fetcher = new ProfileFetcher()) {
    this.initialProfile = initialProfile;
    this.fetcher = fetcher;
    this.profiles = {[initialProfile.url]: initialProfile};
    this.profileFetching = {
      [initialProfile.url]: Promise.resolve(initialProfile)
    };
    this.building = [];
    this.nodes = {};
  }

  build() {
    this.initialProfile.allDescriptors().forEach((descriptor) => {
      let descriptorUrl = `${this.initialProfile.url}#${descriptor.id}`;
      this._connectToParent(descriptorUrl, descriptor);
    });
    return Promise.all(this.building).then(() => this);
  }

  findNode(descriptorUrl) {
    return this.nodes[descriptorUrl];
  }

  printTree() {
    _.values(this.nodes).forEach((node) => {
      if (node.isRoot()) {
        node.printTree();
      }
    });
  }

  _connectToParent(descriptorUrl, descriptor) {
    if (!this.nodes[descriptorUrl]) {
      this.nodes[descriptorUrl] = new TreeNodeExt({name: descriptorUrl, descriptor: descriptor});
    }
    var node = this.nodes[descriptorUrl];
    var parentDescriptorUrl = descriptor.href;
    if (parentDescriptorUrl) {
      var promise = this._fetchDescriptor(parentDescriptorUrl).then((parentDescriptor) => {
        if (parentDescriptor) {
          console.log(`Descriptor ${parentDescriptorUrl} detected.`);
          let parentNode = this._connectToParent(parentDescriptorUrl, parentDescriptor);
          parentNode.addChildNode(node);
        } else {
          console.log(`Descriptor ${parentDescriptorUrl} not found.`);
        }
      }).catch(Done);
      this.building.push(promise);
    }
    return node;
  }

  _fetchDescriptor(descriptorUrl) {
    var [profileUrl, descriptorId] = descriptorUrl.split('#');
    if (!this.profileFetching[profileUrl]) {
      this.profileFetching[profileUrl] = this.fetcher.fetch(profileUrl).then((document) => {
        return Profile.parse(document, profileUrl);
      });
    }
    return this.profileFetching[profileUrl].then((profile) => {
      if (descriptorId) {
        return profile.findDescriptor(descriptorId);
      } else {
        return profile.firstDescriptor();
      }
    });
  }
}

export default Semantics;
