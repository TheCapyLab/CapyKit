interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

interface SidebarConfig {
  [key: string]: SidebarItem[];
}

/**
 * Format file/directory name for display
 */
function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Auto-generated sidebar configuration
 * Generated on: 2025-09-25T18:00:45.866Z
 */
export function getSidebarConfig(): SidebarConfig {
  return {
  "/beta-release/": [
    {
      "text": "Overview",
      "link": "/beta-release/"
    },
    {
      "text": "Getting Started",
      "link": "/beta-release/getting-started"
    },
    {
      "text": "Components",
      "link": "/beta-release/components"
    }
  ],
  "/latest/": [
    {
      "text": "Overview",
      "link": "/latest/"
    },
    {
      "text": "Getting Started",
      "link": "/latest/getting-started"
    },
    {
      "text": "Components",
      "link": "/latest/components"
    }
  ],
  "/v0.1.0/": [
    {
      "text": "Overview",
      "link": "/v0.1.0/"
    },
    {
      "text": "Getting Started",
      "link": "/v0.1.0/getting-started"
    },
    {
      "text": "Components",
      "link": "/v0.1.0/components"
    },
    {
      "text": "Component Library",
      "collapsed": false,
      "items": [
        {
          "text": "Forms",
          "items": [
            {
              "text": "Input",
              "link": "/v0.1.0/components/forms/input"
            },
            {
              "text": "Textarea",
              "link": "/v0.1.0/components/forms/textarea"
            }
          ],
          "collapsed": true
        },
        {
          "text": "Layout",
          "items": [
            {
              "text": "Container",
              "link": "/v0.1.0/components/layout/container"
            },
            {
              "text": "Grid",
              "link": "/v0.1.0/components/layout/grid"
            }
          ],
          "collapsed": true
        },
        {
          "text": "Button",
          "link": "/v0.1.0/components/button"
        }
      ]
    }
  ],
  "/v0.2/": [
    {
      "text": "Overview",
      "link": "/v0.2/"
    },
    {
      "text": "Getting Started",
      "link": "/v0.2/getting-started"
    },
    {
      "text": "Components",
      "link": "/v0.2/components"
    },
    {
      "text": "Component Library",
      "collapsed": false,
      "items": [
        {
          "text": "Forms",
          "items": [
            {
              "text": "Input",
              "link": "/v0.2/components/forms/input"
            },
            {
              "text": "Select",
              "link": "/v0.2/components/forms/select"
            }
          ],
          "collapsed": true
        },
        {
          "text": "Layout",
          "items": [
            {
              "text": "Container",
              "link": "/v0.2/components/layout/container"
            },
            {
              "text": "Flex",
              "link": "/v0.2/components/layout/flex"
            }
          ],
          "collapsed": true
        },
        {
          "text": "Navigation",
          "items": [
            {
              "text": "Navbar",
              "link": "/v0.2/components/navigation/navbar"
            }
          ],
          "collapsed": true
        },
        {
          "text": "Button",
          "link": "/v0.2/components/button"
        }
      ]
    }
  ]
};
}