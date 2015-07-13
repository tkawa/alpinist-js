# alpinist

ALPS (Application-Level Profile Semantics) processor

This is currently a work in progress.

## Installation

    $ npm install alpinist

## Usage

See the example below.

## Example

Suppose this ALPS profile were on http://example.com/Rubygem

```json
{
  "alps": {
    "version": "1.0",
    "doc": {
      "format": "text",
      "value": "RubyGem info"
    },
    "descriptor": [
      {
        "id": "RubyGem",
        "type": "semantic",
        "href": "http://alps.io/schema.org/SoftwareApplication#SoftwareApplication",
        "descriptor": [
          {
            "id": "name",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#name"
          },
          {
            "id": "version",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#version"
          },
          {
            "id": "authors",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#author"
          },
          {
            "id": "info",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#description"
          },
          {
            "id": "licenses",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#license"
          },
          {
            "id": "project_uri",
            "type": "safe",
            "href": "http://alps.io/schema.org/SoftwareApplication#url"
          },
          {
            "id": "gem_uri",
            "type": "safe",
            "href": "http://alps.io/schema.org/SoftwareApplication#downloadUrl"
          },
          {
            "id": "homepage_uri",
            "type": "safe",
            "href": "http://alps.io/iana/relations#related"
          },
          {
            "id": "source_code_uri",
            "type": "safe"
          },
          {
            "id": "dependencies",
            "type": "semantic",
            "href": "http://alps.io/schema.org/SoftwareApplication#requirements"
          }
        ]
      }
    ]
  }
}
```

```javascript
import {Profile, ProfileFetcher, Semantics} from 'alpinist';

var baseUrl = 'http://example.com/Rubygem';
var fetcher = new ProfileFetcher();
fetcher.fetch(baseUrl).then((doc) => {
  return Profile.parse(doc, baseUrl);
}).then((profile) => {
  var semantics = new Semantics(profile);
  semantics.build();
  semantics.printTree(); // for debug
});
```
```
* http://alps.io/schema.org/Thing
+---+ http://alps.io/schema.org/CreativeWork
    +---+ http://alps.io/schema.org/SoftwareApplication#SoftwareApplication
        +---> http://example.com/RubyGem#RubyGem
* http://alps.io/schema.org/Thing#name
+---+ http://alps.io/schema.org/SoftwareApplication#name
    +---> http://example.com/RubyGem#name
* http://alps.io/schema.org/CreativeWork#version
+---+ http://alps.io/schema.org/SoftwareApplication#version
    +---> http://example.com/RubyGem#version
* http://alps.io/schema.org/CreativeWork#author
+---+ http://alps.io/schema.org/SoftwareApplication#author
    +---> http://example.com/RubyGem#authors
* http://alps.io/schema.org/Thing#description
+---+ http://alps.io/schema.org/SoftwareApplication#description
    +---> http://example.com/RubyGem#info
* http://example.com/RubyGem#licenses
* http://alps.io/schema.org/Thing#url
+---+ http://alps.io/schema.org/SoftwareApplication#url
    +---> http://example.com/RubyGem#project_uri
* http://alps.io/schema.org/SoftwareApplication#downloadUrl
+---> http://example.com/RubyGem#gem_uri
* http://alps.io/iana/relations#related
+---> http://example.com/RubyGem#homepage_uri
* http://example.com/RubyGem#source_code_uri
* http://alps.io/schema.org/SoftwareApplication#requirements
+---> http://example.com/RubyGem#dependencies
```

## Contributing

1. Fork it ( https://github.com/tkawa/alpinist-js/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
