/******************************************************************************

Copyright (c) 2016-2018, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

// @format

/* global window */

highed.CreateChartPage = function(parent, userOptions, props) {
  var events = highed.events(),
    builtInOptions = [
      {
        id: 1,
        title: 'Choose Template',
        permission: 'templates',
        create: function(body) {
          highed.dom.ap(body, templateContainer);
        }
      },
      {
        id: 2,
        title: 'Title Your Chart',
        create: function(body) {
          highed.dom.ap(body, titleContainer);
        }
      },
      {
        id: 3,
        title: 'Import Data',
        create: function(body) {
          highed.dom.ap(body, dataTableContainer);
        }
      },
      {
        id: 4,
        title: 'Customize',
        permission: 'customize',
        hideTitle: true,
        create: function(body) {
          highed.dom.ap(body, customizerContainer);
        }
      }
    ],
    container = highed.dom.cr(
      'div',
      'highed-transition highed-toolbox wizard highed-box-size '
    ),
    title = highed.dom.cr('div', 'highed-toolbox-body-title'),
    contents = highed.dom.cr(
      'div',
      'highed-box-size highed-toolbox-inner-body'
    ),
    userContents = highed.dom.cr(
      'div',
      'highed-box-size highed-toolbox-user-contents test-test'
    ),
    body = highed.dom.cr(
      'div',
      'highed-toolbox-body highed-box-size highed-transition'
    ),
    listContainer = highed.dom.cr('div', 'highed-toolbox-createchart-list'),
    isVisible = false,
    customizerContainer = highed.dom.cr('div', 'highed-toolbox-customise'),
    titleContainer = highed.dom.cr('div', 'highed-toolbox-title'),
    templateContainer = highed.dom.cr('div', 'highed-toolbox-template'),
    dataTableContainer = highed.dom.cr('div', 'highed-toolbox-data'),
    //toolbox = highed.Toolbox(userContents),
    options = [];

    function init(dataPage,templatePage, customizePage, chartType) {

      var counter = 1;
      toolbox = highed.Toolbox(userContents);
      builtInOptions.forEach(function(option, index) {
        if (option.permission && userOptions.indexOf(option.permission) === -1) return;

        var o = toolbox.addEntry({
          title: option.title,
          number: counter,//option.id,
          onClick: manualSelection,
          hideTitle: option.hideTitle
        });

        if (highed.isFn(option.create)) {
          option.create(o.body);
        }

        options.push(o);
        counter++;

      });
      options[0].expand();

      createTitleSection();
      createImportDataSection(dataPage, chartType);
      createTemplateSection(templatePage, chartType);
      createCustomizeSection();

      highed.dom.ap(contents, userContents);
      highed.dom.ap(body, contents);
  
      //highed.dom.ap(userContents, listContainer);
      
      highed.dom.ap(parent, highed.dom.ap(container, body));

      expand();
    }


    function createTitleSection() {

      var titleInput = highed.dom.cr('input', 'highed-imp-input'),
          subtitleInput = highed.dom.cr('input', 'highed-imp-input'),
          nextButton = highed.dom.cr(
            'button',
            'highed-ok-button highed-import-button negative',
            'Next'
          ),
          skipAll = highed.dom.cr('span', 'highed-toolbox-skip-all', 'Skip All');

      titleInput.placeholder = 'Enter chart title';
      subtitleInput.placeholder = 'Enter chart subtitle';

      titleInput.value = '';
      subtitleInput.value = '';
      
      highed.dom.on(nextButton, 'click', function() {
        
        if(userOptions && (userOptions.indexOf('templates') === -1)) {
          options[1].expand();
        } else options[2].expand();
        events.emit("SimpleCreateChangeTitle", {
          title: titleInput.value,
          subtitle: subtitleInput.value
        });
      });

      highed.dom.on(skipAll, 'click', function() {
        events.emit("SimpleCreateChartDone", true);
      });

      highed.dom.ap(titleContainer,  
        highed.dom.cr(
          'table'
        ),
        highed.dom.ap(
          highed.dom.cr('tr', 'highed-toolbox-input-container'),
          highed.dom.cr(
            'td',
            'highed-toolbox-label',
            'Chart Title'
          ), 
          highed.dom.ap(highed.dom.cr('td'), titleInput)
        ),
        highed.dom.ap(
          highed.dom.cr('tr', 'highed-toolbox-input-container'),
          highed.dom.cr(
            'td',
            'highed-toolbox-label',
            'Subtitle'
          ), 
          highed.dom.ap(highed.dom.cr('td'), subtitleInput)
        ),
        highed.dom.ap(
          highed.dom.cr('tr'),
          highed.dom.cr('td'),
          highed.dom.ap(
            highed.dom.cr('td','highed-toolbox-button-container'),
            skipAll,
            nextButton
          )
        )
      );   
    }

    function createImportDataSection(dataPage, chartType) {

      var nextButton = highed.dom.cr(
            'button',
            'highed-ok-button highed-import-button negative',
            'No thanks, I will enter my data manually'
          ),
          loader = highed.dom.cr('span','highed-wizard-loader', '<i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>'),
          dataTableDropzoneContainer = dataPage.createSimpleDataTable(chartType, function() {
            if(userOptions && (userOptions.indexOf('templates') === -1)) { 
              options[2].expand();
            } else if(userOptions && (userOptions.indexOf('customize') === -1)) {
              events.emit("SimpleCreateChartDone", true);
            } else options[3].expand();

          }, function(loading) {
            if (loading) loader.classList += ' active';
            else loader.classList.remove('active');
          });

      highed.dom.on(nextButton, 'click', function() {
        if(userOptions && (userOptions.indexOf('templates') === -1)) { 
          options[2].expand();
        } else if(userOptions && (userOptions.indexOf('customize') === -1)) {
          events.emit("SimpleCreateChartDone", true);
        }
        else options[3].expand();
      });
      highed.dom.ap(dataTableContainer, 
        highed.dom.ap(dataTableDropzoneContainer,
          highed.dom.ap(
            highed.dom.cr('div','highed-toolbox-button-container'),
            loader,
            nextButton
          )
        )
      );
    }

    function createTemplateSection(templatePage, chartType) {

      var nextButton = highed.dom.cr(
            'button',
            'highed-ok-button highed-import-button negative',
            'Choose A Template Later'
      ),
      skipAll = highed.dom.ap(highed.dom.cr('div', 'highed-toolbox-skip-all'), highed.dom.cr('span','', 'Skip All'));
      loader = highed.dom.cr('span','highed-wizard-loader ', '<i class="fa fa-spinner fa-spin fa-1x fa-fw a"></i>'),
      templatesContainer = templatePage.createMostPopularTemplates(chartType, function() {
        setTimeout(function() {
          options[1].expand();
        }, 200);
      }, function(loading) {
        if (loading) loader.classList += ' active';
        else loader.classList.remove('active');
      });

      highed.dom.on(skipAll, 'click', function() {
        events.emit("SimpleCreateChartDone", true);
      });
      
      highed.dom.on(nextButton, 'click', function() {
        options[1].expand();
      });

      highed.dom.ap(templateContainer, 
        highed.dom.ap(highed.dom.cr('div', 'highed-toolbox-template-body'),         
          highed.dom.ap(
            highed.dom.cr('div', 'highed-toolbox-text'), 
            highed.dom.cr('div', 'highed-toolbox-template-text', 'Pick a basic starter template. You can change it later.'),
            highed.dom.cr('div', 'highed-toolbox-template-text', "If you're not sure, just hit Choose A Template Later.")
          ),
          highed.dom.ap(
            highed.dom.cr('div', 'highed-toolbox-extras'),
            nextButton,
            highed.dom.ap(
              skipAll,
              loader
            )
          )
        ),
        templatesContainer
      );
    }

    function createCustomizeSection() {

      var nextButton = highed.dom.cr(
            'button',
            'highed-ok-button highed-import-button negative',
            'Customize Your Chart'
          );//,
         // dataTableDropzoneContainer = dataPage.createSimpleDataTable();

      highed.dom.on(nextButton, 'click', function() {
        events.emit("SimpleCreateChartDone");
      });

      highed.dom.ap(customizerContainer, 
        highed.dom.cr('div', 'highed-toolbox-customize-header', "You're Done!"),
        highed.dom.ap(
          highed.dom.cr('div','highed-toolbox-button-container'),
          nextButton
        )
      );
    }

    function manualSelection(number) {
      options.forEach(function(option, i){
        if (i+1 <= number) option.disselect();
        else option.removeCompleted();
      });
    }

    function resize() {
      if (isVisible) {
        expand();
      }
    }

    highed.dom.on(window, 'resize', resize);
    
    function expand() {
      //var bsize = highed.dom.size(bar);

      var newWidth = props.widths.desktop;
      if (highed.onTablet() && props.widths.tablet) newWidth = props.widths.tablet;
      else if (highed.onPhone() && props.widths.phone) newWidth = props.widths.phone;

      highed.dom.style(body, {
        width: 100 + '%',
        //height: //(bsize.h - 55) + 'px',
        opacity: 1
      });

      highed.dom.style(container, {
        width: newWidth + '%'
      });

      events.emit('BeforeResize', newWidth);

    function resizeBody() {
      var bsize = highed.dom.size(body),
      tsize = highed.dom.size(title),
      size = {
        w: bsize.w,
        h: (window.innerHeight
          || document.documentElement.clientHeight
          || document.body.clientHeight) - highed.dom.pos(body, true).y
      };
        
      highed.dom.style(contents, {
        width: size.w + 'px',
        height: ((size.h - 16)) + 'px'
      });
    }

    setTimeout(resizeBody, 300);
    highed.emit('UIAction', 'ToolboxNavigation', props.title);

    }

    function show() {
      highed.dom.style(container, {
        display: 'block'
      });
      isVisible = true;
      //expand();
      
    }
    
    function hide() {
      highed.dom.style(container, {
        display: 'none'
      });
      isVisible = false;
    }

    function destroy() {}

    function getIcons() {
      return null;
    }

  //////////////////////////////////////////////////////////////////////////////

  return {
    on: events.on,
    destroy: destroy,
    hide: hide,
    show: show,
    isVisible: function() {
      return isVisible;
    },
    init: init,
    getIcons: getIcons
  };
};
