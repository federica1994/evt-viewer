angular.module('evtviewer.interface')

.service('evtInterface', function(evtCommunication, config, $routeParams, xmlParser, evtSelect, evtBox, evtParser, parsedData) {
    var mainInterface = {};

        mainInterface.boot = function() {        
            evtCommunication.getData(config.dataUrl).then(function () {
                if ( $routeParams.pageId !== undefined ) {
                    mainInterface.updateCurrentPage($routeParams.pageId);
                }
              });
        };

        mainInterface.getCurrentPage = function(){
            var pageSelector = evtSelect.getById('page');
            if ( pageSelector !== 'undefined' ){
                return pageSelector.optionSelected.value;
            }
        };

        mainInterface.getCurrentDocument = function() {
            var pageSelector = evtSelect.getById('page');
            if ( pageSelector !== 'undefined' ){
                return pageSelector.optionSelected.value;
            }
        };

        mainInterface.updateCurrentPage = function(pageId) {
            console.log('#evtInterface#', 'updating current page setting it to ' + pageId);
            var option = { },
                pageSelector = { },
                mainTextBox = { },
                mainImageBox = { },
                text,
                img;
                
            option = parsedData.findPage(pageId);
            
            if ( option !== undefined ) {
                // Updating page Selected
                pageSelector = evtSelect.getById('page');
                // TODO check defined
                pageSelector.optionSelected = option;
                pageSelector.callback(option);
            }
            
            text = parsedData.getPageText(pageId);
            img = parsedData.getPageImage(pageId);

            // Updating mainText Box content
            mainTextBox = evtBox.getById('mainText');
            if ( text !== undefined ) {
                mainTextBox.updateContent(text.diplomatic);
            } else {
                mainTextBox.updateContent('Testo non disponibile.');
            }
            
            // Updating mainImage Box content
            mainImageBox = evtBox.getById('mainImage');
            if ( img !== undefined ) {
                mainImageBox.updateContent('<img src="'+img.url+'" />');
            } else {
                mainImageBox.updateContent('Si è verificato un errore.');
            }
        };

        mainInterface.updateCurrentText = function(textId) {
            console.log('#evtInterface#', 'updating current text setting it to '+textId);
            var text = xmlParser.parse(parsedData.getDocument(textId).content);
            console.log('text', text);
            var sigla = 'B'; 
            var content = evtParser.parseWitnessText(text, sigla);
            console.log('content', content);
            var mainTextBox = evtBox.getById('mainText');
            if ( text !== undefined ) {
                mainTextBox.updateContent(content.innerHTML);
            } else {
                mainTextBox.updateContent('Testo non disponibile.');
            }
        };

        mainInterface.updateParams = function(pageId, textId) {
            console.log('#evtInterface#', 'updating params [Page: ' + pageId + ' | Text: ' + textId+']');
            
            if ( pageId !== undefined ) {
                mainInterface.updateCurrentPage(pageId);
            }

            if ( textId !== undefined ) {
                mainInterface.updateCurrentText(textId);
            }
        };
    return mainInterface;
});