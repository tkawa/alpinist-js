import _ from 'lodash';
import Done from 'promise-done';
import {EventEmitter} from 'events';
import Profile from './profile';
import ProfileFetcher from './profile_fetcher';
import TreeNodeExt from './tree_node_ext';

class Semantics extends EventEmitter {
  constructor(initialProfile, fetcher = new ProfileFetcher()) {
    super();
    this.initialProfile = initialProfile;
    this.fetcher = fetcher;
    this.profileFetching = {
      [initialProfile.url]: Promise.resolve(initialProfile)
    };
    this.nodes = {};
    this.building = new Set();
  }

  build() {
    this.on('start', (descriptorUrl) => {
      this.building.add(descriptorUrl);
    });
    this.on('end', (descriptorUrl) => {
      this.building.delete(descriptorUrl);
      if (this.building.size == 0) {
        this.emit('built');
      }
    });
    this.initialProfile.allDescriptors().forEach((descriptor) => {
      let descriptorUrl = `${this.initialProfile.url}#${descriptor.id}`;
      this._connectToParent(descriptorUrl, descriptor);
    });
    return new Promise((resolve, reject) => {
      this.on('built', () => {
        resolve(this);
      });
    });
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
      this.emit('start', parentDescriptorUrl);
      this._fetchDescriptor(parentDescriptorUrl).then((parentDescriptor) => {
        if (parentDescriptor) {
          console.log(`Descriptor ${parentDescriptorUrl} detected.`);
          let parentNode = this._connectToParent(parentDescriptorUrl, parentDescriptor);
          parentNode.addChildNode(node);
        } else {
          console.log(`Descriptor ${parentDescriptorUrl} not found.`);
        }
      }).then(() => {
        this.emit('end', parentDescriptorUrl);
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
        return profile.firstDescriptor(); // FIXME
      }
    });
  }
}

export default Semantics;
