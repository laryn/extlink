External Links
==============

The External Links module is a very simple approach to adding icons to links to
external websites or e-mail addresses. It is a purely JavaScript implementation,
so the icons are only shown to users that have JavaScript enabled.

Installation
------------

- Install this module using the official Backdrop CMS instructions at
  https://backdropcms.org/guide/modules.

- Visit the configuration page under Administration > Configuration > User
  interface > External links (`admin/config/user-interface/extlink`) to
  fine-tune the settings.

A note about the CSS
--------------------

This module adds a CSS file that is only a few lines in length. You may choose
to move this CSS to your theme to prevent the file from needing to be loaded
separately. To do this:

1) Open the `.info` file for your theme and add this line of code to prevent the
  `extlink.css` file from loading:  
  `stylesheets[all][] = extlink.css`

2) Copy all the code from this module's `css/extlink.css` file into your theme's
  CSS file.

3) Copy the `images/extlink.png` and `images/mailto.png` files to your theme's
  directory.

Note that you DO NOT need to make an `extlink.css` file in your theme.
Specifying the file in your theme's `.info` file is enough to tell Backdrop not
to load this module's version of the CSS.

Issues
------

Bugs and Feature requests should be reported in the Issue Queue:
https://github.com/backdrop-contrib/extlink/issues.

Current Maintainers
-------------------

- [Nate Lampton](https://github.com/quicksketch)
- [Peter Anderson](https://github.com/BWPanda)

Credits
-------

- Ported to Backdrop CMS by [Nate Lampton](https://github.com/quicksketch).
- Originally written for Drupal by
  [Nate Lampton](https://github.com/quicksketch).
- Built by [Robots](https://www.lullabot.com/).

License
-------

This project is GPL v2 software.
See the LICENSE.txt file in this directory for complete text.
