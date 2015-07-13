import _ from 'lodash';
import Profile from './profile';
import {TreeNode} from 'treenode';
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
    this.nodes = {};
  }

  build() {
    this.initialProfile.allDescriptors().reduce((promise, descriptor) => {
      let descriptorUrl = `${this.initialProfile.url}#${descriptor.id}`;
      return promise.then(() => {
        this._connectToParent(descriptorUrl, descriptor);
      });
    }, Promise.resolve());
  }

  findNode(descriptorUrl) {
    return this.nodes[descriptorUrl];
  }

  printTree() {
    console.log(`length: ${this.nodes.keys().length}`);
    _.values(this.nodes).forEach((node) => {
      if (node.isRoot()) {
        // node.printTree();
        console.dir(node);
      }
    });
  }

  _connectToParent(descriptorUrl, descriptor) {
    if (!this.nodes[descriptorUrl]) {
      this.nodes[descriptorUrl] = new TreeNode({name: descriptorUrl, descriptor: descriptor});
    }
    var node = this.nodes[descriptorUrl];
    var parentDescriptorUrl = descriptor.href;
    if (parentDescriptorUrl) {
      var parentDescriptor;
      this._fetchDescriptor(parentDescriptorUrl).then((parentDescriptor) => {
        if (parentDescriptor) {
          console.log(`Descriptor ${parentDescriptorUrl} detected.`);
          let parentNode = this._connectToParent(parentDescriptorUrl, parentDescriptor);
          parentNode.addChild(node);
        } else {
          console.log(`Descriptor ${parentDescriptorUrl} not found.`);
        }
      }).catch(Done);
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
