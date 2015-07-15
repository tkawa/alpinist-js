import fetch from 'isomorphic-fetch';

class ProfileFetcher {
  fetch(url, as) {
    if (url.match(/^http:\/\/alps\.io\//)) {
      if (!as) {
        as = url;
      }
      url = `${url}.xml`;
    }
    if (as) {
      console.log(`Fetch: ${url} as ${as}`);
    } else {
      console.log(`Fetch: ${url}`);
    }
    return fetch(url).then((res) => res.text())
  }
}

export default ProfileFetcher;
