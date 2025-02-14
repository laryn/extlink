  /**
   * @file
   */

  (function ($) {

    'use strict';

    Backdrop.extlink = Backdrop.extlink || {};

    Backdrop.extlink.attach = function (context, settings) {
      if (!settings.hasOwnProperty('extlink')) {
        return;
      }

      // Strip the host name down, removing ports, subdomains, or www.
      var pattern = /^(([^\/:]+?\.)*)([^\.:]{1,})((\.[a-z0-9]{1,253})*)(:[0-9]{1,5})?$/;
      var host = window.location.host.replace(pattern, '$2$3$6');
      var subdomain = window.location.host.replace(host, '');

      // Determine what subdomains are considered internal.
      var subdomains;
      if (settings.extlink.extSubdomains) {
        subdomains = '([^/]*\\.)?';
      }
      else if (subdomain === 'www.' || subdomain === '') {
        subdomains = '(www\\.)?';
      }
      else {
        subdomains = subdomain.replace('.', '\\.');
      }

      // Build regular expressions that define an internal link.
      var internal_link = new RegExp('^https?://([^@]*@)?' + subdomains + host, 'i');

      // Extra internal link matching.
      var extInclude = false;
      if (settings.extlink.extInclude) {
        extInclude = new RegExp(settings.extlink.extInclude.replace(/\\/, '\\'), 'i');
      }

      // Extra external link matching.
      var extExclude = false;
      if (settings.extlink.extExclude) {
        var excludeRegexpString = '^https?:\\/\\/(\\b(\\w*?(www.)*?' + settings.extlink.extExclude + '\\w*)\\b)';
        extExclude = new RegExp(excludeRegexpString.replace(/\\/, '\\'), 'i');
      }

      // Extra external link CSS selector exclusion.
      var extCssExclude = false;
      if (settings.extlink.extCssExclude) {
        extCssExclude = settings.extlink.extCssExclude;
      }

      // Extra external link CSS selector explicit.
      var extCssExplicit = false;
      if (settings.extlink.extCssExplicit) {
        extCssExplicit = settings.extlink.extCssExplicit;
      }

      // Define the jQuery method (either 'append' or 'prepend') of placing the icon, defaults to 'append'.
      var extIconPlacement = settings.extlink.extIconPlacement || 'append';

      // Find all links which are NOT internal and begin with http as opposed
      // to ftp://, javascript:, etc. other kinds of links.
      // When operating on the 'this' variable, the host has been appended to
      // all links by the browser, even local ones.
      // In jQuery 1.1 and higher, we'd use a filter method here, but it is not
      // available in jQuery 1.0 (Drupal 5 default).
      var external_links = [];
      var mailto_links = [];
      $('a:not([data-extlink]), area:not([data-extlink])', context).each(function (el) {
        try {
          var url = '';
          if (typeof this.href == 'string') {
            url = this.href.toLowerCase();
          }
          // Handle SVG links (xlink:href).
          else if (typeof this.href == 'object') {
            url = this.href.baseVal;
          }
          if (url.indexOf('http') === 0
            && ((!url.match(internal_link) && !(extExclude && url.match(extExclude))) || (extInclude && url.match(extInclude)))
            && !(extCssExclude && $(this).is(extCssExclude))
            && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
            && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
            external_links.push(this);
          }
          // Do not include area tags with begin with mailto: (this prohibits
          // icons from being added to image-maps).
          else if (this.tagName !== 'AREA'
            && url.indexOf('mailto:') === 0
            && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
            && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
            mailto_links.push(this);
          }
        }
        // IE7 throws errors often when dealing with irregular links, such as:
        // <a href="node/10"></a> Empty tags.
        // <a href="http://user:pass@example.com">example</a> User:pass syntax.
        catch (error) {
          return false;
        }
      });

      if (settings.extlink.extClass) {
        Backdrop.extlink.applyClassAndSpan(external_links, settings.extlink.extClass, extIconPlacement);
      }

      if (settings.extlink.mailtoClass) {
        Backdrop.extlink.applyClassAndSpan(mailto_links, settings.extlink.mailtoClass, extIconPlacement);
      }

      if (settings.extlink.extTarget) {
        // Apply the target attribute to all links.
        $(external_links).attr('target', settings.extlink.extTarget);
        // Add rel attributes noopener and noreferrer.
        $(external_links).attr('rel', function (i, val) {
          // If no rel attribute is present, create one with the values noopener and noreferrer.
          if (val == null) {
            return 'noopener noreferrer';
          }
          // Check to see if rel contains noopener or noreferrer. Add what doesn't exist.
          if (val.indexOf('noopener') > -1 || val.indexOf('noreferrer') > -1) {
            if (val.indexOf('noopener') === -1) {
              return val + ' noopener';
            }
            if (val.indexOf('noreferrer') === -1) {
              return val + ' noreferrer';
            }
            // Both noopener and noreferrer exist. Nothing needs to be added.
            else {
              return val;
            }
          }
          // Else, append noopener and noreferrer to val.
          else {
            return val + ' noopener noreferrer';
          }
        });
      }

      Backdrop.extlink = Backdrop.extlink || {};

      // Set up default click function for the external links popup. This should be
      // overridden by modules wanting to alter the popup.
      Backdrop.extlink.popupClickHandler = Backdrop.extlink.popupClickHandler || function () {
        if (settings.extlink.extAlert) {
          return confirm(settings.extlink.extAlertText);
        }
      };

      $(external_links).on('click', function (e) {
        return Backdrop.extlink.popupClickHandler(e, this);
      });
    };

    /**
     * Apply a class and a trailing <span> to all links not containing images.
     *
     * @param {object[]} links
     *   An array of DOM elements representing the links.
     * @param {string} class_name
     *   The class to apply to the links.
     * @param {string} icon_placement
     *   'append' or 'prepend' the icon to the link.
     */
    Backdrop.extlink.applyClassAndSpan = function (links, class_name, icon_placement) {
      var $links_to_process;
      if (Backdrop.settings.extlink.extImgClass) {
        $links_to_process = $(links);
      }
      else {
        var links_with_images = $(links).find('img').parents('a');
        $links_to_process = $(links).not(links_with_images);
      }
      // Add data-extlink attribute.
      $links_to_process.attr('data-extlink', '');
      var i;
      var length = $links_to_process.length;
      for (i = 0; i < length; i++) {
        var $link = $($links_to_process[i]);
        if ($link.css('display') === 'inline' || $link.css('display') === 'inline-block' || $link.css('display') === 'inline-flex') {
          if (Backdrop.settings.extlink.extUseFontAwesome) {
            if (class_name === Backdrop.settings.extlink.mailtoClass) {
              $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="fa fa-envelope-o" title="' + Backdrop.settings.extlink.mailtoLabel + '"></span><span class="element-invisible">' + Backdrop.settings.extlink.mailtoLabel + '</span></span>');
            }
            else {
              $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="fa fa-external-link" title="' + Backdrop.settings.extlink.extLabel + '"></span><span class="element-invisible">' + Backdrop.settings.extlink.extLabel + '</span></span>');
            }
          }
          else {
            if (class_name === Backdrop.settings.extlink.mailtoClass) {
              $link[icon_placement]('<span class="' + class_name + '"><span class="element-invisible">' + Backdrop.settings.extlink.mailtoLabel + '</span></span>');
            }
            else {
              $link[icon_placement]('<span class="' + class_name + '"><span class="element-invisible">' + Backdrop.settings.extlink.extLabel + '</span></span>');
            }
          }
        }
      }
    };

    Backdrop.behaviors.extlink = Backdrop.behaviors.extlink || {};
    Backdrop.behaviors.extlink.attach = function (context, settings) {
      // Backwards compatibility, for the benefit of modules overriding extlink
      // functionality by defining an "extlinkAttach" global function.
      if (typeof extlinkAttach === 'function') {
        extlinkAttach(context);
      }
      else {
        Backdrop.extlink.attach(context, settings);
      }
    };
})(jQuery);
