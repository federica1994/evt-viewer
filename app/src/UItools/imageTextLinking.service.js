/**
 * @ngdoc service
 * @module evtviewer.UItools
 * @name evtviewer.UItools.evtImageTextLinking
 * @description 
 * # evtImageTextLinking
 * In this service are defined and exposed methods to handle image-text linking tool.
 * @requires evtviewer.interface.evtInterface
 * @requires evtviewer.core.Utils
 * @requires evtviewer.dataHandler.parsedData
 **/
angular.module('evtviewer.UItools')

   .service('evtImageTextLinking', function (evtInterface, Utils, parsedData, imageViewerHandler) {
      var ITLutils = {};
      var zonePrefix = "zone_";
      const linetozoneRegExp = /lb/;
      const zonereplacedString = 'line';

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#turnOnITL
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Turn ON Image-Text linking tool. 
       * ITL is activated using the {@link evtviewer.UItools.evtImageTextLinking#activateITL activateITL} method.
       * The state of the tool is saved in {@link evtviewer.interface.evtInterface evtInterface} service using 
       * {@link evtviewer.interface.evtInterface#setToolStatus setToolStatus} method 
       */
      ITLutils.turnOnITL = function () {
         this.activateITL();
         this.activateHotSpots();
         evtInterface.setToolStatus('ITL', 'active');
         console.log("TurnONITL");
         //document.getElementById("example-overlay").className = "highlight";
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#turnOffITL
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Turn OFF Image-Text linking tool. 
       * The state of the tool is saved in {@link evtviewer.interface.evtInterface evtInterface} service using 
       * {@link evtviewer.interface.evtInterface#setToolStatus setToolStatus} method.
       * The current highlighted zone is set to *undefined* using the 
       * {@link evtviewer.interface.evtInterface#updateCurrentHighlightedZone updateCurrentHighlightedZone} method of
       * {@link evtviewer.interface.evtInterface evtInterface} service
       */
      ITLutils.turnOffITL = function () {
         this.deactivateITL();
         this.deactivateHotSpots();
         evtInterface.setToolStatus('ITL', 'inactive');
         evtInterface.updateCurrentHighlightedZone(undefined);
         this.switchingOffHighlightInImage();
         this.switchingOffHighlightInImageSelected();
         console.log("TurnOFFITL");
         //document.getElementById("example-overlay").className = "nohighlight";

      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#activateITL
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Activate Image-Text linking tool. 
       * The activation includes the preparation of elements in line 
       * ({@link evtviewer.UItools.evtImageTextLinking#prepareLines prepareLines} method.) and 
       * the preparazion of zones in image ({@link evtviewer.UItools.evtImageTextLinking#prepareZoneInImgInteractions prepareZoneInImgInteractions} method).
       */
      ITLutils.activateITL = function () {
         console.log('in activateITL');
         this.prepareLines();
         this.prepareZoneInImgInteractions();
      };

      /**
       * 
       */

      ITLutils.activateHotSpots = function () {
         console.log('in activateHotSpots');
         var hotspotzones = ITLutils.prepareHotSpotZones();
         imageViewerHandler.showHotSpot(hotspotzones);
      };

      ITLutils.prepareHotSpotZones = function () {
         var zonesCollection = parsedData.getZones();
         var zonesIdx = zonesCollection._indexes;
         var zones = [];

         /*
         * zoneid => {
             zones.push(zonesCollection[zoneid]);
         }
         */

         for (var index = 0; index < zonesIdx.length; index++) {
            var zoneId = zonesIdx[index];
            if (zoneId) {
               //console.log('nel for', zoneId);
               var h = zonesCollection[zoneId];
               var hotspotId = zoneId.replace(/ST_hs_/, 'ST_div_hs_');
               var tmpHotSpot;
               console.log('hotSpotId', hotspotId);
               tmpHotSpot = parsedData.getHotSpot(hotspotId);
               if (tmpHotSpot) {
                  h.content = tmpHotSpot.content;
               }
               console.log('hot spot in prepare hotspot', h);
               zones.push(h);
            }

         }

         console.log(zones);
         // probabilmente da spostare sopra
         var hotspotZones = zones.filter(function (zone) {
            //console.log('zone in prepare hot spot', zone);
            return ('HotSpot' === zone.rendition);
         });

         console.log('hotspotzones', hotspotZones);

         //  zones.push(zone);
         //  zones.push({
         //     id: '1',
         //     x: 0.2008,
         //     y: 0.2778,
         //     w: 0.15,
         //     h: 0.10,
         //     content: 'contenuto primo'
         //  });
         //  zones.push({
         //     id: '2',
         //     x: 0.2508,
         //     y: 0.2998,
         //     w: 0.15,
         //     h: 0.10,
         //     content: 'contenuto secondo'
         //  });

         return hotspotZones;
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#turnOffITL
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * De-activate Image-Text linking tool. 
       * Selected zone is unselected and textual nodes inside lines are reset
       * ({@link evtviewer.UItools.evtImageTextLinking#resetTextNodes resetTextNodes} method).
       */
      ITLutils.deactivateITL = function () {
         var currentHzone = evtInterface.getState('currentHighlightedZone');
         // Deselect current selected
         console.log('currentHzone in deactivateITL ' + currentHzone);
         if (currentHzone) {
            this.changeLinesHighlightStatus(currentHzone.id, 'unselect');
         }
         this.resetTextNodes();
      };

      ITLutils.deactivateHotSpots = function () {
         console.log('in deactivateHotSpots');
         var hotspotzones = ITLutils.prepareHotSpotZones();
         imageViewerHandler.hiddenHotSpot(hotspotzones);
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#prepareLines
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Prepare Lines for Image text linking to work properly.
       * Find elements between two different <lb/>s and add info about line.       
       * Text Node are tranformed into <span class="textNode"> in order to be able 
       * to add/remove "lineHover" and "lineSelected" classes
       */
      ITLutils.prepareLines = function () {
         console.log('in prepareLines');
         var lbs = document.getElementsByClassName('lb');
         for (var i = 0; i < lbs.length; i++) {
            var lbId;
            //TODO: handle <lb> with _reg and _orig
            if (i === lbs.length - 1) {
               // Ultima linea da gestire con riferimento diverso
               var nextElem = lbs[i].nextSibling;
               lbId = lbs[i].id;
               while (nextElem && (nextElem.nodeType === 3 || (nextElem.className && nextElem.className.indexOf('inLine') < 0))) {
                  if (nextElem.nodeType === 3) {
                     var newNextTextNode = document.createElement('span');
                     newNextTextNode.className = 'textNode';
                     newNextTextNode.textContent = nextElem.textContent;
                     nextElem.parentElement.replaceChild(newNextTextNode, nextElem);
                     nextElem = newNextTextNode;
                  }
                  this.preapareElementInLine(nextElem, lbId);
                  nextElem = nextElem.nextSibling || lbs[i].parentNode.nextSibling || undefined;
               }
            } else {
               var lbStart = lbs[i],
                  lbEnd = lbs[i + 1];
               //Todo: Handle _reg e _orig
               lbId = lbStart.id;
               if (lbId) {
                  if (lbStart && lbEnd) {
                     var elems = Utils.DOMutils.getElementsBetweenTree(lbStart, lbEnd);
                     for (var el in elems) {
                        var elementInLine = elems[el];
                        if (elementInLine.nodeType === 3) {
                           var newTextNode = document.createElement('span');
                           newTextNode.className = 'textNode';
                           newTextNode.textContent = elementInLine.textContent;
                           elementInLine.parentElement.replaceChild(newTextNode, elementInLine);
                           elementInLine = newTextNode;
                        }
                        this.preapareElementInLine(elementInLine, lbId);
                     }
                  }
               }
            }
         }
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#preapareElementInLine
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Prepare Element that appear in a particular line by adding
       * class "inLine" and an attribute data-line with line ID reference      
       *
       * @param {element} elementInLine element that rests inside a line       
       * @param {string} lineId id of line in qhich element appears  
       */
      ITLutils.preapareElementInLine = function (elementInLine, lineId) {
         if (elementInLine.className && elementInLine.className.indexOf('inLine') < 0) {
            elementInLine.className += ' inLine';
            elementInLine.setAttribute('data-line', lineId);
            elementInLine.onmouseover = function () {
               var lineId = this.getAttribute('data-line');
               ITLutils.changeLinesHighlightStatus(lineId, 'over');
               var zoneId = lineId.replace(linetozoneRegExp, zonereplacedString);
               console.log('zoneID in onmouseover', zoneId);
               ITLutils.highlightZoneInImage(zoneId); //FIXME: il nome della zona deve essere valutata a runtime.
            };
            elementInLine.onmouseout = function () {
               var lineId = this.getAttribute('data-line');
               ITLutils.changeLinesHighlightStatus(lineId, 'out');
               ITLutils.switchingOffHighlightInImage();
            };
            elementInLine.onclick = function () {
               var lineId = this.getAttribute('data-line'),
                  currentHzone = evtInterface.getState('currentHighlightedZone');
               console.log("onclick: ", lineId, currentHzone);

               if (currentHzone && currentHzone.name === 'Line') {
                  // Deselect current selected
                  ITLutils.changeLinesHighlightStatus(currentHzone.id, 'unselect');
                  ITLutils.switchingOffHighlightInImage();
                  ITLutils.switchingOffHighlightInImageSelected();
               }

               // Select this and set current
               if (!currentHzone || (currentHzone.name === 'Line' && currentHzone.id !== lineId)) {
                  evtInterface.updateCurrentHighlightedZone({
                     name: 'Line',
                     id: lineId
                  });
                  ITLutils.changeLinesHighlightStatus(lineId, 'select');
                  ITLutils.selectHighlightedZone(lineId);
               } else {
                  evtInterface.updateCurrentHighlightedZone(undefined);
               }
            };
         }
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#resetTextNodes
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Transform back <span class="textNode"> into actual textNode      
       */
      ITLutils.resetTextNodes = function () {
         console.log("in reset Text Nodes");
         var textNodes = document.getElementsByClassName('textNode');
         for (var i in textNodes) {
            var element = textNodes[i];
            console.log('text node', element);
            if (element && element.textContent) {
               var newTextNode = document.createTextNode(element.textContent);
               element.parentElement.replaceChild(newTextNode, element);
            }
         }
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#changeLinesHighlightStatus
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Change status of elements in a particupar line possible statuses are 'over', 'out', 'select', 'unselect'
       *
       * @param {string} lineId id line of line to change                                                   
       * @param {string} statusToSet new status of line ['over', 'out', 'select', 'unselect'] 
       */
      ITLutils.changeLinesHighlightStatus = function (lineId, statusToSet) {
         var ITLactive = evtInterface.getToolState('ITL') === 'active',
            currentViewMode = evtInterface.getState('currentViewMode');
         if (ITLactive && currentViewMode === 'imgTxt') {
            var elemsInLine = document.querySelectorAll('[data-line=\'' + lineId + '\']');
            for (var i = 0; i < elemsInLine.length; i++) {
               switch (statusToSet) {
                  case 'over':
                     elemsInLine[i].className += ' lineHover';
                     break;
                  case 'out':
                     elemsInLine[i].className = elemsInLine[i].className.replace(' lineHover', '') || '';
                     break;
                  case 'select':
                     elemsInLine[i].className += ' lineSelected';
                     break;
                  case 'unselect':
                     elemsInLine[i].className = elemsInLine[i].className.replace(' lineSelected', '') || '';
                     break;
                  default:
                     break;
               }
            }
         }
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#prepareZoneInImgInteractions
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Prepare Zone in image that hase to be selected when user interacts with a particupar line
       * possible statuses are 'over', 'out', 'select', 'unselect'
       * 
       * @todo Adapt to real viewer, once this is implemented
       */
      ITLutils.prepareZoneInImgInteractions = function () {
         console.log('prepare zone in Image for line linking');
         var tmpZones = document.getElementsByClassName('line-overlay');
         console.log('div precedentemente create:', tmpZones);
         
         if(tmpZones.length == 0){
            console.log('preparo le line zones:');
            var _zones = parsedData.getZones();
            var allZones = _zones._indexes;
            var lineZones = allZones.filter(function(zone){return zone.includes('line')});
         // var zones = _zones.filter(function (zone) {
         //    //console.log('zone in prepare hot spot', zone);
         //    return ('Line' === zone.rendition);
         // });

            console.log('zones in Image for line:', allZones);
            console.log('Filtered zones in Image for line:', lineZones);
         // imageViewerHandler
            for (var i = 0; i < lineZones.length; i++) {
               var lineZone = lineZones[i];
               var divZone = imageViewerHandler.lineZone(parsedData.getZone(lineZone));
            
               console.log('GESTIRE QUI LE FUNZIONI DI GESTIONE RIGHE', divZone);
            //divZone.onmouseover = zoneMouseOver;

            //divZone.onmouseout = zoneMouseOut;

            //divZone.onclick = zoneClick;
            }
         }
       };

      var zoneMouseOver = function () {
         var zoneId = this.getAttribute('data-corresp-id');
         ITLutils.changeLinesHighlightStatus(zoneId, 'over');
      };

      var zoneMouseOut = function () {
         var zoneId = this.getAttribute('data-corresp-id');
         ITLutils.changeLinesHighlightStatus(zoneId, 'out');
      };

      var zoneClick = function () {
         var zoneId = this.getAttribute('data-corresp-id'),
            zoneName = this.getAttribute('data-zone-name'),
            currentHzone = evtInterface.getState('currentHighlightedZone');

         // Deselect current selected
         if (currentHzone) {
            ITLutils.changeLinesHighlightStatus(currentHzone.id, 'unselect');
         }

         // Select this and set current
         if (!currentHzone || (currentHzone.name === zoneName && currentHzone.id !== zoneId)) {
            evtInterface.updateCurrentHighlightedZone({
               name: zoneName,
               id: zoneId
            });
            ITLutils.changeLinesHighlightStatus(zoneId, 'select');
         } else {
            evtInterface.updateCurrentHighlightedZone(undefined);
         }
      };

      /**
       * @ngdoc method
       * @name evtviewer.UItools.evtImageTextLinking#highlightZoneInImage
       * @methodOf evtviewer.UItools.evtImageTextLinking
       *
       * @description
       * Highlight Zone in image
       * 
       * @todo Adapt to real viewer, once this is implemented
       *
       * @param {string} zoneId id of zone to be highlighted
       */
      ITLutils.highlightZoneInImage = function (zoneId) {
         var ITLactive = evtInterface.getToolState('ITL') === 'active';
         if (ITLactive) {
            console.log('zoneId in highlight ITLutils', zoneId);
            var zone = parsedData.getZone(zoneId);
            if (zone) {
               console.log('## HIGHLIGHT ZONE : ', zone);
               // prendi riferimento al viewer
               console.log('## PRENDERE RIFERIMENTO al VIEWER ##');
               imageViewerHandler.highlightOverlay(zone);
               // inserisci overlay alla posizione indicata in zone
               console.log('GESTIRE OVERLAY A PARTIRE DAI DATI ESTRATTI DA ZONE');
            }
         }
      };

      ITLutils.switchingOffHighlightInImage = function () {
         imageViewerHandler.turnOffOverlay();
         //imageViewerHandler.turnOffOverlaySelected();
      };
      ITLutils.switchingOffHighlightInImageSelected = function () {
         imageViewerHandler.turnOffOverlaySelected();
         //imageViewerHandler.turnOffOverlaySelected();
      };

      ITLutils.selectHighlightedZone = function (lineId) {
         console.log("selectHighlightedZone: ", lineId);
         var ITLactive = evtInterface.getToolState('ITL') === 'active';
         if (ITLactive) {
            console.log("ITLactive true - selectHighlightedZone: ", lineId);
            var zone = parsedData.getZone(lineId.replace(linetozoneRegExp, zonereplacedString));
            imageViewerHandler.turnOffOverlaySelected();
            imageViewerHandler.highlightSelectedOverlay(zone, lineId.replace(linetozoneRegExp, zonereplacedString));
            imageViewerHandler.moveToZone(zone);
         }

      };

      return ITLutils;
   });
