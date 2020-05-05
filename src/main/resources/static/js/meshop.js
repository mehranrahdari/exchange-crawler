(function () {
// managing dependencies
// var jq = document.createElement('script');
// jq.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
// jq.type = 'text/javascript';
// document.body.appendChild(jq);

// var css = document.createElement("style");
// css.type = "text/css";
// css.innerHTML = "strong { color: red }";
// document.body.appendChild(css);

// ********** managing
// dependencies***********************************************************
    // this css is added in header and is not needed to be loaded multiple times
// var meshopCss = document.createElement('link');
// meshopCss.href = '/resources/common/css/meshop.css';
// meshopCss.rel="stylesheet";
// document.body.appendChild(meshopCss);
// ********** managing
// dependencies***********************************************************


    /**
     * @param $
     */
    (function ($) {

        // submit button function
        $.fn.meshop_submit = function (form, url, params, doneCallback) {
            this.click(function () {
                var elm = $(this).addClass('loading');
                $.post(url, form.serialize() + (params && ("&" + $.param(params, true))), function (data) {
                    doneCallback && doneCallback(data);
                }).always(function () {
                    elm.removeClass('loading');
                })
            });
        };
        $.fn.meshop = function (options) {// jquery render object

            options = $.extend({spinner: true, removeOld: true}, options);
            switch (options.module) {
                case "submit":
                    $().meshop.datagrid.call(this);
                    break;
                case "datagrid":
                    $().meshop.datagrid.call(this);
                    break;
                case undefined:
                case "render":
                    var mainObj = this;
                    // check for template if not specified in selector by user
                    // store template obj and hide untill json recives from server
                    // a bug where template obj is inside another render and gets it's
                    // class overwritten
                    if (!this.data('meshop.template')) {
                        var templateObj = this.find(".meshoptemplate").first();
                        this.data('meshop.template', templateObj);
                        this.data('meshop.template.parent', templateObj.parent());
                        this.data('meshop.template.index', templateObj.index());
                        templateObj.remove();
                    }
                    templateObj = this.data('meshop.template');
                    var oldOnes = this.find(this.data('meshop.template.parent')).children(".meshop-rendered");
                    if (this.is(this.data('meshop.template.parent'))) oldOnes = this.children(".meshop-rendered"); // sometimes
                    // mianobj
                    // is
                    // the
                    // parent
                    // and
                    // `.find`
                    // fails
                    if (options.removeOld)
                        oldOnes.removeClass("fade-in");

                    // templateObj.siblings(".delete").fadeTo(500,1);

                function getDataFromServer() {
                    // show spinner
                    if (options.spinner != false) {
                        var spinner = $("<div class='bubble-loader text-center col-xs-12'><div></div><div></div><div></div><div></div><div></div></div>").hide();
                        if (mainObj.is(mainObj.data('meshop.template.parent'))) {
                            mainObj.prepend(spinner);
                            spinner.fadeIn(1000);
                        } else {
                            mainObj.find(mainObj.data('meshop.template.parent')).prepend(spinner);
                            spinner.fadeIn(1000);
                        }
                    }

                    var url = options.url || "/json/" + options.data + "/load"; // if
                    // url
                    // provided
                    // but
                    // not
                    // generate
                    // from
                    // data
                    // param
                    var parameters = $.param(options.params || {});
                    if (mainObj.data('filterData')) parameters += "&" + mainObj.data('filterData');
                    if (mainObj.data('sortData')) parameters += "&" + mainObj.data('sortData');

                    $[options.get ? 'get' : 'post'](url, meshop.cleanSerialize(parameters), function (data) {  // fields
                        // is
                        // deprecated
                        // and
                        // will
                        // be
                        // removed
                        // after
                        // cleaning
                        // the
                        // code

                        if (options.spinner != false) {
                            spinner.stop().fadeOut(500, function () {
                                $(this).remove()
                            })
                        }
                        // hide
                        // spinner

                        renderAndAddtoDom(data);// called after post is complete

                    }).fail(function () {
                        mainObj.trigger("fail");
                    }).always(function () {
                        if (options.spinner != false) {
                            spinner.fadeOut(200, function () {
                                $(this).remove()
                            })
                        }
                        // hide
                        // spinner
                        mainObj.trigger("always");
                    });
                }


                function renderAndAddtoDom(data) {

                    // for when there is only one elemnt to render
// if(!data.length){data = [data]};

                    // if page was enabled let's also set that
                    if (options.page) {
                        setupPage(data)
                    }


                    var jsonrender = data;
                    if (options.page) {
                        jsonrender = jsonrender.slice(0, jsonrender.length - 1)
                    } // if
                      // page
                      // was
                      // enabled
                      // so
                      // delete
                      // page
                      // as
                      // the
                      // last
                      // element
                      // from
                      // rendering


                    if ((jsonrender instanceof Array && !data.length) || (jsonrender instanceof Object && $.isEmptyObject(jsonrender))) {
                        var emptymsg = mainObj.find(".emptymsg").removeClass("hidden");
                        setTimeout(function () {
                            emptymsg.addClass("in")
                        }, 1);
                        mainObj.trigger("empty");
                        oldOnes.remove();
                    } else {

                        mainObj.find(".emptymsg").addClass("hidden").removeClass("in");

                        // modify Json if an action is defined for it
                        if (typeof options.modifyJson == "function") {
                            var modifiedJson = [];
                            for (var i = 0; i < jsonrender.length; i++) {
                                modifiedJson[i] = options.modifyJson(jsonrender[i], mainObj);
                            }
                            if (!jsonrender.length)
                                modifiedJson = options.modifyJson(jsonrender, mainObj);
                            jsonrender = modifiedJson;
                        }

                        var render = meshop.render(jsonrender, templateObj);

                        var index = mainObj.data('meshop.template.index');
                        var parent = mainObj.find(mainObj.data('meshop.template.parent'));
                        if (!parent.length) parent = mainObj; // sometimes mianobj is
                                                              // the parent and
                                                              // `.find` fails
                        if (options.removeOld) {
                            oldOnes.remove();
                        } else {
                            index = parent.find('.meshop-rendered:last').index();
                        }
                        if (index) {
                            if (parent.find('.bubble-loader').length) index++;
                            parent.children().eq(index - 1).after($(render));
                        } else {
                            parent.prepend($(render));
                        }

                        var renderedItems = parent.children(".meshoptemplate").addClass("meshop-rendered").removeClass("meshoptemplate");

                        setTimeout(function () {
                            renderedItems.addClass("fade-in");
                        }, 1);
                        // setTimeout(function(){renderedItems.removeClass("fade-in");},601);

                        // //init methods
                        meshop.init.data_alert();
                        meshop.init.select2(mainObj);
                        meshop.fillForm(mainObj, data);


                        // loop through rendered items and make chnages need like
                        // setting styles and so one >>> THIS IS CALLED BEFORE
                        // RENDER EVENT WITH PAGE JSON
                        // REMOVED
                        // to make render in render possible we preserve render
                        // html here
                        if (typeof templateObj !== "undefined" && templateObj) { // Added
                            // by
                            // Mehdi
                            var innerTemplates = templateObj.find('.meshoptemplate');

                            var loopNumber = jsonrender instanceof Array ? jsonrender.length : 1;
                            for (var i = 0; i < loopNumber; i++) {
                                // replacing innner render items from template to
                                // make them fresh for later render
                                $.each(innerTemplates, function (index, object) {
                                    renderedItems.eq(i).find('.meshoptemplate').eq(index).replaceWith($(object).clone());
                                });


                                // meshop-hide
                                renderedItems.eq(i).find('[meshop-hide],[meshop-remove]').each(function (index, elm) {
                                    try {
                                        elm = $(elm);
                                        var json = jsonrender[i];
                                        if (eval(elm.attr('meshop-hide')))
                                            elm.addClass('hidden');
                                        if (eval(elm.attr('meshop-remove')))
                                            elm.remove();
                                    } catch (e) {
                                        console.error(elm.attr('meshop-remove') + "_ this is not returnig a boolean");
                                    }
                                });

                                if (typeof options.loop == "function") {
                                    options.loop(renderedItems.eq(i), jsonrender[i], mainObj);
                                }
                            }
                        }
                        if (typeof options.callback == "function") options.callback(mainObj, data);
                        mainObj.trigger("render", [data, renderedItems]);


                    }


                }

                    if (options.json) {
                        renderAndAddtoDom(options.json);
                    } else {
                        getDataFromServer();
                    }



                function setupPage(data) {

                    if (!options.page.length)
                        return;
                    options.page.each(function () {
                        var pageinfo = data[data.length - 1];
                        var oldOnes = $(this).find(".btn-group:eq(1) button");

                        var pagebtn = oldOnes.first().removeClass("active");

                        pageinfo.total = pageinfo.total || 1; // when we filter a page
                                                              // and there is no
                                                              // result page total
                                                              // becomes zero
                        var currentPage = pageinfo.number;
                        var pageWidth = options.pageWidth || 5;
                        if (pageWidth > pageinfo.total) {
                            pageWidth = pageinfo.total
                        }

                        var startNum = currentPage - Math.floor(pageWidth / 2);

                        if (startNum < 1) {
                            startNum = 1;
                        }

                        if ((startNum + pageWidth - 1) > pageinfo.total) {
                            startNum = pageinfo.total - pageWidth + 1;
                        }

                        for (i = 0; i < pageWidth; i++) {
                            var newpbtn = pagebtn.clone();
                            pagebtn.before(newpbtn);
                            newpbtn.data("index", i);
                            var num = startNum + i;
                            newpbtn.text(num).data("pagenum", num);
                        }

                        oldOnes.remove();

                        var firstBtn = $(this).find(".btn-group:eq(0) button:eq(0)").data("pagenum", 1);
                        var preBtn = $(this).find(".btn-group:eq(0) button:eq(1)").data("pagenum", currentPage - 1);

                        var nextBtn = $(this).find(".btn-group:eq(2) button:eq(0)").data("pagenum", currentPage + 1);
                        var lastBtn = $(this).find(".btn-group:eq(2) button:eq(1)").data("pagenum", pageinfo.total).text(pageinfo.total);

                        if (pageinfo.items != undefined) {
                            var totpage = $(this).find(".totalItems").text(meshop.format.sep1000(pageinfo.items));
                        }

                        if (1 == currentPage) {
                            firstBtn.addClass('disabled');
                            preBtn.addClass('disabled');
                        } else {
                            firstBtn.removeClass('disabled');
                            preBtn.removeClass('disabled');
                        }

                        if (pageinfo.total == currentPage) {
                            nextBtn.addClass('disabled');
                            lastBtn.addClass('disabled');
                        } else {
                            nextBtn.removeClass('disabled');
                            lastBtn.removeClass('disabled');
                        }

                        var lastBtnVisible = $(this).find(".btn-group:eq(1) button").filter(function () {
                            return $(this).data('pagenum') == pageinfo.total;
                        }).length;

                        var firstBtnVisible = $(this).find(".btn-group:eq(1) button").filter(function () {
                            return $(this).data('pagenum') == 1;
                        }).length;

                        if (lastBtnVisible) {
                            lastBtn.fadeOut();
                        } else {
                            lastBtn.fadeIn();
                        }

                        if (firstBtnVisible) {
                            firstBtn.fadeOut();
                        } else {
                            firstBtn.fadeIn();
                        }

                        if (pageinfo.total < 2) {
                            $(this).find(".btn-group:eq(1) button").addClass('disabled');
                        } else {
                            $(this).find(".btn-group:eq(1) button").removeClass('disabled');

                            var activebtn = $(this).find(".btn-group:eq(1) button").filter(function () {
                                return $(this).data('pagenum') == currentPage;
                            }).addClass("active");
                            $(this).find("button").filter(function () {
                                return $(this).data('pagenum') && $(this).data('pagenum') != currentPage;
                            }).off("click").one("click", function () {
                                activebtn.removeClass("active");
                                if ($(this).parent().index() == 1) $(this).addClass("active");

                                if (!options.params) {
                                    options.params = {}
                                }
                                options.params.p = $(this).data('pagenum');
                                mainObj.meshop(options);
                            });
                        }


                        $(this).find("select.pageSize").off("change").on("change", function () {
                            if (!options.params) {
                                options.params = {}
                            }
                            options.params.psize = $(this).val();
                            options.params.p = 1;
                            mainObj.meshop(options);
                        });
                    });
                }


                    mainObj.off("meshopRefresh").on("meshopRefresh", function (e, params) {
                        e.stopPropagation();
                        $.extend(true, options, params);
                        mainObj.meshop(options);
                    }); // bind an event to be able to refresh the render

                    // to see if this render contains any sorting objects methods
                    if (!mainObj.data('sortSetup')) {
                        setSortButtons(mainObj, options);
                    }

                    // to see if this render contains any filter form
                    if (options.filterForm) {
                        var form = options.filterForm.is('form') ? options.filterForm : options.filterForm.find('form');
                        if (!form.data('filterSetup')) {

                            form.find('input.rangeslider').each(function (index, obj) {
                                var range = $(obj).ionRangeSlider({
                                    type: "double",
                                    grid: true,
                                    postfix: $(obj).is('[range-postfix]') ? $(obj).attr('range-postfix') : '  <i class="fa fa-try"></i>',
                                    prettify: true,
                                    grid_num: 5
                                })

                            });

                            form.find('input.string-filter').each(function (index, obj) {

                                var ingrp = $('<div class="input-group"/>');
                                $(obj).parent().append(ingrp);
                                ingrp.append($(obj));

                                var btng = $("<div class=input-group-btn/>");
                                var btn = $('<button type="button" class="btn btn-info dropdown-toggle btn-sm " data-toggle="dropdown"/>');
                                btn.append('<span>İçerir</span> <span class="caret"></span>');
                                var ul = $('<ul class="dropdown-menu" role="menu"/>');

                                var li = $('<li><a href="#">İçerir</a></li>');
                                ul.append(li);
                                var li = $('<li><a href="#">Başlar</a></li>');
                                ul.append(li);
                                var li = $('<li><a href="#">Biter</a></li>');
                                ul.append(li);
                                var li = $('<li><a href="#">Eşittir</a></li>');
                                ul.append(li);

                                btng.append(btn);
                                btng.append(ul);

                                var hinput = $('<input name="' + $(obj).attr('name') + 'type" class="hidden" value="1"/>');
                                btng.append(hinput);
                                $(obj).before(btng);

                                ul.find('li').click(function (e) {
                                    e.preventDefault();
                                    btn.find('span').eq(0).text($(this).text());
                                    hinput.val($(this).index() + 1);
                                });
                            });

                            form.find('select.select2').each(function (index, obj) {
                                $(obj).select2({allowClear: true});
                            });

                            form.find('input.select2').each(function (index, obj) {
                                $(obj).select2({tokenSeparators: [",", " "], tags: []});
                            });


                            form.on("filterChange", function () {
                                form.find('input.rangeslider').each(function (index, obj) {
                                    var obj = $(obj);
                                    if (obj.data('min') == obj.data('from') && obj.data('max') == obj.data('to')) $(obj).val('');
                                });
                                var filterData = form.eq(0).serialize();
                                if (form.eq(0).data("oldData") != filterData) {
                                    mainObj.data('filterData', filterData);
                                    meshop.refresh(mainObj, {params: {p: 1}, removeOld: true});
                                }
                                form.eq(0).data("oldData", filterData);
                            });

                            var timerid;
                            form.find('input,select').on("input change", function () {
                                clearTimeout(timerid);
                                timerid = setTimeout(function () {
                                    form.trigger('filterChange');
                                }, 500);
                            });

                            // filter reset button
                            options.filterForm.find('.reset-filter').click(function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                form.find('select').prop("selectedIndex", 0);
                                form.find('select.select2').select2("val", "");
                                form.find('div.select2').select2("val", "");
                                form.find('input.select2').select2("val", "");
                                form.find('input').val("");
                                form.find('[type=checkbox]').prop("checked", false);
                                form.find('input.rangeslider').each(function (i, obj) {
                                    $(obj).data("ionRangeSlider").reset();
                                });
                                form.trigger('filterChange');
                            });


                            form.data('filterSetup', true);
                        }
                    }

                    break;

                default:
                    break;
            }

            return this;

            function setSortButtons(mainObj, options) {
                var sorts = mainObj.data('sortSetup', true).find('[data-sort]');
                var mainSort = {};
                $.each(sorts, function (index, obj) {
                    obj = $(obj);
                    obj.append('<i class="fa fa-sort pull-right"></i>');
                    obj.click(function () {
                        var sort = $(this).data("sort");

                        var dir = $(this).data("dir");
                        switch (dir) {
                            case 0:
                                mainSort[sort] = sort + "-0";
                                obj.addClass("info").find('.fa').removeClass("fa-sort fa-sort-down").addClass('fa-sort-up');
                                break;
                            case undefined:
                                dir = 1;
                            case 1:
                                mainSort[sort] = sort + "-1";
                                obj.addClass("info").find('.fa').removeClass("fa-sort fa-sort-up").addClass('fa-sort-down');
                                break;
                            default:
                                delete mainSort[sort];
                                dir = 2;
                                obj.removeClass("info").find('.fa').removeClass("fa-sort-down fa-sort-up").addClass('fa-sort');
                                break;
                        }
                        var selectedSorts = [];
                        $.each(mainSort, function (i, v) {
                            selectedSorts.push(v);
                        });
                        mainObj.data("sortData", "&sort=" + selectedSorts.join());
                        meshop.refresh(mainObj);
                        $(this).data("dir", dir - 1);
                    });
                });
            }

        };


        // to save and preserve meshoptemplate objects for later uses


        /**
         * Global meshop to set ecommerce functions
         */
        meshop = {// Global Object

            uploadImageSetup: function (imagePanel, baseLocation, params) {
                baseLocation = baseLocation || imagePanel.attr('value');
                if (!baseLocation)
                    console.error('this' + imagePanel.selector + " should have a value to image controller");

                imagePanel.meshop({
                    url: "/adminpanel/json/" + baseLocation + "/load",
                    params: params,
                    loop: loop
                }).on("render", function (e) {
                    e.stopPropagation()
                });

                function loop(obj, json) {

                    obj.find(".download").click(function () {
                        var source = obj.find("img").attr("src");// .replace(/\/([0-9]+)\.jpg/,"/z/$1.jpg");
                        if (source.indexOf("/images/") > -1)
                            source = source.replace(/n\/([0-9]+)\.jpg/, "/z/$1.jpg");
                        var img = $('<a href="' + source + '" download=""></a>')[0].click();
                    });

                    obj.find(".remove").on("click", function () {
                        meshop.alert("ask", "Resim silinecek. emin misiniz?").yes = function () {
                            var removedBanner = obj.fadeOut();
                            var removeData = {name: json.name};
                            $.extend(removeData, params);
                            $.post("/adminpanel/json/" + baseLocation + "/remove", removeData, function () {
                                meshop.refresh(imagePanel);
                            }).fail(function () {
                                removedBanner.show();
                            })
                        }
                    });
                }


                imagePanel.find(".addDrag").on('dragenter', function (e) {
                    $(this).parent().addClass("alert-success");
                });

                imagePanel.find(".addDrag").on('dragleave', function (e) {
                    $(this).parent().removeClass("alert-success");
                });

                imagePanel.find(".addDrag").on('drop', function (e) {
                    $(this).parent().removeClass("alert-success");
                });


                imagePanel.find(".addDrag").off('change').on('change', function (e) {

                    var addDrag = imagePanel.find(".addDrag");


                    // uploading
                    meshop.log("Yükleniyor", " Lütfen bekleyiniz....");
                    var formData = new FormData();
                    var isanyfile;
                    var oo;

                    addDrag.each(function (i, input) {
                        $.each(input.files, function (index, file) {

                            if (!(/\.(jpg)$/i).test(file.name)) {
                                meshop.log("error", "Sadece .jpg biçimi yüklenenilir");
                                addDrag.val("");
                                return;
                            }
                            formData.append("file", file);
                            isanyfile = true;
                        });
                    });

                    if (isanyfile) {
                        imagePanel.find('.progress-bar').css({width: 0}).show(100);
                        imagePanel.find('.progress').show(100);

                        var urlParams = "";
                        if (params) {
                            urlParams = "?" + $.param(params);
                        }

                        $.ajax({
                            url: '/adminpanel/json/' + baseLocation + '/upload' + urlParams,  // Server
                            // script
                            // to
                            // process
                            // data
                            type: 'POST',
                            xhr: function () {  // Custom XMLHttpRequest
                                var myXhr = $.ajaxSettings.xhr();
                                if (myXhr.upload) { // Check if upload property
                                    // exists
                                    myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For
                                    // handling
                                    // the
                                    // progress
                                    // of
                                    // the
                                    // upload
                                }
                                return myXhr;
                            },
                            // Ajax events
                            // Form data
                            data: formData,
                            // Options to tell jQuery not to process data or
                            // worry about content-type.
                            cache: false,
                            contentType: false,
                            processData: false
                        }).done(function (json) {
                            if (json.modal) {
                                console.log(json);
                                meshop.refresh(json.modal);
                            } else {
                                meshop.refresh(imagePanel);
                            }
                        }).fail(function () {
                            meshop.alert("error", "Hata");
                        });
                    }



                });

                imagePanel.find(".browse").click(function () {
                    $(this).closest('.tab-pane').find(".addDrag").click();
                });

                function progressHandlingFunction(e) {
                    if (e.lengthComputable) {
                        var percent = Math.round(e.loaded * 100 / e.total) + "%";
                        imagePanel.find('.progress-bar').css({width: percent});// 45%
                        // Tamamlandı
                        imagePanel.find('.progress-bar span').text(percent + " Tamamlandı");
                        if (percent == "100%") {
                            imagePanel.find('.progress').fadeOut(1000, function () {
                                imagePanel.find('.progress-bar').css({width: 0});
                            });
                        }
                    }
                }

            },

            init: {
                data_alert: function () {
                    $('[meshop-alert]').off('click').click(function () {
                        var modal = meshop.alert($(this).attr('meshop-alert'));
                        if ($(this).attr('meshop-alert-size')) {
                            modal.size($(this).attr('meshop-alert-size'));
                        }
                    });
                },
                ztree: function () {
// $('[meshop-alert]').off('click').click(function(){
// var modal = meshop.alert($(this).attr('meshop-alert'));
// if ($(this).attr('meshop-alert-size')){
// modal.size($(this).attr('meshop-alert-size'));
// }
// });
                },
                select2: function (criteria) {
                    var selects = $('[meshop-select2]');
                    if (criteria)
                        selects = criteria.find('[meshop-select2]');


                    function selectFormatResult(type) {
                        switch (type) {
                            case "product":
                                return productFormatResult;
                            case "user":
                                return userFormatResult;
                            default:
                                return defaultFormatResult;

                        }
                    }

                    function productFormatResult(json) {
                        var markup = '<div class="row">' +
                            '<div class="col-xs-4"><img src="/images/' + json.pic + '/1.jpg" class="img-responsive" /></div>' +
                            '<div class="col-xs-8" style="font-size: 0.9em;">' +
                            '<div class="row">' +
                            '<div class="col-xs-12">' + json.name + '</div>' +
                            '</div>';

                        if (json.barcode) {
                            markup += '<div style="color: #777">' + json.barcode + '</div>';
                        }

                        markup += '</div></div>';

                        return markup;
                    }

                    function userFormatResult(json) {
                        var markup = '<span class="meshop-select2-halftext text-nowrap">' + json.name + '</span><span class="meshop-select2-halftext text-nowrap pull-right">' + json.mail + '</span>';
                        return markup;
                    }

                    function defaultFormatResult(json) {
                        return json.name;
                    }


                    selects.each(function (i, elm) {
                        var elm = $(elm);

                        elm.select2({
                            allowClear: true,
                            ajax: {
                                url: elm.attr('meshop-select2'),
                                dataType: 'json',
                                quietMillis: 300,
                                data: function (term, page) {
                                    var data = {
                                        s: term, // search term
                                        p: page // search page
                                    };

                                    if (elm.attr('select2-relation')) {
                                        data[elm.attr('select2-relation')] = elm.attr('select2-relation-selector') ? $(elm.attr('select2-relation-selector')).val() : $('[name=' + elm.attr('select2-relation') + ']').val();
                                    }
                                    var siblings = elm.siblings(':input[type=hidden]');
                                    if (siblings.length) {
                                        siblings.each(function (ind, sib) {
                                            data[$(sib).attr('name')] = $(sib).val();
                                        });
                                    }
                                    if (elm.attr('select2-group')) {
                                        $.each($(elm.attr('select2-group')).find(':input[name]').addBack(':input[name]').not(elm).serializeArray(), function () {
                                            if (data[this.name] !== undefined) {
                                                if (!data[this.name].push) {
                                                    data[this.name] = [data[this.name]];
                                                }
                                                data[this.name].push(this.value || '');
                                            } else {
                                                data[this.name] = this.value || '';
                                            }
                                        });
// = $('[name='+elm.attr('select2-relation')+']').val();
                                    }
                                    return data;
                                },
                                results: function (data, page) { // parse the
                                    // results
                                    // into the
                                    // format
                                    // expected
                                    // by
                                    // Select2.
                                    var more = false;
                                    try {
                                        if (data.page.total) {
                                            more = page < data.page.total; // whether
                                            // or
                                            // not
                                            // there
                                            // are
                                            // more
                                            // results
                                            // available
                                        } else {
                                            more = page < data.page.more; // whether
                                            // or
                                            // not
                                            // there
                                            // are
                                            // more
                                            // results
                                            // available
                                        }
                                    } catch (e) {
                                        console.error("returned page format from controller is not correct, it should contain more or total");
                                    }
                                    // since we are using custom formatting
                                    // functions we do not need to alter the
                                    // remote JSON data
                                    return {results: data.content, more: more};
                                },
                                cache: true,
                            },
                            multiple: elm.attr('multiple'),
                            minimumInputLength: elm.attr('meshop-select2-min') || 0,
                            dropdownCssClass: "meshop-select2-drop", // apply
                            // css
                            // for
                            // customize
                            escapeMarkup: function (m) {
                                return m;
                            }, // we do
                            // not
                            // want
                            // to
                            // escape
                            // markup
                            // since
                            // we
                            // are
                            // displaying
                            // html
                            // in
                            // results
                            formatResult: selectFormatResult(elm.attr('select2-type')),
                            formatSelection: function (json, div) {

                                switch (elm.attr('select2-type')) {
                                    case "product":
                                        div.attr('title', json.id + '- barcode= ' + json.barcode).text(json.name);
                                        break;
                                    case "user":
                                        div.attr('title', json.id + '- ' + json.name).text(json.mail);
                                        break;
                                    default:
                                        div.attr('title', json.id).text(json.name);
                                        break;

                                }

                            },
                            initSelection: function (element, callback) {
                                try {
                                    if (element.attr('value')) {
                                        var dataValue;
                                        if (elm.attr('multiple')) {
                                            dataValue = [];
                                            $(element.val().split(",")).each(function (index) {
                                                dataValue.push({
                                                    id: element.data("value") + "".split(",")[index],
                                                    name: this + ""
                                                });
                                            });
                                        } else {
                                            dataValue = {};
                                            $(element.val().split(",")).each(function (index) {
                                                dataValue.id = element.data("value") + "".split(",")[index];
                                                dataValue.name = this + "";
                                            });
                                            // element.val("");
                                        }
                                        element.removeAttr("value");
                                        setTimeout(function () {
                                            callback(dataValue)
                                        }, 200);
                                    } else {

                                    }
                                } catch (e) {
                                    console.error('on select2=' + elm.attr('name') + ' init data is not correctly entered');
                                }
                            },
                            openOnEnter: false
                        });

                        if (elm.attr('select2-relation')) {
                            elm.select2("enable", false);
                            var parent = elm.attr('select2-relation-selector') ? $(elm.attr('select2-relation-selector')) : $('[name=' + elm.attr('select2-relation') + ']');
                            parent.on('change', function () {
                                if (parent.val())
                                    elm.select2("enable", true).trigger('change').select2("val", "");
                            });
                        }

                    });

                },
            },
            alert: function (ar1, ar2, ar3, ar4, ar5) {

                var anotherModal = $('body').hasClass('modal-open');
                var msg, title, btn, icon, color;
                var size = "sm";
                msg = ar2;
                title = ar3;
                btn = '<button type="button" class="btn btn-default" data-dismiss="modal">' + (ar4 || 'Kapat') + '</button>';
                color = "";
                switch (ar1) {
                    case "warning":
                    case "warn":
                        icon = 'fa fa-warning';
                        color = "text-warning";
                        break;

                    case "ok":
                    case "success":
                        icon = 'fa fa-check-circle';
                        color = "text-success";

                        break;
                    case "error":
                    case "fail":
                        icon = 'fa fa-times-circle';
                        color = "text-danger";

                        break;
                    case "ask":
                        var btn1 = ar4 || 'Evet';
                        var btn2 = ar5 || 'Hayır';
                        icon = 'fa fa-question-circle';
                        btn = '<button type="button" class="btn btn-primary yes-btn" data-dismiss="modal"><i class="fa fa-check"></i> ' + btn1 + '</button> <button type="button" class="btn btn-default no-btn" data-dismiss="modal"><i class="fa fa-times"></i> ' + btn2 + '</button>';
                        color = "text-primary";

                        break;
                    default:
                        icon = 'fa fa-info-circle';
                        msg = ar1;
                        title = ar2;
                        color = "text-primary";
                        btn = '<button type="button" class="btn btn-default" data-dismiss="modal">' + (ar3 || 'Kapat') + '</button>';

                }

                if (!title)
                    title = '';


                var modal = $('<div class="modal fade">\
    					  <div class="modal-dialog modal-' + size + '">\
    					    <div class="modal-content">\
    					      <div class="modal-header">\
    					        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
    					        <h4 class="modal-title"> <i class="fa-lg ' + icon + '"></i> ' + title + '</h4>\
    					      </div>\
    					      <div class="modal-body">\
    					        <p>' + msg + '</p>\
    					      </div>\
    					      <div class="modal-footer">\
    					        ' + btn + '</div>\
    					    </div>\
    					  </div>\
    					</div>');

                $('body').append(modal);
                modal.modal('show')
                    .on('hidden.bs.modal', function (e) {
                        if (modal.close instanceof Function) modal.close();
                        modal.remove();
                        if (anotherModal)
                            $('body').addClass('modal-open');
                    });
                modal.find(".yes-btn").each(function (i, btn) {
                    $(btn).click(function () {
                        if (modal.yes instanceof Function) modal.yes();
                    });
                });
                modal.find(".no-btn").each(function (i, btn) {
                    $(btn).click(function () {
                        if (modal.no instanceof Function) modal.no();
                    });
                });
                modal.size = function (size) {
                    modal.find(".modal-dialog").attr('class', '').addClass('modal-dialog modal-' + size);
                    return modal;
                };
                modal.addBtn = function (name, fn, style, icon) {
                    var btn = $('<button type="button" class="btn btn-' + (style || 'default') + ' " data-dismiss="modal"><i class="fa fa-' + icon + '"></i> ' + name + '</button> ');

                    modal.find(".modal-footer").append(btn);
                    if (fn instanceof Function)
                        btn.click(fn);

                    return modal;
                };
                modal.icon = function (name, style, icon) {
                    modal.find(".modal-dialog").attr('class', '').addClass('modal-dialog modal-' + size);
                };
                return modal;
            },
            log: function (ar1, ar2, ar3) {
                var icon, msg, title, style;
                msg = ar2;
                title = ar3;
                switch (ar1) {
                    case "warning":
                    case "warn":
                        icon = 'fa fa-warning';
                        style = "warning";
                        break;
                    case "error":
                    case "fail":
                        icon = 'fa fa-times-circle';
                        style = "danger";

                        break;
                    case "success":
                    case "ok":
                        icon = 'fa fa-check-circle';
                        style = "success";

                        break;
                    default:
                        msg = ar1;
                        title = ar2;
                        icon = 'fa fa-info-circle';
                        style = "info";
                }

                if (!title)
                    title = '';


                $.growl({title: " " + title + "<br/>", message: msg, icon: icon}, {
                    placement: {
                        from: "bottom"
                    },
                    type: style,
                    mouse_over: "pause",
                    z_index: 2031

                });
            },
            copyToClipboard: function (text) {
                var $temp = $("<input>");
                $("body").append($temp);
                $temp.val(text).select();
                document.execCommand("copy");
                $temp.remove();
                meshop.log('success', 'Başarıyla kopiyalandi');
            },
            generateUrl: function (obj) {
                return encodeUrl("/urun/" + obj.barcode + "/" + obj.name.replace(/\s/g, "-"));
            },
            replaceAll: function (str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            },
            check: { // used in forms mostly to check for user input
                select: function (obj) {
                    if (obj.prop('selectedIndex') > 0) {
                        this.validate(obj);
                        return true;
                    }
                    this.inValidate(obj);
                    return false;
                },
                length: function (obj, len) {
                    try {
                        if (obj.val().trim().length < len) {
                            this.inValidate(obj);
                            return false;
                        }
                        this.validate(obj);
                    } catch (e) {
                        console.error(obj.selector, " returned undefined " + e);
                        return false;
                    }
                    return true;
                },
                isnumeric: function (obj) {
                    try {
                        if (isNaN(obj.val().replace(",", ".").trim())) {
                            this.inValidate(obj);
                            return false;
                        }
                        this.validate(obj);
                    } catch (e) {
                        console.error(obj.selector, " returned undefined " + e);
                        return false;
                    }
                    return true;
                },
                email: function (obj) {
                    var regexmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                    if (!regexmail.test(obj.val())) {
                        this.inValidate(obj);
                        return false;
                    }

                    this.validate(obj);
                    return true;
                },
                checkbox: function (obj) {

                    if (obj.prop('checked')) {
                        this.validate(obj);
                        return true;
                    }

                    this.inValidate(obj);
                    return false;

                },
                match: function (obj, val) {

                    if (obj.val() == val) {
                        this.validate(obj);
                        return true;
                    }

                    this.inValidate(obj);
                    return false;

                },
                validate: function (obj) {
                    var span = $('<span/>').addClass("glyphicon glyphicon-ok form-control-feedback");
                    var formgroup = obj.closest(".form-group").addClass('has-success').removeClass('has-error');
                    formgroup.find('span.form-control-feedback').remove();
                    if (formgroup.hasClass('has-feedback'))
                        formgroup.append(span);
                },
                inValidate: function (obj) {
                    var span = $('<span/>').addClass("glyphicon glyphicon-remove form-control-feedback");
                    var formgroup = obj.closest(".form-group").removeClass('has-success, has-error');
                    setTimeout(function () {
                        formgroup.addClass('has-error');
                    }, 10);
                    formgroup.find('span.form-control-feedback').remove();
                    if (formgroup.hasClass('has-feedback'))
                        formgroup.append(span);
                },
                clearValidate: function (obj) {
                    var formgroup = obj.closest(".form-group").removeClass('has-success has-error');
                    if (formgroup.hasClass('has-feedback')) formgroup.children('span.form-control-feedback').remove();
                }
            },
            elm: { // mostly used formatted elements
                numOnlyInput: function (objs, noSeperator, maxDigits) { // makes
                    // inputs
                    // accept
                    // only
                    // numbers
                    // and
                    // seperate
                    // them by
                    // 1000
                    objs.each(function (i, obj) {
                        $(obj).on('input', function () {

                            var inval = meshop.format.onlyNum(this.value);
                            if (maxDigits) {
                                inval = inval.length > maxDigits ? inval.substring(0, maxDigits) : inval;  // limit
                                                                                                           // to
                                                                                                           // 12
                                                                                                           // digit
                            }
                            var formatted = !noSeperator ? meshop.format.sep1000(inval) : meshop.format.onlyNum(inval);

                            var start = this.selectionStart,
                                end = this.selectionEnd;

                            this.value = formatted;

                            this.setSelectionRange(start, end);

                        });
                    });
                    return objs;
                }
            },
            format: { // mostly used format functions
                sep1000: function (str) { // seperate numbers by 3 and add ,
                    return String(str).replace(/(\d)(?=(\d{3})+\b)/g, '$&,');
                },
                onlyNum: function (str) { // seperate numbers by 3 and add ,
                    return str.replace(/[^0-9,.]/g, "");
                }
            },
            BS: {

                activeTabsHashLink: function () {
                    $('ul.nav.nav-tabs a:first').tab('show'); // Select first
                    // tab
                    $('ul.nav.nav-tabs a[href="' + window.location.hash + '"]').tab('show'); // Select
                    // tab
                    // by
                    // name
                    // if
                    // provided
                    // in
                    // location
                    // hash
                    $('ul.nav.nav-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (event) {    // Update
                        // the
                        // location
                        // hash
                        // to
                        // current
                        // tab
                        window.location.hash = event.target.hash;
                    });

                }
            },
            cleanSerialize: function (str) {
                return str.replace(/[^&]+=&/g, '').replace(/&[^&]+=$/g, '').replace(/^[^&]+=$/g, '');
            },
            isMobile: function () {
                return ($(window).innerWidth() < 750);
            },
            fillForm: function (form, obj) {
                $.each(obj, function (key, value) {
                    form.find("input[name=" + key + "]:not([type=radio],[type=checkbox] ),textarea[name=" + key + "]").val(value);
                });

                form.find('[type=checkbox][name]').each(function (index, chk) {
                    try {
                        $(chk).prop("checked", obj[$(this).attr('name')]);
                    } catch (e) {
                        console.error(e.message);
                    }
                });

                form.find('.meshop-switch:not(.switch-on) input:first-of-type').each(function (i, input) {
                    input = $(input);
                    if (obj[input.attr('name')]) {
                        input.prop("checked", true);
                    } else {
                        input.siblings('input').prop("checked", true);
                    }
                    input.parent().on('change', function () {
                        if (input.is(':checked')) {
                            $('[switch-relation=' + input.attr("name") + ']').prop('disabled', false);
                        } else {
                            $('[switch-relation=' + input.attr("name") + ']').prop('disabled', true);
                        }
                    }).trigger('change');
                });

                form.find('.meshop-switch.switch-on input:first-of-type').each(function (i, input) {
                    input = $(input);
                    if (input.attr('name') && obj[input.attr('name')] != undefined) {
                        input.parent().find('input[value=' + obj[input.attr('name')] + ']').prop("checked", true);
                    }
                });

                form.find('[meshop-select2]').each(function (i, input) {
                    input = $(input);
                    input.select2('data', obj[input.attr('name')]);
                    if (input.val())
                        input.trigger('change');
                });

                form.find('select[name]').each(function (i, input) {
                    try {
                        input = $(input);
                        input.find('option[value=' + obj[input.attr('name')] + ']').prop('selected', true);
                    } catch (e) {
                        console.error(e.message);
                    }
                });

            },
            refresh: function (obj, params) {
                obj.trigger('meshopRefresh', params); // THIS function is set
                // on meshop.render and
                // can be used to repeat
                // the render again
                return obj;
            },
            render: function (json, template) {
                if ((json instanceof Array && !json.length) || (json instanceof Object && $.isEmptyObject(json))) return "";
                var output = "";
                var inner = {};
                if (!json instanceof Object) {
                    json = JSON.parse(json)
                }

                if (!json.length) {
                    json = [json]
                }
                 // TODO: should be checked
                // later THIS is already
                // covered in
                // meshop.render() function
                // but brought here again
                // for when called
                // explicitly
                if (typeof template !== "undefined" && template) { // Added by Mehdi
                    if (template instanceof Object) {
                        template = template[0].outerHTML
                    }


                    $.each(json, function (j, obj) { // loop through each item and
                        // add it to parent

                        // to make multiple render also possible we store old
                        // templates
                        var subTemps = $(template).find(".meshoptemplate");

                        var rendered = template;

                        $.each(obj, function (key, value) {

                            rendered = replaceKey(key, value, rendered);
                            rendered = checkForInnerObjAndRender(key, value, rendered);// for
                            // array
                            // inside
                            // json
                            // and
                            // sub
                            // objects

                        });
                        rendered = rendered.replace(/meshop:/g, "").replace(/meshop-attr="(.+?)"/g, "$1").replace(/##[\w\.]+##/g, ""); // clean
                        // all
                        // empty
                        // values
                        // which
                        // json
                        // had
                        // no
                        // value
                        // for
                        // them
                        // //convert
                        // meshopsrc
                        // to
                        // normal
                        // src
                        // //also
                        // convert
                        // attribute
                        // values
                        var rendered = $(rendered);
                        var subTempElms = rendered.find(".meshoptemplate");

                        subTempElms.replaceWith(function () {
                            return subTemps.eq(subTempElms.index($(this)));
                        });

                        output += rendered.prop("outerHTML");
                    });
                }
                output = output;
                return output;
            }

        };

        function checkForInnerObjAndRender(key, value, rendered) {

            if (value instanceof Object) {
                if (value instanceof Array) {
                    var outputInner = "";
                    var tempInner = $(rendered);
                    var inner = tempInner.find('[data-render="' + key + '"]');
                    $.each(inner, function (index, innerObj) {

                        $.each(value, function (i, v) {
                            var renderedInner = innerObj.outerHTML;
                            $.each(v, function (vi, vvalue) {
                                renderedInner = replaceKey(key + "." + vi, vvalue, renderedInner);
                                renderedInner = checkForInnerObjAndRender(key + "." + vi, vvalue, renderedInner);// for
                                // array
                                // inside
                                // json
                                // and
                                // sub
                                // objects
                            });
                            outputInner += renderedInner;
                        });

                        tempInner.find(innerObj).before(outputInner).remove();
                        rendered = tempInner[0].outerHTML;
                        outputInner = ""; // to reset output if more than one obj
                        // were found

                    });

                } else {
                    var renderedInner = rendered;
                    $.each(value, function (vi, vvalue) {
                        renderedInner = replaceKey(key + "." + vi, vvalue, renderedInner);
                        renderedInner = checkForInnerObjAndRender(key + "." + vi, vvalue, renderedInner);// for
                        // array
                        // inside
                        // json
                        // and
                        // sub
                        // objects
                    });
                    rendered = renderedInner;
                }
            }


            return rendered;
        }

        function replaceKey(key, value, string) {
            var tempkey = "##" + key + "##";
            var innerReg = new RegExp(tempkey, "gi");

            if (typeof string !== "undefined" && string) { // Fixed By Mehdi
                string = string.replace(innerReg, value);
                return string;
            }
        }

        // /////init method ///////////////
        meshop.init.data_alert();
        // //END///init method ///////////////

    })(jQuery);


// //////////////////very common and small plugins/////////////////////
// for performance putting libraries here to load them at once

// =====================================================================================================================
// =====================================================================================================================
// Ion.RangeSlider | version 2.0.2 | https://github.com/IonDen/ion.rangeSlider
    (function (e, s, g, q, u) {
        var t = 0, p = function () {
            var a = q.userAgent, b = /msie\s\d+/i;
            return 0 < a.search(b) && (a = b.exec(a).toString(), a = a.split(" ")[1], 9 > a) ? (e("html").addClass("lt-ie9"), !0) : !1
        }(), l = "ontouchstart" in g || 0 < q.msMaxTouchPoints;
        Function.prototype.bind || (Function.prototype.bind = function (a) {
            var b = this, c = [].slice;
            if ("function" != typeof b) throw new TypeError;
            var d = c.call(arguments, 1), h = function () {
                if (this instanceof h) {
                    var f = function () {
                    };
                    f.prototype = b.prototype;
                    var f = new f, k = b.apply(f, d.concat(c.call(arguments)));
                    return Object(k) === k ? k : f
                }
                return b.apply(a, d.concat(c.call(arguments)))
            };
            return h
        });
        var r = function (a, b, c) {
            this.VERSION = "2.0.2";
            this.input = a;
            this.plugin_count = c;
            this.old_to = this.old_from = this.calc_count = this.current_plugin = 0;
            this.raf_id = null;
            this.is_update = this.is_key = this.force_redraw = this.dragging = !1;
            this.is_start = !0;
            this.is_click = this.is_resize = this.is_active = !1;
            this.$cache = {
                win: e(g),
                body: e(s.body),
                input: e(a),
                cont: null,
                rs: null,
                min: null,
                max: null,
                from: null,
                to: null,
                single: null,
                bar: null,
                line: null,
                s_single: null,
                s_from: null,
                s_to: null,
                shad_single: null,
                shad_from: null,
                shad_to: null,
                grid: null,
                grid_labels: []
            };
            a = this.$cache.input;
            a = {
                type: a.data("type"),
                min: a.data("min"),
                max: a.data("max"),
                from: a.data("from"),
                to: a.data("to"),
                step: a.data("step"),
                min_interval: a.data("minInterval"),
                max_interval: a.data("maxInterval"),
                drag_interval: a.data("dragInterval"),
                values: a.data("values"),
                from_fixed: a.data("fromFixed"),
                from_min: a.data("fromMin"),
                from_max: a.data("fromMax"),
                from_shadow: a.data("fromShadow"),
                to_fixed: a.data("toFixed"),
                to_min: a.data("toMin"),
                to_max: a.data("toMax"),
                to_shadow: a.data("toShadow"),
                prettify_enabled: a.data("prettifyEnabled"),
                prettify_separator: a.data("prettifySeparator"),
                force_edges: a.data("forceEdges"),
                keyboard: a.data("keyboard"),
                keyboard_step: a.data("keyboardStep"),
                grid: a.data("grid"),
                grid_margin: a.data("gridMargin"),
                grid_num: a.data("gridNum"),
                grid_snap: a.data("gridSnap"),
                hide_min_max: a.data("hideMinMax"),
                hide_from_to: a.data("hideFromTo"),
                prefix: a.data("prefix"),
                postfix: a.data("postfix"),
                max_postfix: a.data("maxPostfix"),
                decorate_both: a.data("decorateBoth"),
                values_separator: a.data("valuesSeparator"),
                disable: a.data("disable")
            };
            a.values = a.values && a.values.split(",");
            b = e.extend(a, b);
            this.options = e.extend({
                type: "single",
                min: 10,
                max: 100,
                from: null,
                to: null,
                step: 1,
                min_interval: 0,
                max_interval: 0,
                drag_interval: !1,
                values: [],
                p_values: [],
                from_fixed: !1,
                from_min: null,
                from_max: null,
                from_shadow: !1,
                to_fixed: !1,
                to_min: null,
                to_max: null,
                to_shadow: !1,
                prettify_enabled: !0,
                prettify_separator: " ",
                prettify: null,
                force_edges: !1,
                keyboard: !1,
                keyboard_step: 5,
                grid: !1,
                grid_margin: !0,
                grid_num: 4,
                grid_snap: !1,
                hide_min_max: !1,
                hide_from_to: !1,
                prefix: "",
                postfix: "",
                max_postfix: "",
                decorate_both: !0,
                values_separator: " \u2014 ",
                disable: !1,
                onStart: null,
                onChange: null,
                onFinish: null,
                onUpdate: null
            }, b);
            this.validate();
            this.result = {
                input: this.$cache.input,
                slider: null,
                min: this.options.min,
                max: this.options.max,
                from: this.options.from,
                from_percent: 0,
                from_value: null,
                to: this.options.to,
                to_percent: 0,
                to_value: null
            };
            this.coords = {
                x_gap: 0,
                x_pointer: 0,
                w_rs: 0,
                w_rs_old: 0,
                w_handle: 0,
                p_gap: 0,
                p_gap_left: 0,
                p_gap_right: 0,
                p_step: 0,
                p_pointer: 0,
                p_handle: 0,
                p_single: 0,
                p_single_real: 0,
                p_from: 0,
                p_from_real: 0,
                p_to: 0,
                p_to_real: 0,
                p_bar_x: 0,
                p_bar_w: 0,
                grid_gap: 0,
                big_num: 0,
                big: [],
                big_w: [],
                big_p: [],
                big_x: []
            };
            this.labels = {
                w_min: 0,
                w_max: 0,
                w_from: 0,
                w_to: 0,
                w_single: 0,
                p_min: 0,
                p_max: 0,
                p_from: 0,
                p_from_left: 0,
                p_to: 0,
                p_to_left: 0,
                p_single: 0,
                p_single_left: 0
            };
            this.init()
        };
        r.prototype = {
            init: function (a) {
                this.coords.p_step = this.options.step / ((this.options.max - this.options.min) / 100);
                this.target = "base";
                this.toggleInput();
                this.append();
                this.setMinMax();
                if (a) {
                    if (this.force_redraw = !0, this.calc(!0), this.options.onUpdate && "function" === typeof this.options.onUpdate) this.options.onUpdate(this.result)
                } else if (this.force_redraw = !0, this.calc(!0), this.options.onStart && "function" === typeof this.options.onStart) this.options.onStart(this.result);
                this.updateScene();
                this.raf_id = requestAnimationFrame(this.updateScene.bind(this))
            }, append: function () {
                this.$cache.input.before('<span class="irs js-irs-' + this.plugin_count + '"></span>');
                this.$cache.input.prop("readonly",
                    !0);
                this.$cache.cont = this.$cache.input.prev();
                this.result.slider = this.$cache.cont;
                this.$cache.cont.html('<span class="irs"><span class="irs-line" tabindex="-1"><span class="irs-line-left"></span><span class="irs-line-mid"></span><span class="irs-line-right"></span></span><span class="irs-min">0</span><span class="irs-max">1</span><span class="irs-from">0</span><span class="irs-to">0</span><span class="irs-single">0</span></span><span class="irs-grid"></span><span class="irs-bar"></span>');
                this.$cache.rs =
                    this.$cache.cont.find(".irs");
                this.$cache.min = this.$cache.cont.find(".irs-min");
                this.$cache.max = this.$cache.cont.find(".irs-max");
                this.$cache.from = this.$cache.cont.find(".irs-from");
                this.$cache.to = this.$cache.cont.find(".irs-to");
                this.$cache.single = this.$cache.cont.find(".irs-single");
                this.$cache.bar = this.$cache.cont.find(".irs-bar");
                this.$cache.line = this.$cache.cont.find(".irs-line");
                this.$cache.grid = this.$cache.cont.find(".irs-grid");
                "single" === this.options.type ? (this.$cache.cont.append('<span class="irs-bar-edge"></span><span class="irs-shadow shadow-single"></span><span class="irs-slider single"></span>'),
                    this.$cache.s_single = this.$cache.cont.find(".single"), this.$cache.from[0].style.visibility = "hidden", this.$cache.to[0].style.visibility = "hidden", this.$cache.shad_single = this.$cache.cont.find(".shadow-single")) : (this.$cache.cont.append('<span class="irs-shadow shadow-from"></span><span class="irs-shadow shadow-to"></span><span class="irs-slider from"></span><span class="irs-slider to"></span>'), this.$cache.s_from = this.$cache.cont.find(".from"), this.$cache.s_to = this.$cache.cont.find(".to"), this.$cache.shad_from =
                    this.$cache.cont.find(".shadow-from"), this.$cache.shad_to = this.$cache.cont.find(".shadow-to"));
                this.options.hide_from_to && (this.$cache.from[0].style.display = "none", this.$cache.to[0].style.display = "none", this.$cache.single[0].style.display = "none");
                this.appendGrid();
                this.options.disable ? this.appendDisableMask() : (this.$cache.cont.removeClass("irs-disabled"), this.bindEvents())
            }, appendDisableMask: function () {
                this.$cache.cont.append('<span class="irs-disable-mask"></span>');
                this.$cache.cont.addClass("irs-disabled")
            },
            remove: function () {
                this.$cache.cont.remove();
                this.$cache.cont = null;
                this.$cache.line.off("keydown.irs_" + this.plugin_count);
                l ? (this.$cache.body.off("touchmove.irs_" + this.plugin_count), this.$cache.win.off("touchend.irs_" + this.plugin_count)) : (this.$cache.body.off("mousemove.irs_" + this.plugin_count), this.$cache.win.off("mouseup.irs_" + this.plugin_count), p && (this.$cache.body.off("mouseup.irs_" + this.plugin_count), this.$cache.body.off("mouseleave.irs_" + this.plugin_count)));
                this.$cache.grid_labels = [];
                this.coords.big =
                    [];
                this.coords.big_w = [];
                this.coords.big_p = [];
                this.coords.big_x = [];
                cancelAnimationFrame(this.raf_id)
            }, bindEvents: function () {
                if (l) {
                    this.$cache.body.on("touchmove.irs_" + this.plugin_count, this.pointerMove.bind(this));
                    this.$cache.win.on("touchend.irs_" + this.plugin_count, this.pointerUp.bind(this));
                    this.$cache.line.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
                    if (this.options.drag_interval && "double" === this.options.type) this.$cache.bar.on("touchstart.irs_" + this.plugin_count,
                        this.pointerDown.bind(this, "both")); else this.$cache.bar.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
                    "single" === this.options.type ? (this.$cache.s_single.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "single")), this.$cache.shad_single.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"))) : (this.$cache.s_from.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "from")), this.$cache.s_to.on("touchstart.irs_" + this.plugin_count,
                        this.pointerDown.bind(this, "to")), this.$cache.shad_from.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click")), this.$cache.shad_to.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click")))
                } else {
                    if (this.options.keyboard) this.$cache.line.on("keydown.irs_" + this.plugin_count, this.key.bind(this, "keyboard"));
                    this.$cache.body.on("mousemove.irs_" + this.plugin_count, this.pointerMove.bind(this));
                    this.$cache.win.on("mouseup.irs_" + this.plugin_count, this.pointerUp.bind(this));
                    p && (this.$cache.body.on("mouseup.irs_" + this.plugin_count, this.pointerUp.bind(this)), this.$cache.body.on("mouseleave.irs_" + this.plugin_count, this.pointerUp.bind(this)));
                    this.$cache.line.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
                    if (this.options.drag_interval && "double" === this.options.type) this.$cache.bar.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "both")); else this.$cache.bar.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
                    "single" === this.options.type ? (this.$cache.s_single.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "single")), this.$cache.shad_single.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"))) : (this.$cache.s_from.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "from")), this.$cache.s_to.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "to")), this.$cache.shad_from.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click")),
                        this.$cache.shad_to.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click")))
                }
            }, pointerMove: function (a) {
                this.dragging && (this.coords.x_pointer = (l ? a.originalEvent.touches[0] : a).pageX - this.coords.x_gap, this.calc())
            }, pointerUp: function (a) {
                if (this.current_plugin === this.plugin_count && this.is_active) {
                    this.is_active = !1;
                    var b = this.options.onFinish && "function" === typeof this.options.onFinish;
                    a = e.contains(this.$cache.cont[0], a.target) || this.dragging;
                    if (b && a) this.options.onFinish(this.result);
                    this.force_redraw = !0;
                    this.dragging = !1;
                    p && e("*").prop("unselectable", !1)
                }
            }, pointerDown: function (a, b) {
                b.preventDefault();
                var c = l ? b.originalEvent.touches[0] : b;
                if (2 !== b.button) {
                    this.current_plugin = this.plugin_count;
                    this.target = a;
                    this.dragging = this.is_active = !0;
                    this.coords.x_gap = this.$cache.rs.offset().left;
                    this.coords.x_pointer = c.pageX - this.coords.x_gap;
                    this.calcPointer();
                    switch (a) {
                        case "single":
                            this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_single);
                            break;
                        case "from":
                            this.coords.p_gap =
                                this.toFixed(this.coords.p_pointer - this.coords.p_from);
                            this.$cache.s_from.addClass("type_last");
                            this.$cache.s_to.removeClass("type_last");
                            break;
                        case "to":
                            this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_to);
                            this.$cache.s_to.addClass("type_last");
                            this.$cache.s_from.removeClass("type_last");
                            break;
                        case "both":
                            this.coords.p_gap_left = this.toFixed(this.coords.p_pointer - this.coords.p_from), this.coords.p_gap_right = this.toFixed(this.coords.p_to - this.coords.p_pointer), this.$cache.s_to.removeClass("type_last"),
                                this.$cache.s_from.removeClass("type_last")
                    }
                    p && e("*").prop("unselectable", !0);
                    this.$cache.line.trigger("focus")
                }
            }, pointerClick: function (a, b) {
                b.preventDefault();
                var c = l ? b.originalEvent.touches[0] : b;
                2 !== b.button && (this.current_plugin = this.plugin_count, this.target = a, this.is_click = !0, this.coords.x_gap = this.$cache.rs.offset().left, this.coords.x_pointer = +(c.pageX - this.coords.x_gap).toFixed(), this.force_redraw = !0, this.calc(), this.$cache.line.trigger("focus"))
            }, key: function (a, b) {
                if (!(this.current_plugin !==
                    this.plugin_count || b.altKey || b.ctrlKey || b.shiftKey || b.metaKey)) {
                    switch (b.which) {
                        case 83:
                        case 65:
                        case 40:
                        case 37:
                            b.preventDefault();
                            this.moveByKey(!1);
                            break;
                        case 87:
                        case 68:
                        case 38:
                        case 39:
                            b.preventDefault(), this.moveByKey(!0)
                    }
                    return !0
                }
            }, moveByKey: function (a) {
                var b = this.coords.p_pointer, b = a ? b + this.options.keyboard_step : b - this.options.keyboard_step;
                this.coords.x_pointer = this.toFixed(this.coords.w_rs / 100 * b);
                this.is_key = !0;
                this.calc()
            }, setMinMax: function () {
                this.options.hide_min_max ? (this.$cache.min[0].style.display =
                    "none", this.$cache.max[0].style.display = "none") : (this.options.values.length ? (this.$cache.min.html(this.decorate(this.options.p_values[this.options.min])), this.$cache.max.html(this.decorate(this.options.p_values[this.options.max]))) : (this.$cache.min.html(this.decorate(this._prettify(this.options.min), this.options.min)), this.$cache.max.html(this.decorate(this._prettify(this.options.max), this.options.max))), this.labels.w_min = this.$cache.min.outerWidth(!1), this.labels.w_max = this.$cache.max.outerWidth(!1))
            },
            calc: function (a) {
                this.calc_count++;
                if (10 === this.calc_count || a) this.calc_count = 0, this.coords.w_rs = this.$cache.rs.outerWidth(!1), this.coords.w_handle = "single" === this.options.type ? this.$cache.s_single.outerWidth(!1) : this.$cache.s_from.outerWidth(!1);
                if (this.coords.w_rs) {
                    this.calcPointer();
                    this.coords.p_handle = this.toFixed(this.coords.w_handle / this.coords.w_rs * 100);
                    a = 100 - this.coords.p_handle;
                    var b = this.toFixed(this.coords.p_pointer - this.coords.p_gap);
                    "click" === this.target && (b = this.toFixed(this.coords.p_pointer -
                        this.coords.p_handle / 2), this.target = this.chooseHandle(b));
                    0 > b ? b = 0 : b > a && (b = a);
                    switch (this.target) {
                        case "base":
                            b = (this.options.max - this.options.min) / 100;
                            a = (this.result.from - this.options.min) / b;
                            b = (this.result.to - this.options.min) / b;
                            this.coords.p_single_real = this.toFixed(a);
                            this.coords.p_from_real = this.toFixed(a);
                            this.coords.p_to_real = this.toFixed(b);
                            this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real, this.options.from_min, this.options.from_max);
                            this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real,
                                this.options.from_min, this.options.from_max);
                            this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
                            this.coords.p_single = this.toFixed(a - this.coords.p_handle / 100 * a);
                            this.coords.p_from = this.toFixed(a - this.coords.p_handle / 100 * a);
                            this.coords.p_to = this.toFixed(b - this.coords.p_handle / 100 * b);
                            this.target = null;
                            break;
                        case "single":
                            if (this.options.from_fixed) break;
                            this.coords.p_single_real = this.calcWithStep(b / a * 100);
                            this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real,
                                this.options.from_min, this.options.from_max);
                            this.coords.p_single = this.toFixed(this.coords.p_single_real / 100 * a);
                            break;
                        case "from":
                            if (this.options.from_fixed) break;
                            this.coords.p_from_real = this.calcWithStep(b / a * 100);
                            this.coords.p_from_real > this.coords.p_to_real && (this.coords.p_from_real = this.coords.p_to_real);
                            this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
                            this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real, this.coords.p_to_real,
                                "from");
                            this.coords.p_from_real = this.checkMaxInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
                            this.coords.p_from = this.toFixed(this.coords.p_from_real / 100 * a);
                            break;
                        case "to":
                            if (this.options.to_fixed) break;
                            this.coords.p_to_real = this.calcWithStep(b / a * 100);
                            this.coords.p_to_real < this.coords.p_from_real && (this.coords.p_to_real = this.coords.p_from_real);
                            this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
                            this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real,
                                this.coords.p_from_real, "to");
                            this.coords.p_to_real = this.checkMaxInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
                            this.coords.p_to = this.toFixed(this.coords.p_to_real / 100 * a);
                            break;
                        case "both":
                            b = this.toFixed(b + .1 * this.coords.p_handle), this.coords.p_from_real = this.calcWithStep((b - this.coords.p_gap_left) / a * 100), this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max), this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real,
                                this.coords.p_to_real, "from"), this.coords.p_from = this.toFixed(this.coords.p_from_real / 100 * a), this.coords.p_to_real = this.calcWithStep((b + this.coords.p_gap_right) / a * 100), this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max), this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real, this.coords.p_from_real, "to"), this.coords.p_to = this.toFixed(this.coords.p_to_real / 100 * a)
                    }
                    "single" === this.options.type ? (this.coords.p_bar_x = this.coords.p_handle / 2, this.coords.p_bar_w =
                        this.coords.p_single, this.result.from_percent = this.coords.p_single_real, this.result.from = this.calcReal(this.coords.p_single_real), this.options.values.length && (this.result.from_value = this.options.values[this.result.from])) : (this.coords.p_bar_x = this.toFixed(this.coords.p_from + this.coords.p_handle / 2), this.coords.p_bar_w = this.toFixed(this.coords.p_to - this.coords.p_from), this.result.from_percent = this.coords.p_from_real, this.result.from = this.calcReal(this.coords.p_from_real), this.result.to_percent = this.coords.p_to_real,
                        this.result.to = this.calcReal(this.coords.p_to_real), this.options.values.length && (this.result.from_value = this.options.values[this.result.from], this.result.to_value = this.options.values[this.result.to]));
                    this.calcMinMax();
                    this.calcLabels()
                }
            }, calcPointer: function () {
                this.coords.w_rs ? (0 > this.coords.x_pointer ? this.coords.x_pointer = 0 : this.coords.x_pointer > this.coords.w_rs && (this.coords.x_pointer = this.coords.w_rs), this.coords.p_pointer = this.toFixed(this.coords.x_pointer / this.coords.w_rs * 100)) : this.coords.p_pointer =
                    0
            }, chooseHandle: function (a) {
                return "single" === this.options.type ? "single" : a >= this.coords.p_from_real + (this.coords.p_to_real - this.coords.p_from_real) / 2 ? "to" : "from"
            }, calcMinMax: function () {
                this.coords.w_rs && (this.labels.p_min = this.labels.w_min / this.coords.w_rs * 100, this.labels.p_max = this.labels.w_max / this.coords.w_rs * 100)
            }, calcLabels: function () {
                this.coords.w_rs && !this.options.hide_from_to && ("single" === this.options.type ? (this.labels.w_single = this.$cache.single.outerWidth(!1), this.labels.p_single = this.labels.w_single /
                    this.coords.w_rs * 100, this.labels.p_single_left = this.coords.p_single + this.coords.p_handle / 2 - this.labels.p_single / 2) : (this.labels.w_from = this.$cache.from.outerWidth(!1), this.labels.p_from = this.labels.w_from / this.coords.w_rs * 100, this.labels.p_from_left = this.coords.p_from + this.coords.p_handle / 2 - this.labels.p_from / 2, this.labels.p_from_left = this.toFixed(this.labels.p_from_left), this.labels.p_from_left = this.checkEdges(this.labels.p_from_left, this.labels.p_from), this.labels.w_to = this.$cache.to.outerWidth(!1),
                    this.labels.p_to = this.labels.w_to / this.coords.w_rs * 100, this.labels.p_to_left = this.coords.p_to + this.coords.p_handle / 2 - this.labels.p_to / 2, this.labels.p_to_left = this.toFixed(this.labels.p_to_left), this.labels.p_to_left = this.checkEdges(this.labels.p_to_left, this.labels.p_to), this.labels.w_single = this.$cache.single.outerWidth(!1), this.labels.p_single = this.labels.w_single / this.coords.w_rs * 100, this.labels.p_single_left = (this.labels.p_from_left + this.labels.p_to_left + this.labels.p_to) / 2 - this.labels.p_single /
                    2, this.labels.p_single_left = this.toFixed(this.labels.p_single_left)), this.labels.p_single_left = this.checkEdges(this.labels.p_single_left, this.labels.p_single))
            }, updateScene: function () {
                this.drawHandles();
                this.raf_id = requestAnimationFrame(this.updateScene.bind(this))
            }, drawHandles: function () {
                this.coords.w_rs = this.$cache.rs.outerWidth(!1);
                this.coords.w_rs !== this.coords.w_rs_old && (this.target = "base", this.is_resize = !0);
                if (this.coords.w_rs !== this.coords.w_rs_old || this.force_redraw) this.setMinMax(), this.calc(!0),
                    this.drawLabels(), this.options.grid && (this.calcGridMargin(), this.calcGridLabels()), this.force_redraw = !0, this.coords.w_rs_old = this.coords.w_rs, this.drawShadow();
                if (this.coords.w_rs && (this.dragging || this.force_redraw || this.is_key)) {
                    if (this.old_from !== this.result.from || this.old_to !== this.result.to || this.force_redraw || this.is_key) {
                        this.drawLabels();
                        this.$cache.bar[0].style.left = this.coords.p_bar_x + "%";
                        this.$cache.bar[0].style.width = this.coords.p_bar_w + "%";
                        if ("single" === this.options.type) this.$cache.s_single[0].style.left =
                            this.coords.p_single + "%", this.$cache.single[0].style.left = this.labels.p_single_left + "%", this.options.values.length ? (this.$cache.input.prop("value", this.result.from_value), this.$cache.input.data("from", this.result.from_value)) : (this.$cache.input.prop("value", this.result.from), this.$cache.input.data("from", this.result.from)); else {
                            this.$cache.s_from[0].style.left = this.coords.p_from + "%";
                            this.$cache.s_to[0].style.left = this.coords.p_to + "%";
                            if (this.old_from !== this.result.from || this.force_redraw) this.$cache.from[0].style.left =
                                this.labels.p_from_left + "%";
                            if (this.old_to !== this.result.to || this.force_redraw) this.$cache.to[0].style.left = this.labels.p_to_left + "%";
                            this.$cache.single[0].style.left = this.labels.p_single_left + "%";
                            this.options.values.length ? (this.$cache.input.prop("value", this.result.from_value + ";" + this.result.to_value), this.$cache.input.data("from", this.result.from_value), this.$cache.input.data("to", this.result.to_value)) : (this.$cache.input.prop("value", this.result.from + ";" + this.result.to), this.$cache.input.data("from",
                                this.result.from), this.$cache.input.data("to", this.result.to))
                        }
                        this.old_from === this.result.from && this.old_to === this.result.to || this.is_start || this.$cache.input.trigger("change");
                        this.old_from = this.result.from;
                        this.old_to = this.result.to;
                        if (this.options.onChange && "function" === typeof this.options.onChange && !this.is_resize && !this.is_update && !this.is_start) this.options.onChange(this.result);
                        if (this.options.onFinish && "function" === typeof this.options.onFinish && (this.is_key || this.is_click)) this.options.onFinish(this.result);
                        this.is_resize = this.is_update = !1
                    }
                    this.force_redraw = this.is_click = this.is_key = this.is_start = !1
                }
            }, drawLabels: function () {
                var a = this.options.values.length, b = this.options.p_values, c;
                if (!this.options.hide_from_to) if ("single" === this.options.type) a = a ? this.decorate(b[this.result.from]) : this.decorate(this._prettify(this.result.from), this.result.from), this.$cache.single.html(a), this.calcLabels(), this.$cache.min[0].style.visibility = this.labels.p_single_left < this.labels.p_min + 1 ? "hidden" : "visible", this.$cache.max[0].style.visibility =
                    this.labels.p_single_left + this.labels.p_single > 100 - this.labels.p_max - 1 ? "hidden" : "visible"; else {
                    a ? (this.options.decorate_both ? (a = this.decorate(b[this.result.from]), a += this.options.values_separator, a += this.decorate(b[this.result.to])) : a = this.decorate(b[this.result.from] + this.options.values_separator + b[this.result.to]), c = this.decorate(b[this.result.from]), b = this.decorate(b[this.result.to])) : (this.options.decorate_both ? (a = this.decorate(this._prettify(this.result.from)), a += this.options.values_separator,
                        a += this.decorate(this._prettify(this.result.to))) : a = this.decorate(this._prettify(this.result.from) + this.options.values_separator + this._prettify(this.result.to), this.result.from), c = this.decorate(this._prettify(this.result.from), this.result.from), b = this.decorate(this._prettify(this.result.to), this.result.to));
                    this.$cache.single.html(a);
                    this.$cache.from.html(c);
                    this.$cache.to.html(b);
                    this.calcLabels();
                    b = Math.min(this.labels.p_single_left, this.labels.p_from_left);
                    a = this.labels.p_single_left + this.labels.p_single;
                    c = this.labels.p_to_left + this.labels.p_to;
                    var d = Math.max(a, c);
                    this.labels.p_from_left + this.labels.p_from >= this.labels.p_to_left ? (this.$cache.from[0].style.visibility = "hidden", this.$cache.to[0].style.visibility = "hidden", this.$cache.single[0].style.visibility = "visible", this.result.from === this.result.to ? (this.$cache.from[0].style.visibility = "visible", this.$cache.single[0].style.visibility = "hidden", d = c) : (this.$cache.from[0].style.visibility = "hidden", this.$cache.single[0].style.visibility = "visible", d = Math.max(a,
                        c))) : (this.$cache.from[0].style.visibility = "visible", this.$cache.to[0].style.visibility = "visible", this.$cache.single[0].style.visibility = "hidden");
                    this.$cache.min[0].style.visibility = b < this.labels.p_min + 1 ? "hidden" : "visible";
                    this.$cache.max[0].style.visibility = d > 100 - this.labels.p_max - 1 ? "hidden" : "visible"
                }
            }, drawShadow: function () {
                var a = this.options, b = this.$cache, c, d;
                "single" === a.type ? a.from_shadow && (a.from_min || a.from_max) ? (c = this.calcPercent(a.from_min || a.min), d = this.calcPercent(a.from_max || a.max) -
                    c, c = this.toFixed(c - this.coords.p_handle / 100 * c), d = this.toFixed(d - this.coords.p_handle / 100 * d), c += this.coords.p_handle / 2, b.shad_single[0].style.display = "block", b.shad_single[0].style.left = c + "%", b.shad_single[0].style.width = d + "%") : b.shad_single[0].style.display = "none" : (a.from_shadow && (a.from_min || a.from_max) ? (c = this.calcPercent(a.from_min || a.min), d = this.calcPercent(a.from_max || a.max) - c, c = this.toFixed(c - this.coords.p_handle / 100 * c), d = this.toFixed(d - this.coords.p_handle / 100 * d), c += this.coords.p_handle / 2,
                    b.shad_from[0].style.display = "block", b.shad_from[0].style.left = c + "%", b.shad_from[0].style.width = d + "%") : b.shad_from[0].style.display = "none", a.to_shadow && (a.to_min || a.to_max) ? (c = this.calcPercent(a.to_min || a.min), a = this.calcPercent(a.to_max || a.max) - c, c = this.toFixed(c - this.coords.p_handle / 100 * c), a = this.toFixed(a - this.coords.p_handle / 100 * a), c += this.coords.p_handle / 2, b.shad_to[0].style.display = "block", b.shad_to[0].style.left = c + "%", b.shad_to[0].style.width = a + "%") : b.shad_to[0].style.display = "none")
            }, toggleInput: function () {
                this.$cache.input.toggleClass("irs-hidden-input")
            },
            calcPercent: function (a) {
                return this.toFixed((a - this.options.min) / ((this.options.max - this.options.min) / 100))
            }, calcReal: function (a) {
                var b = this.options.min, c = this.options.max, d = 0;
                0 > b && (d = Math.abs(b), b += d, c += d);
                a = (c - b) / 100 * a + b;
                (b = this.options.step.toString().split(".")[1]) ? a = +a.toFixed(b.length) : (a /= this.options.step, a *= this.options.step, a = +a.toFixed(0));
                d && (a -= d);
                a < this.options.min ? a = this.options.min : a > this.options.max && (a = this.options.max);
                return b ? +a.toFixed(b.length) : this.toFixed(a)
            }, calcWithStep: function (a) {
                var b =
                    Math.round(a / this.coords.p_step) * this.coords.p_step;
                100 < b && (b = 100);
                100 === a && (b = 100);
                return this.toFixed(b)
            }, checkMinInterval: function (a, b, c) {
                var d = this.options;
                if (!d.min_interval) return a;
                a = this.calcReal(a);
                b = this.calcReal(b);
                "from" === c ? b - a < d.min_interval && (a = b - d.min_interval) : a - b < d.min_interval && (a = b + d.min_interval);
                return this.calcPercent(a)
            }, checkMaxInterval: function (a, b, c) {
                var d = this.options;
                if (!d.max_interval) return a;
                a = this.calcReal(a);
                b = this.calcReal(b);
                "from" === c ? b - a > d.max_interval && (a = b -
                    d.max_interval) : a - b > d.max_interval && (a = b + d.max_interval);
                return this.calcPercent(a)
            }, checkDiapason: function (a, b, c) {
                a = this.calcReal(a);
                var d = this.options;
                b && "number" === typeof b || (b = d.min);
                c && "number" === typeof c || (c = d.max);
                a < b && (a = b);
                a > c && (a = c);
                return this.calcPercent(a)
            }, toFixed: function (a) {
                a = a.toFixed(5);
                return +a
            }, _prettify: function (a) {
                return this.options.prettify_enabled ? this.options.prettify && "function" === typeof this.options.prettify ? this.options.prettify(a) : this.prettify(a) : a
            }, prettify: function (a) {
                return a.toString().replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g,
                    "$1" + this.options.prettify_separator)
            }, checkEdges: function (a, b) {
                if (!this.options.force_edges) return this.toFixed(a);
                0 > a ? a = 0 : a > 100 - b && (a = 100 - b);
                return this.toFixed(a)
            }, validate: function () {
                var a = this.options, b = this.result, c = a.values, d = c.length, h, f;
                "string" === typeof a.min && (a.min = +a.min);
                "string" === typeof a.max && (a.max = +a.max);
                "string" === typeof a.from && (a.from = +a.from);
                "string" === typeof a.to && (a.to = +a.to);
                "string" === typeof a.step && (a.step = +a.step);
                "string" === typeof a.from_min && (a.from_min = +a.from_min);
                "string" === typeof a.from_max && (a.from_max = +a.from_max);
                "string" === typeof a.to_min && (a.to_min = +a.to_min);
                "string" === typeof a.to_max && (a.to_max = +a.to_max);
                "string" === typeof a.keyboard_step && (a.keyboard_step = +a.keyboard_step);
                "string" === typeof a.grid_num && (a.grid_num = +a.grid_num);
                a.max <= a.min && (a.max = a.min ? 2 * a.min : a.min + 1, a.step = 1);
                if (d) for (a.p_values = [], a.min = 0, a.max = d - 1, a.step = 1, a.grid_num = a.max, a.grid_snap = !0, f = 0; f < d; f++) h = +c[f], isNaN(h) ? h = c[f] : (c[f] = h, h = this._prettify(h)), a.p_values.push(h);
                if ("number" !==
                    typeof a.from || isNaN(a.from)) a.from = a.min;
                if ("number" !== typeof a.to || isNaN(a.from)) a.to = a.max;
                if (a.from < a.min || a.from > a.max) a.from = a.min;
                if (a.to > a.max || a.to < a.min) a.to = a.max;
                "double" === a.type && a.from > a.to && (a.from = a.to);
                if ("number" !== typeof a.step || isNaN(a.step) || !a.step || 0 > a.step) a.step = 1;
                if ("number" !== typeof a.keyboard_step || isNaN(a.keyboard_step) || !a.keyboard_step || 0 > a.keyboard_step) a.keyboard_step = 5;
                a.from_min && a.from < a.from_min && (a.from = a.from_min);
                a.from_max && a.from > a.from_max && (a.from = a.from_max);
                a.to_min && a.to < a.to_min && (a.to = a.to_min);
                a.to_max && a.from > a.to_max && (a.to = a.to_max);
                if (b) {
                    b.min !== a.min && (b.min = a.min);
                    b.max !== a.max && (b.max = a.max);
                    if (b.from < b.min || b.from > b.max) b.from = a.from;
                    if (b.to < b.min || b.to > b.max) b.to = a.to
                }
                if ("number" !== typeof a.min_interval || isNaN(a.min_interval) || !a.min_interval || 0 > a.min_interval) a.min_interval = 0;
                if ("number" !== typeof a.max_interval || isNaN(a.max_interval) || !a.max_interval || 0 > a.max_interval) a.max_interval = 0;
                a.min_interval && a.min_interval > a.max - a.min && (a.min_interval =
                    a.max - a.min);
                a.max_interval && a.max_interval > a.max - a.min && (a.max_interval = a.max - a.min)
            }, decorate: function (a, b) {
                var c = "", d = this.options;
                d.prefix && (c += d.prefix);
                c += a;
                d.max_postfix && (d.values.length && a === d.p_values[d.max] ? (c += d.max_postfix, d.postfix && (c += " ")) : b === d.max && (c += d.max_postfix, d.postfix && (c += " ")));
                d.postfix && (c += d.postfix);
                return c
            }, updateFrom: function () {
                this.result.from = this.options.from;
                this.result.from_percent = this.calcPercent(this.result.from);
                this.options.values && (this.result.from_value =
                    this.options.values[this.result.from])
            }, updateTo: function () {
                this.result.to = this.options.to;
                this.result.to_percent = this.calcPercent(this.result.to);
                this.options.values && (this.result.to_value = this.options.values[this.result.to])
            }, updateResult: function () {
                this.result.min = this.options.min;
                this.result.max = this.options.max;
                this.updateFrom();
                this.updateTo()
            }, appendGrid: function () {
                if (this.options.grid) {
                    var a = this.options, b, c;
                    b = a.max - a.min;
                    var d = a.grid_num, h = 0, f = 0, k = 4, e, g, m = 0, n = "";
                    this.calcGridMargin();
                    a.grid_snap ?
                        (d = b / a.step, h = this.toFixed(a.step / (b / 100))) : h = this.toFixed(100 / d);
                    4 < d && (k = 3);
                    7 < d && (k = 2);
                    14 < d && (k = 1);
                    28 < d && (k = 0);
                    for (b = 0; b < d + 1; b++) {
                        e = k;
                        f = this.toFixed(h * b);
                        100 < f && (f = 100, e -= 2, 0 > e && (e = 0));
                        this.coords.big[b] = f;
                        g = (f - h * (b - 1)) / (e + 1);
                        for (c = 1; c <= e && 0 !== f; c++) m = this.toFixed(f - g * c), n += '<span class="irs-grid-pol small" style="left: ' + m + '%"></span>';
                        n += '<span class="irs-grid-pol" style="left: ' + f + '%"></span>';
                        m = this.calcReal(f);
                        m = a.values.length ? a.p_values[m] : this._prettify(m);
                        n += '<span class="irs-grid-text js-grid-text-' +
                            b + '" style="left: ' + f + '%">' + m + "</span>"
                    }
                    this.coords.big_num = Math.ceil(d + 1);
                    this.$cache.cont.addClass("irs-with-grid");
                    this.$cache.grid.html(n);
                    this.cacheGridLabels()
                }
            }, cacheGridLabels: function () {
                var a, b, c = this.coords.big_num;
                for (b = 0; b < c; b++) a = this.$cache.grid.find(".js-grid-text-" + b), this.$cache.grid_labels.push(a);
                this.calcGridLabels()
            }, calcGridLabels: function () {
                var a, b;
                b = [];
                var c = [], d = this.coords.big_num;
                for (a = 0; a < d; a++) this.coords.big_w[a] = this.$cache.grid_labels[a].outerWidth(!1), this.coords.big_p[a] =
                    this.toFixed(this.coords.big_w[a] / this.coords.w_rs * 100), this.coords.big_x[a] = this.toFixed(this.coords.big_p[a] / 2), b[a] = this.toFixed(this.coords.big[a] - this.coords.big_x[a]), c[a] = this.toFixed(b[a] + this.coords.big_p[a]);
                this.options.force_edges && (b[0] < this.coords.grid_gap && (b[0] = this.coords.grid_gap, c[0] = this.toFixed(b[0] + this.coords.big_p[0]), this.coords.big_x[0] = this.coords.grid_gap), c[d - 1] > 100 - this.coords.grid_gap && (c[d - 1] = 100 - this.coords.grid_gap, b[d - 1] = this.toFixed(c[d - 1] - this.coords.big_p[d - 1]),
                    this.coords.big_x[d - 1] = this.toFixed(this.coords.big_p[d - 1] - this.coords.grid_gap)));
                this.calcGridCollision(2, b, c);
                this.calcGridCollision(4, b, c);
                for (a = 0; a < d; a++) b = this.$cache.grid_labels[a][0], b.style.marginLeft = -this.coords.big_x[a] + "%"
            }, calcGridCollision: function (a, b, c) {
                var d, e, f, g = this.coords.big_num;
                for (d = 0; d < g; d += a) {
                    e = d + a / 2;
                    if (e >= g) break;
                    f = this.$cache.grid_labels[e][0];
                    f.style.visibility = c[d] <= b[e] ? "visible" : "hidden"
                }
            }, calcGridMargin: function () {
                this.options.grid_margin && (this.coords.w_rs = this.$cache.rs.outerWidth(!1),
                this.coords.w_rs && (this.coords.w_handle = "single" === this.options.type ? this.$cache.s_single.outerWidth(!1) : this.$cache.s_from.outerWidth(!1), this.coords.p_handle = this.toFixed(this.coords.w_handle / this.coords.w_rs * 100), this.coords.grid_gap = this.toFixed(this.coords.p_handle / 2 - .1), this.$cache.grid[0].style.width = this.toFixed(100 - this.coords.p_handle) + "%", this.$cache.grid[0].style.left = this.coords.grid_gap + "%"))
            }, update: function (a) {
                this.is_update = !0;
                this.options = e.extend(this.options, a);
                this.validate();
                this.updateResult(a);
                this.toggleInput();
                this.remove();
                this.init(!0)
            }, reset: function () {
                this.updateResult();
                this.update()
            }, destroy: function () {
                this.toggleInput();
                this.$cache.input.prop("readonly", !1);
                e.data(this.input, "ionRangeSlider", null);
                this.remove();
                this.options = this.input = null
            }
        };
        e.fn.ionRangeSlider = function (a) {
            return this.each(function () {
                e.data(this, "ionRangeSlider") || e.data(this, "ionRangeSlider", new r(this, a, t++))
            })
        };
        (function () {
            for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !g.requestAnimationFrame; ++c) g.requestAnimationFrame =
                g[b[c] + "RequestAnimationFrame"], g.cancelAnimationFrame = g[b[c] + "CancelAnimationFrame"] || g[b[c] + "CancelRequestAnimationFrame"];
            g.requestAnimationFrame || (g.requestAnimationFrame = function (b, c) {
                var f = (new Date).getTime(), e = Math.max(0, 16 - (f - a)), l = g.setTimeout(function () {
                    b(f + e)
                }, e);
                a = f + e;
                return l
            });
            g.cancelAnimationFrame || (g.cancelAnimationFrame = function (a) {
                clearTimeout(a)
            })
        })()
    })(jQuery, document, window, navigator);
// =====================================================================================================================


// jQuery Mask Plugin v1.7.7
// github.com/igorescobar/jQuery-Mask-Plugin
    (function (f) {
        "function" === typeof define && define.amd ? define(["jquery"], f) : f(window.jQuery || window.Zepto)
    })(function (f) {
        var A = function (a, d, b) {
            var h = this, m, p;
            a = f(a);
            d = "function" === typeof d ? d(a.val(), void 0, a, b) : d;
            var c = {
                getCaret: function () {
                    try {
                        var e, l = 0, c = a.get(0), g = document.selection, d = c.selectionStart;
                        if (g && !~navigator.appVersion.indexOf("MSIE 10")) e = g.createRange(), e.moveStart("character", a.is("input") ? -a.val().length : -a.text().length), l = e.text.length; else if (d || "0" === d) l = d;
                        return l
                    } catch (b) {
                    }
                }, setCaret: function (e) {
                    try {
                        if (a.is(":focus")) {
                            var l,
                                c = a.get(0);
                            c.setSelectionRange ? c.setSelectionRange(e, e) : c.createTextRange && (l = c.createTextRange(), l.collapse(!0), l.moveEnd("character", e), l.moveStart("character", e), l.select())
                        }
                    } catch (g) {
                    }
                }, events: function () {
                    a.on("keydown.mask", function () {
                        m = c.val()
                    }).on("keyup.mask", c.behaviour).on("paste.mask drop.mask", function () {
                        setTimeout(function () {
                            a.keydown().keyup()
                        }, 100)
                    }).on("change.mask", function () {
                        a.data("changed", !0)
                    }).on("blur.mask", function () {
                        m === a.val() || a.data("changed") || a.trigger("change");
                        a.data("changed",
                            !1)
                    }).on("focusout.mask", function () {
                        b.clearIfNotMatch && !p.test(c.val()) && c.val("")
                    })
                }, getRegexMask: function () {
                    for (var e = [], a, c, g, b, k = 0; k < d.length; k++) (a = h.translation[d[k]]) ? (c = a.pattern.toString().replace(/.{1}$|^.{1}/g, ""), g = a.optional, (a = a.recursive) ? (e.push(d[k]), b = {
                        digit: d[k],
                        pattern: c
                    }) : e.push(g || a ? c + "?" : c)) : e.push(d[k].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
                    e = e.join("");
                    b && (e = e.replace(new RegExp("(" + b.digit + "(.*" + b.digit + ")?)"), "($1)?").replace(new RegExp(b.digit, "g"), b.pattern));
                    return new RegExp(e)
                },
                destroyEvents: function () {
                    a.off("keydown keyup paste drop change blur focusout DOMNodeInserted ".split(" ").join(".mask ")).removeData("changeCalled")
                }, val: function (e) {
                    var c = a.is("input");
                    return 0 < arguments.length ? c ? a.val(e) : a.text(e) : c ? a.val() : a.text()
                }, getMCharsBeforeCount: function (e, a) {
                    for (var c = 0, b = 0, f = d.length; b < f && b < e; b++) h.translation[d.charAt(b)] || (e = a ? e + 1 : e, c++);
                    return c
                }, caretPos: function (e, a, b, g) {
                    return h.translation[d.charAt(Math.min(e - 1, d.length - 1))] ? Math.min(e + b - a - g, b) : c.caretPos(e + 1,
                        a, b, g)
                }, behaviour: function (a) {
                    a = a || window.event;
                    var b = a.keyCode || a.which;
                    if (-1 === f.inArray(b, h.byPassKeys)) {
                        var d = c.getCaret(), g = c.val(), t = g.length, k = d < t, m = c.getMasked(), n = m.length,
                            p = c.getMCharsBeforeCount(n - 1) - c.getMCharsBeforeCount(t - 1);
                        m !== g && c.val(m);
                        !k || 65 === b && a.ctrlKey || (8 !== b && 46 !== b && (d = c.caretPos(d, t, n, p)), c.setCaret(d));
                        return c.callbacks(a)
                    }
                }, getMasked: function (a) {
                    var l = [], f = c.val(), g = 0, m = d.length, k = 0, p = f.length, n = 1, u = "push", r = -1, q, v;
                    b.reverse ? (u = "unshift", n = -1, q = 0, g = m - 1, k = p - 1, v = function () {
                        return -1 <
                            g && -1 < k
                    }) : (q = m - 1, v = function () {
                        return g < m && k < p
                    });
                    for (; v();) {
                        var w = d.charAt(g), x = f.charAt(k), s = h.translation[w];
                        if (s) x.match(s.pattern) ? (l[u](x), s.recursive && (-1 === r ? r = g : g === q && (g = r - n), q === r && (g -= n)), g += n) : s.optional && (g += n, k -= n), k += n; else {
                            if (!a) l[u](w);
                            x === w && (k += n);
                            g += n
                        }
                    }
                    a = d.charAt(q);
                    m !== p + 1 || h.translation[a] || l.push(a);
                    return l.join("")
                }, callbacks: function (e) {
                    var f = c.val(), h = f !== m;
                    if (!0 === h && "function" === typeof b.onChange) b.onChange(f, e, a, b);
                    if (!0 === h && "function" === typeof b.onKeyPress) b.onKeyPress(f,
                        e, a, b);
                    if ("function" === typeof b.onComplete && f.length === d.length) b.onComplete(f, e, a, b)
                }
            };
            h.mask = d;
            h.options = b;
            h.remove = function () {
                var b;
                c.destroyEvents();
                c.val(h.getCleanVal()).removeAttr("maxlength");
                b = c.getCaret();
                c.setCaret(b - c.getMCharsBeforeCount(b));
                return a
            };
            h.getCleanVal = function () {
                return c.getMasked(!0)
            };
            h.init = function () {
                b = b || {};
                h.byPassKeys = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91];
                h.translation = {
                    0: {pattern: /\d/},
                    9: {pattern: /\d/, optional: !0},
                    "#": {pattern: /\d/, recursive: !0},
                    A: {pattern: /[a-zA-Z0-9]/},
                    S: {pattern: /[a-zA-Z]/}
                };
                h.translation = f.extend({}, h.translation, b.translation);
                h = f.extend(!0, {}, h, b);
                p = c.getRegexMask();
                !1 !== b.maxlength && a.attr("maxlength", d.length);
                b.placeholder && a.attr("placeholder", b.placeholder);
                a.attr("autocomplete", "off");
                c.destroyEvents();
                c.events();
                var e = c.getCaret();
                c.val(c.getMasked());
                c.setCaret(e + c.getMCharsBeforeCount(e, !0))
            }()
        }, y = {}, z = function () {
            var a = f(this), d = {};
            a.attr("data-mask-reverse") && (d.reverse = !0);
            "false" === a.attr("data-mask-maxlength") && (d.maxlength = !1);
            a.attr("data-mask-clearifnotmatch") && (d.clearIfNotMatch = !0);
            a.mask(a.attr("data-mask"), d)
        };
        f.fn.mask = function (a, d) {
            var b = this.selector, h = function () {
                var b = f(this).data("mask"), h = JSON.stringify;
                if ("object" !== typeof b || h(b.options) !== h(d) || b.mask !== a) return f(this).data("mask", new A(this, a, d))
            };
            this.each(h);
            b && !y[b] && (y[b] = !0, setTimeout(function () {
                f(document).on("DOMNodeInserted.mask", b, h)
            }, 500))
        };
        f.fn.unmask = function () {
            try {
                return this.each(function () {
                    f(this).data("mask").remove().removeData("mask")
                })
            } catch (a) {
            }
        };
        f.fn.cleanVal = function () {
            return this.data("mask").getCleanVal()
        };
        f("*[data-mask]").each(z);
        f(document).on("DOMNodeInserted.mask", "*[data-mask]", z)
    });

// =====================================================================================================================

    /* == jquery mousewheel plugin == Version: 3.1.11, License: MIT License (MIT) */
    !function (a) {
        "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery)
    }(function (a) {
        function b(b) {
            var g = b || window.event, h = i.call(arguments, 1), j = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
            if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) {
                if (1 === g.deltaMode) {
                    var q = a.data(this, "mousewheel-line-height");
                    j *= q, m *= q, l *= q
                } else if (2 === g.deltaMode) {
                    var r = a.data(this, "mousewheel-page-height");
                    j *= r, m *= r, l *= r
                }
                if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) {
                    var s = this.getBoundingClientRect();
                    o = b.clientX - s.left, p = b.clientY - s.top
                }
                return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h)
            }
        }

        function c() {
            f = null
        }

        function d(a, b) {
            return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
        }

        var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
            h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
            i = Array.prototype.slice;
        if (a.event.fixHooks) for (var j = g.length; j;) a.event.fixHooks[g[--j]] = a.event.mouseHooks;
        var k = a.event.special.mousewheel = {
            version: "3.1.11", setup: function () {
                if (this.addEventListener) for (var c = h.length; c;) this.addEventListener(h[--c], b, !1); else this.onmousewheel = b;
                a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this))
            }, teardown: function () {
                if (this.removeEventListener) for (var c = h.length; c;) this.removeEventListener(h[--c], b, !1); else this.onmousewheel = null;
                a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height")
            }, getLineHeight: function (b) {
                var c = a(b)["offsetParent" in a.fn ? "offsetParent" : "parent"]();
                return c.length || (c = a("body")), parseInt(c.css("fontSize"), 10)
            }, getPageHeight: function (b) {
                return a(b).height()
            }, settings: {adjustOldDeltas: !0, normalizeOffset: !0}
        };
        a.fn.extend({
            mousewheel: function (a) {
                return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
            }, unmousewheel: function (a) {
                return this.unbind("mousewheel", a)
            }
        })
    });
    /*
 * == malihu jquery custom scrollbar plugin == Version: 3.0.5, License: MIT
 * License (MIT)
 */
    !function (e, t, o) {
        !function (t) {
            var a = "function" == typeof define && define.amd, n = "https:" == o.location.protocol ? "https:" : "http:",
                r = "cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.11/jquery.mousewheel.min.js";
            a || e.event.special.mousewheel || e("head").append(decodeURI("%3Cscript src=" + n + "//" + r + "%3E%3C/script%3E")), t()
        }(function () {
            var a = "mCustomScrollbar", n = "mCS", r = ".mCustomScrollbar", i = {
                setWidth: !1,
                setHeight: !1,
                setTop: 0,
                setLeft: 0,
                axis: "y",
                scrollbarPosition: "inside",
                scrollInertia: 950,
                autoDraggerLength: !0,
                autoHideScrollbar: !1,
                autoExpandScrollbar: !1,
                alwaysShowScrollbar: 0,
                snapAmount: null,
                snapOffset: 0,
                mouseWheel: {
                    enable: !0,
                    scrollAmount: "auto",
                    axis: "y",
                    preventDefault: !1,
                    deltaFactor: "auto",
                    normalizeDelta: !1,
                    invert: !1,
                    disableOver: ["select", "option", "keygen", "datalist", "textarea"]
                },
                scrollButtons: {enable: !1, scrollType: "stepless", scrollAmount: "auto"},
                keyboard: {enable: !0, scrollType: "stepless", scrollAmount: "auto"},
                contentTouchScroll: 25,
                advanced: {
                    autoExpandHorizontalScroll: !1,
                    autoScrollOnFocus: "input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable='true']",
                    updateOnContentResize: !0,
                    updateOnImageLoad: !0,
                    updateOnSelectorChange: !1,
                    releaseDraggableSelectors: !1
                },
                theme: "light",
                callbacks: {
                    onInit: !1,
                    onScrollStart: !1,
                    onScroll: !1,
                    onTotalScroll: !1,
                    onTotalScrollBack: !1,
                    whileScrolling: !1,
                    onTotalScrollOffset: 0,
                    onTotalScrollBackOffset: 0,
                    alwaysTriggerOffsets: !0,
                    onOverflowY: !1,
                    onOverflowX: !1,
                    onOverflowYNone: !1,
                    onOverflowXNone: !1
                },
                live: !1,
                liveSelector: null
            }, l = 0, s = {}, c = function (e) {
                s[e] && (clearTimeout(s[e]), h._delete.call(null, s[e]))
            }, d = t.attachEvent && !t.addEventListener ? 1 : 0, u = !1, f = {
                init: function (t) {
                    var t = e.extend(!0, {}, i, t), o = h._selector.call(this);
                    if (t.live) {
                        var a = t.liveSelector || this.selector || r, d = e(a);
                        if ("off" === t.live) return void c(a);
                        s[a] = setTimeout(function () {
                            d.mCustomScrollbar(t), "once" === t.live && d.length && c(a)
                        }, 500)
                    } else c(a);
                    return t.setWidth = t.set_width ? t.set_width : t.setWidth, t.setHeight = t.set_height ? t.set_height : t.setHeight, t.axis = t.horizontalScroll ? "x" : h._findAxis.call(null, t.axis), t.scrollInertia = t.scrollInertia > 0 && t.scrollInertia < 17 ? 17 : t.scrollInertia, "object" != typeof t.mouseWheel && 1 == t.mouseWheel && (t.mouseWheel = {
                        enable: !0,
                        scrollAmount: "auto",
                        axis: "y",
                        preventDefault: !1,
                        deltaFactor: "auto",
                        normalizeDelta: !1,
                        invert: !1
                    }), t.mouseWheel.scrollAmount = t.mouseWheelPixels ? t.mouseWheelPixels : t.mouseWheel.scrollAmount, t.mouseWheel.normalizeDelta = t.advanced.normalizeMouseWheelDelta ? t.advanced.normalizeMouseWheelDelta : t.mouseWheel.normalizeDelta, t.scrollButtons.scrollType = h._findScrollButtonsType.call(null, t.scrollButtons.scrollType), h._theme.call(null, t), e(o).each(function () {
                        var o = e(this);
                        if (!o.data(n)) {
                            o.data(n, {
                                idx: ++l,
                                opt: t,
                                scrollRatio: {y: null, x: null},
                                overflowed: null,
                                contentReset: {y: null, x: null},
                                bindEvents: !1,
                                tweenRunning: !1,
                                sequential: {},
                                langDir: o.css("direction"),
                                cbOffsets: null,
                                trigger: null
                            });
                            var a = o.data(n).opt, r = o.data("mcs-axis"), i = o.data("mcs-scrollbar-position"),
                                s = o.data("mcs-theme");
                            r && (a.axis = r), i && (a.scrollbarPosition = i), s && (a.theme = s, h._theme.call(null, a)), h._pluginMarkup.call(this), f.update.call(null, o)
                        }
                    })
                }, update: function (t) {
                    var o = t || h._selector.call(this);
                    return e(o).each(function () {
                        var t = e(this);
                        if (t.data(n)) {
                            var o = t.data(n), a = o.opt, r = e("#mCSB_" + o.idx + "_container"),
                                i = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")];
                            if (!r.length) return;
                            o.tweenRunning && h._stop.call(null, t), t.hasClass("mCS_disabled") && t.removeClass("mCS_disabled"), t.hasClass("mCS_destroyed") && t.removeClass("mCS_destroyed"), h._maxHeight.call(this), h._expandContentHorizontally.call(this), "y" === a.axis || a.advanced.autoExpandHorizontalScroll || r.css("width", h._contentWidth(r.children())), o.overflowed = h._overflowed.call(this), h._scrollbarVisibility.call(this), a.autoDraggerLength && h._setDraggerLength.call(this), h._scrollRatio.call(this), h._bindEvents.call(this);
                            var l = [Math.abs(r[0].offsetTop), Math.abs(r[0].offsetLeft)];
                            "x" !== a.axis && (o.overflowed[0] ? i[0].height() > i[0].parent().height() ? h._resetContentPosition.call(this) : (h._scrollTo.call(this, t, l[0].toString(), {
                                dir: "y",
                                dur: 0,
                                overwrite: "none"
                            }), o.contentReset.y = null) : (h._resetContentPosition.call(this), "y" === a.axis ? h._unbindEvents.call(this) : "yx" === a.axis && o.overflowed[1] && h._scrollTo.call(this, t, l[1].toString(), {
                                dir: "x",
                                dur: 0,
                                overwrite: "none"
                            }))), "y" !== a.axis && (o.overflowed[1] ? i[1].width() > i[1].parent().width() ? h._resetContentPosition.call(this) : (h._scrollTo.call(this, t, l[1].toString(), {
                                dir: "x",
                                dur: 0,
                                overwrite: "none"
                            }), o.contentReset.x = null) : (h._resetContentPosition.call(this), "x" === a.axis ? h._unbindEvents.call(this) : "yx" === a.axis && o.overflowed[0] && h._scrollTo.call(this, t, l[0].toString(), {
                                dir: "y",
                                dur: 0,
                                overwrite: "none"
                            }))), h._autoUpdate.call(this)
                        }
                    })
                }, scrollTo: function (t, o) {
                    if ("undefined" != typeof t && null != t) {
                        var a = h._selector.call(this);
                        return e(a).each(function () {
                            var a = e(this);
                            if (a.data(n)) {
                                var r = a.data(n), i = r.opt, l = {
                                        trigger: "external",
                                        scrollInertia: i.scrollInertia,
                                        scrollEasing: "mcsEaseInOut",
                                        moveDragger: !1,
                                        timeout: 60,
                                        callbacks: !0,
                                        onStart: !0,
                                        onUpdate: !0,
                                        onComplete: !0
                                    }, s = e.extend(!0, {}, l, o), c = h._arr.call(this, t),
                                    d = s.scrollInertia > 0 && s.scrollInertia < 17 ? 17 : s.scrollInertia;
                                c[0] = h._to.call(this, c[0], "y"), c[1] = h._to.call(this, c[1], "x"), s.moveDragger && (c[0] *= r.scrollRatio.y, c[1] *= r.scrollRatio.x), s.dur = d, setTimeout(function () {
                                    null !== c[0] && "undefined" != typeof c[0] && "x" !== i.axis && r.overflowed[0] && (s.dir = "y", s.overwrite = "all", h._scrollTo.call(this, a, c[0].toString(), s)), null !== c[1] && "undefined" != typeof c[1] && "y" !== i.axis && r.overflowed[1] && (s.dir = "x", s.overwrite = "none", h._scrollTo.call(this, a, c[1].toString(), s))
                                }, s.timeout)
                            }
                        })
                    }
                }, stop: function () {
                    var t = h._selector.call(this);
                    return e(t).each(function () {
                        var t = e(this);
                        t.data(n) && h._stop.call(null, t)
                    })
                }, disable: function (t) {
                    var o = h._selector.call(this);
                    return e(o).each(function () {
                        var o = e(this);
                        if (o.data(n)) {
                            {
                                var a = o.data(n);
                                a.opt
                            }
                            h._autoUpdate.call(this, "remove"), h._unbindEvents.call(this), t && h._resetContentPosition.call(this), h._scrollbarVisibility.call(this, !0), o.addClass("mCS_disabled")
                        }
                    })
                }, destroy: function () {
                    var t = h._selector.call(this);
                    return e(t).each(function () {
                        var o = e(this);
                        if (o.data(n)) {
                            var r = o.data(n), i = r.opt, l = e("#mCSB_" + r.idx),
                                s = e("#mCSB_" + r.idx + "_container"), d = e(".mCSB_" + r.idx + "_scrollbar");
                            i.live && c(t), h._autoUpdate.call(this, "remove"), h._unbindEvents.call(this), h._resetContentPosition.call(this), o.removeData(n), h._delete.call(null, this.mcs), d.remove(), l.replaceWith(s.contents()), o.removeClass(a + " _" + n + "_" + r.idx + " mCS-autoHide mCS-dir-rtl mCS_no_scrollbar mCS_disabled").addClass("mCS_destroyed")
                        }
                    })
                }
            }, h = {
                _selector: function () {
                    return "object" != typeof e(this) || e(this).length < 1 ? r : this
                }, _theme: function (t) {
                    var o = ["rounded", "rounded-dark", "rounded-dots", "rounded-dots-dark"],
                        a = ["rounded-dots", "rounded-dots-dark", "3d", "3d-dark", "3d-thick", "3d-thick-dark", "inset", "inset-dark", "inset-2", "inset-2-dark", "inset-3", "inset-3-dark"],
                        n = ["minimal", "minimal-dark"], r = ["minimal", "minimal-dark"],
                        i = ["minimal", "minimal-dark"];
                    t.autoDraggerLength = e.inArray(t.theme, o) > -1 ? !1 : t.autoDraggerLength, t.autoExpandScrollbar = e.inArray(t.theme, a) > -1 ? !1 : t.autoExpandScrollbar, t.scrollButtons.enable = e.inArray(t.theme, n) > -1 ? !1 : t.scrollButtons.enable, t.autoHideScrollbar = e.inArray(t.theme, r) > -1 ? !0 : t.autoHideScrollbar, t.scrollbarPosition = e.inArray(t.theme, i) > -1 ? "outside" : t.scrollbarPosition
                }, _findAxis: function (e) {
                    return "yx" === e || "xy" === e || "auto" === e ? "yx" : "x" === e || "horizontal" === e ? "x" : "y"
                }, _findScrollButtonsType: function (e) {
                    return "stepped" === e || "pixels" === e || "step" === e || "click" === e ? "stepped" : "stepless"
                }, _pluginMarkup: function () {
                    var t = e(this), o = t.data(n), r = o.opt,
                        i = r.autoExpandScrollbar ? " mCSB_scrollTools_onDrag_expand" : "",
                        l = ["<div id='mCSB_" + o.idx + "_scrollbar_vertical' class='mCSB_scrollTools mCSB_" + o.idx + "_scrollbar mCS-" + r.theme + " mCSB_scrollTools_vertical" + i + "'><div class='mCSB_draggerContainer'><div id='mCSB_" + o.idx + "_dragger_vertical' class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>", "<div id='mCSB_" + o.idx + "_scrollbar_horizontal' class='mCSB_scrollTools mCSB_" + o.idx + "_scrollbar mCS-" + r.theme + " mCSB_scrollTools_horizontal" + i + "'><div class='mCSB_draggerContainer'><div id='mCSB_" + o.idx + "_dragger_horizontal' class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>"],
                        s = "yx" === r.axis ? "mCSB_vertical_horizontal" : "x" === r.axis ? "mCSB_horizontal" : "mCSB_vertical",
                        c = "yx" === r.axis ? l[0] + l[1] : "x" === r.axis ? l[1] : l[0],
                        d = "yx" === r.axis ? "<div id='mCSB_" + o.idx + "_container_wrapper' class='mCSB_container_wrapper' />" : "",
                        u = r.autoHideScrollbar ? " mCS-autoHide" : "",
                        f = "x" !== r.axis && "rtl" === o.langDir ? " mCS-dir-rtl" : "";
                    r.setWidth && t.css("width", r.setWidth), r.setHeight && t.css("height", r.setHeight), r.setLeft = "y" !== r.axis && "rtl" === o.langDir ? "989999px" : r.setLeft, t.addClass(a + " _" + n + "_" + o.idx + u + f).wrapInner("<div id='mCSB_" + o.idx + "' class='mCustomScrollBox mCS-" + r.theme + " " + s + "'><div id='mCSB_" + o.idx + "_container' class='mCSB_container' style='position:relative; top:" + r.setTop + "; left:" + r.setLeft + ";' dir=" + o.langDir + " /></div>");
                    var _ = e("#mCSB_" + o.idx), m = e("#mCSB_" + o.idx + "_container");
                    "y" === r.axis || r.advanced.autoExpandHorizontalScroll || m.css("width", h._contentWidth(m.children())), "outside" === r.scrollbarPosition ? ("static" === t.css("position") && t.css("position", "relative"), t.css("overflow", "visible"), _.addClass("mCSB_outside").after(c)) : (_.addClass("mCSB_inside").append(c), m.wrap(d)), h._scrollButtons.call(this);
                    var p = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")];
                    p[0].css("min-height", p[0].height()), p[1].css("min-width", p[1].width())
                }, _contentWidth: function (t) {
                    return Math.max.apply(Math, t.map(function () {
                        return e(this).outerWidth(!0)
                    }).get())
                }, _expandContentHorizontally: function () {
                    var t = e(this), o = t.data(n), a = o.opt, r = e("#mCSB_" + o.idx + "_container");
                    a.advanced.autoExpandHorizontalScroll && "y" !== a.axis && r.css({
                        position: "absolute",
                        width: "auto"
                    }).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({
                        width: Math.ceil(r[0].getBoundingClientRect().right + .4) - Math.floor(r[0].getBoundingClientRect().left),
                        position: "relative"
                    }).unwrap()
                }, _scrollButtons: function () {
                    var t = e(this), o = t.data(n), a = o.opt, r = e(".mCSB_" + o.idx + "_scrollbar:first"),
                        i = ["<a href='#' class='mCSB_buttonUp' oncontextmenu='return false;' />", "<a href='#' class='mCSB_buttonDown' oncontextmenu='return false;' />", "<a href='#' class='mCSB_buttonLeft' oncontextmenu='return false;' />", "<a href='#' class='mCSB_buttonRight' oncontextmenu='return false;' />"],
                        l = ["x" === a.axis ? i[2] : i[0], "x" === a.axis ? i[3] : i[1], i[2], i[3]];
                    a.scrollButtons.enable && r.prepend(l[0]).append(l[1]).next(".mCSB_scrollTools").prepend(l[2]).append(l[3])
                }, _maxHeight: function () {
                    var t = e(this), o = t.data(n), a = (o.opt, e("#mCSB_" + o.idx)), r = t.css("max-height"),
                        i = -1 !== r.indexOf("%"), l = t.css("box-sizing");
                    if ("none" !== r) {
                        var s = i ? t.parent().height() * parseInt(r) / 100 : parseInt(r);
                        "border-box" === l && (s -= t.innerHeight() - t.height() + (t.outerHeight() - t.innerHeight())), a.css("max-height", Math.round(s))
                    }
                }, _setDraggerLength: function () {
                    var t = e(this), o = t.data(n), a = e("#mCSB_" + o.idx), r = e("#mCSB_" + o.idx + "_container"),
                        i = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")],
                        l = [a.height() / r.outerHeight(!1), a.width() / r.outerWidth(!1)],
                        s = [parseInt(i[0].css("min-height")), Math.round(l[0] * i[0].parent().height()), parseInt(i[1].css("min-width")), Math.round(l[1] * i[1].parent().width())],
                        c = d && s[1] < s[0] ? s[0] : s[1], u = d && s[3] < s[2] ? s[2] : s[3];
                    i[0].css({
                        height: c,
                        "max-height": i[0].parent().height() - 10
                    }).find(".mCSB_dragger_bar").css({"line-height": s[0] + "px"}), i[1].css({
                        width: u,
                        "max-width": i[1].parent().width() - 10
                    })
                }, _scrollRatio: function () {
                    var t = e(this), o = t.data(n), a = e("#mCSB_" + o.idx), r = e("#mCSB_" + o.idx + "_container"),
                        i = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")],
                        l = [r.outerHeight(!1) - a.height(), r.outerWidth(!1) - a.width()],
                        s = [l[0] / (i[0].parent().height() - i[0].height()), l[1] / (i[1].parent().width() - i[1].width())];
                    o.scrollRatio = {y: s[0], x: s[1]}
                }, _onDragClasses: function (e, t, o) {
                    var a = o ? "mCSB_dragger_onDrag_expanded" : "",
                        n = ["mCSB_dragger_onDrag", "mCSB_scrollTools_onDrag"], r = e.closest(".mCSB_scrollTools");
                    "active" === t ? (e.toggleClass(n[0] + " " + a), r.toggleClass(n[1]), e[0]._draggable = e[0]._draggable ? 0 : 1) : e[0]._draggable || ("hide" === t ? (e.removeClass(n[0]), r.removeClass(n[1])) : (e.addClass(n[0]), r.addClass(n[1])))
                }, _overflowed: function () {
                    var t = e(this), o = t.data(n), a = e("#mCSB_" + o.idx), r = e("#mCSB_" + o.idx + "_container"),
                        i = null == o.overflowed ? r.height() : r.outerHeight(!1),
                        l = null == o.overflowed ? r.width() : r.outerWidth(!1);
                    return [i > a.height(), l > a.width()]
                }, _resetContentPosition: function () {
                    var t = e(this), o = t.data(n), a = o.opt, r = e("#mCSB_" + o.idx),
                        i = e("#mCSB_" + o.idx + "_container"),
                        l = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")];
                    if (h._stop(t), ("x" !== a.axis && !o.overflowed[0] || "y" === a.axis && o.overflowed[0]) && (l[0].add(i).css("top", 0), h._scrollTo(t, "_resetY")), "y" !== a.axis && !o.overflowed[1] || "x" === a.axis && o.overflowed[1]) {
                        var s = dx = 0;
                        "rtl" === o.langDir && (s = r.width() - i.outerWidth(!1), dx = Math.abs(s / o.scrollRatio.x)), i.css("left", s), l[1].css("left", dx), h._scrollTo(t, "_resetX")
                    }
                }, _bindEvents: function () {
                    function t() {
                        i = setTimeout(function () {
                            e.event.special.mousewheel ? (clearTimeout(i), h._mousewheel.call(o[0])) : t()
                        }, 1e3)
                    }

                    var o = e(this), a = o.data(n), r = a.opt;
                    if (!a.bindEvents) {
                        if (h._draggable.call(this), r.contentTouchScroll && h._contentDraggable.call(this), r.mouseWheel.enable) {
                            var i;
                            t()
                        }
                        h._draggerRail.call(this), h._wrapperScroll.call(this), r.advanced.autoScrollOnFocus && h._focus.call(this), r.scrollButtons.enable && h._buttons.call(this), r.keyboard.enable && h._keyboard.call(this), a.bindEvents = !0
                    }
                }, _unbindEvents: function () {
                    var t = e(this), a = t.data(n), r = a.opt, i = n + "_" + a.idx, l = ".mCSB_" + a.idx + "_scrollbar",
                        s = e("#mCSB_" + a.idx + ",#mCSB_" + a.idx + "_container,#mCSB_" + a.idx + "_container_wrapper," + l + " .mCSB_draggerContainer,#mCSB_" + a.idx + "_dragger_vertical,#mCSB_" + a.idx + "_dragger_horizontal," + l + ">a"),
                        c = e("#mCSB_" + a.idx + "_container");
                    r.advanced.releaseDraggableSelectors && s.add(e(r.advanced.releaseDraggableSelectors)), a.bindEvents && (e(o).unbind("." + i), s.each(function () {
                        e(this).unbind("." + i)
                    }), clearTimeout(t[0]._focusTimeout), h._delete.call(null, t[0]._focusTimeout), clearTimeout(a.sequential.step), h._delete.call(null, a.sequential.step), clearTimeout(c[0].onCompleteTimeout), h._delete.call(null, c[0].onCompleteTimeout), a.bindEvents = !1)
                }, _scrollbarVisibility: function (t) {
                    var o = e(this), a = o.data(n), r = a.opt, i = e("#mCSB_" + a.idx + "_container_wrapper"),
                        l = i.length ? i : e("#mCSB_" + a.idx + "_container"),
                        s = [e("#mCSB_" + a.idx + "_scrollbar_vertical"), e("#mCSB_" + a.idx + "_scrollbar_horizontal")],
                        c = [s[0].find(".mCSB_dragger"), s[1].find(".mCSB_dragger")];
                    "x" !== r.axis && (a.overflowed[0] && !t ? (s[0].add(c[0]).add(s[0].children("a")).css("display", "block"), l.removeClass("mCS_no_scrollbar_y mCS_y_hidden")) : (r.alwaysShowScrollbar ? (2 !== r.alwaysShowScrollbar && c[0].add(s[0].children("a")).css("display", "none"), l.removeClass("mCS_y_hidden")) : (s[0].css("display", "none"), l.addClass("mCS_y_hidden")), l.addClass("mCS_no_scrollbar_y"))), "y" !== r.axis && (a.overflowed[1] && !t ? (s[1].add(c[1]).add(s[1].children("a")).css("display", "block"), l.removeClass("mCS_no_scrollbar_x mCS_x_hidden")) : (r.alwaysShowScrollbar ? (2 !== r.alwaysShowScrollbar && c[1].add(s[1].children("a")).css("display", "none"), l.removeClass("mCS_x_hidden")) : (s[1].css("display", "none"), l.addClass("mCS_x_hidden")), l.addClass("mCS_no_scrollbar_x"))), a.overflowed[0] || a.overflowed[1] ? o.removeClass("mCS_no_scrollbar") : o.addClass("mCS_no_scrollbar")
                }, _coordinates: function (e) {
                    var t = e.type;
                    switch (t) {
                        case"pointerdown":
                        case"MSPointerDown":
                        case"pointermove":
                        case"MSPointerMove":
                        case"pointerup":
                        case"MSPointerUp":
                            return [e.originalEvent.pageY, e.originalEvent.pageX, !1];
                        case"touchstart":
                        case"touchmove":
                        case"touchend":
                            var o = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0],
                                a = e.originalEvent.touches.length || e.originalEvent.changedTouches.length;
                            return [o.pageY, o.pageX, a > 1];
                        default:
                            return [e.pageY, e.pageX, !1]
                    }
                }, _draggable: function () {
                    function t(e) {
                        var t = p.find("iframe");
                        if (t.length) {
                            var o = e ? "auto" : "none";
                            t.css("pointer-events", o)
                        }
                    }

                    function a(e, t, o, a) {
                        if (p[0].idleTimer = f.scrollInertia < 233 ? 250 : 0, r.attr("id") === m[1]) var n = "x",
                            i = (r[0].offsetLeft - t + a) * c.scrollRatio.x; else var n = "y",
                            i = (r[0].offsetTop - e + o) * c.scrollRatio.y;
                        h._scrollTo(s, i.toString(), {dir: n, drag: !0})
                    }

                    var r, i, l, s = e(this), c = s.data(n), f = c.opt, _ = n + "_" + c.idx,
                        m = ["mCSB_" + c.idx + "_dragger_vertical", "mCSB_" + c.idx + "_dragger_horizontal"],
                        p = e("#mCSB_" + c.idx + "_container"), g = e("#" + m[0] + ",#" + m[1]),
                        v = f.advanced.releaseDraggableSelectors ? g.add(e(f.advanced.releaseDraggableSelectors)) : g;
                    g.bind("mousedown." + _ + " touchstart." + _ + " pointerdown." + _ + " MSPointerDown." + _, function (a) {
                        if (a.stopImmediatePropagation(), a.preventDefault(), h._mouseBtnLeft(a)) {
                            u = !0, d && (o.onselectstart = function () {
                                return !1
                            }), t(!1), h._stop(s), r = e(this);
                            var n = r.offset(), c = h._coordinates(a)[0] - n.top, _ = h._coordinates(a)[1] - n.left,
                                m = r.height() + n.top, p = r.width() + n.left;
                            m > c && c > 0 && p > _ && _ > 0 && (i = c, l = _), h._onDragClasses(r, "active", f.autoExpandScrollbar)
                        }
                    }).bind("touchmove." + _, function (e) {
                        e.stopImmediatePropagation(), e.preventDefault();
                        var t = r.offset(), o = h._coordinates(e)[0] - t.top, n = h._coordinates(e)[1] - t.left;
                        a(i, l, o, n)
                    }), e(o).bind("mousemove." + _ + " pointermove." + _ + " MSPointerMove." + _, function (e) {
                        if (r) {
                            var t = r.offset(), o = h._coordinates(e)[0] - t.top, n = h._coordinates(e)[1] - t.left;
                            if (i === o) return;
                            a(i, l, o, n)
                        }
                    }).add(v).bind("mouseup." + _ + " touchend." + _ + " pointerup." + _ + " MSPointerUp." + _, function () {
                        r && (h._onDragClasses(r, "active", f.autoExpandScrollbar), r = null), u = !1, d && (o.onselectstart = null), t(!0)
                    })
                }, _contentDraggable: function () {
                    function t(e, t) {
                        var o = [1.5 * t, 2 * t, t / 1.5, t / 2];
                        return e > 90 ? t > 4 ? o[0] : o[3] : e > 60 ? t > 3 ? o[3] : o[2] : e > 30 ? t > 8 ? o[1] : t > 6 ? o[0] : t > 4 ? t : o[2] : t > 8 ? t : o[3]
                    }

                    function o(e, t, o, a, n, r) {
                        e && h._scrollTo(g, e.toString(), {dur: t, scrollEasing: o, dir: a, overwrite: n, drag: r})
                    }

                    var a, r, i, l, s, c, d, f, _, m, p, g = e(this), v = g.data(n), x = v.opt, S = n + "_" + v.idx,
                        C = e("#mCSB_" + v.idx), b = e("#mCSB_" + v.idx + "_container"),
                        w = [e("#mCSB_" + v.idx + "_dragger_vertical"), e("#mCSB_" + v.idx + "_dragger_horizontal")],
                        y = [], B = [], T = 0, M = "yx" === x.axis ? "none" : "all", k = [];
                    b.bind("touchstart." + S + " pointerdown." + S + " MSPointerDown." + S, function (e) {
                        if (h._pointerTouch(e) && !u && !h._coordinates(e)[2]) {
                            var t = b.offset();
                            a = h._coordinates(e)[0] - t.top, r = h._coordinates(e)[1] - t.left, k = [h._coordinates(e)[0], h._coordinates(e)[1]]
                        }
                    }).bind("touchmove." + S + " pointermove." + S + " MSPointerMove." + S, function (e) {
                        if (h._pointerTouch(e) && !u && !h._coordinates(e)[2]) {
                            e.stopImmediatePropagation(), c = h._getTime();
                            var t = C.offset(), n = h._coordinates(e)[0] - t.top, i = h._coordinates(e)[1] - t.left,
                                l = "mcsLinearOut";
                            if (y.push(n), B.push(i), k[2] = Math.abs(h._coordinates(e)[0] - k[0]), k[3] = Math.abs(h._coordinates(e)[1] - k[1]), v.overflowed[0]) var s = w[0].parent().height() - w[0].height(),
                                d = a - n > 0 && n - a > -(s * v.scrollRatio.y) && (2 * k[3] < k[2] || "yx" === x.axis);
                            if (v.overflowed[1]) var f = w[1].parent().width() - w[1].width(),
                                _ = r - i > 0 && i - r > -(f * v.scrollRatio.x) && (2 * k[2] < k[3] || "yx" === x.axis);
                            (d || _) && e.preventDefault(), m = "yx" === x.axis ? [a - n, r - i] : "x" === x.axis ? [null, r - i] : [a - n, null], b[0].idleTimer = 250, v.overflowed[0] && o(m[0], T, l, "y", "all", !0), v.overflowed[1] && o(m[1], T, l, "x", M, !0)
                        }
                    }), C.bind("touchstart." + S + " pointerdown." + S + " MSPointerDown." + S, function (e) {
                        if (h._pointerTouch(e) && !u && !h._coordinates(e)[2]) {
                            e.stopImmediatePropagation(), h._stop(g), s = h._getTime();
                            var t = C.offset();
                            i = h._coordinates(e)[0] - t.top, l = h._coordinates(e)[1] - t.left, y = [], B = []
                        }
                    }).bind("touchend." + S + " pointerup." + S + " MSPointerUp." + S, function (e) {
                        if (h._pointerTouch(e) && !u && !h._coordinates(e)[2]) {
                            e.stopImmediatePropagation(), d = h._getTime();
                            var a = C.offset(), n = h._coordinates(e)[0] - a.top, r = h._coordinates(e)[1] - a.left;
                            if (!(d - c > 30)) {
                                _ = 1e3 / (d - s);
                                var g = "mcsEaseOut", S = 2.5 > _, w = S ? [y[y.length - 2], B[B.length - 2]] : [0, 0];
                                f = S ? [n - w[0], r - w[1]] : [n - i, r - l];
                                var T = [Math.abs(f[0]), Math.abs(f[1])];
                                _ = S ? [Math.abs(f[0] / 4), Math.abs(f[1] / 4)] : [_, _];
                                var k = [Math.abs(b[0].offsetTop) - f[0] * t(T[0] / _[0], _[0]), Math.abs(b[0].offsetLeft) - f[1] * t(T[1] / _[1], _[1])];
                                m = "yx" === x.axis ? [k[0], k[1]] : "x" === x.axis ? [null, k[1]] : [k[0], null], p = [4 * T[0] + x.scrollInertia, 4 * T[1] + x.scrollInertia];
                                var O = parseInt(x.contentTouchScroll) || 0;
                                m[0] = T[0] > O ? m[0] : 0, m[1] = T[1] > O ? m[1] : 0, v.overflowed[0] && o(m[0], p[0], g, "y", M, !1), v.overflowed[1] && o(m[1], p[1], g, "x", M, !1)
                            }
                        }
                    })
                }, _mousewheel: function () {
                    function t(e) {
                        var t = null;
                        try {
                            var o = e.contentDocument || e.contentWindow.document;
                            t = o.body.innerHTML
                        } catch (a) {
                        }
                        return null !== t
                    }

                    var o = e(this), a = o.data(n);
                    if (a) {
                        var r = a.opt, i = n + "_" + a.idx, l = e("#mCSB_" + a.idx),
                            s = [e("#mCSB_" + a.idx + "_dragger_vertical"), e("#mCSB_" + a.idx + "_dragger_horizontal")],
                            c = e("#mCSB_" + a.idx + "_container").find("iframe"), u = l;
                        c.length && c.each(function () {
                            var o = this;
                            t(o) && (u = u.add(e(o).contents().find("body")))
                        }), u.bind("mousewheel." + i, function (t, n) {
                            if (h._stop(o), !h._disableMousewheel(o, t.target)) {
                                var i = "auto" !== r.mouseWheel.deltaFactor ? parseInt(r.mouseWheel.deltaFactor) : d && t.deltaFactor < 100 ? 100 : t.deltaFactor || 100;
                                if ("x" === r.axis || "x" === r.mouseWheel.axis) var c = "x",
                                    u = [Math.round(i * a.scrollRatio.x), parseInt(r.mouseWheel.scrollAmount)],
                                    f = "auto" !== r.mouseWheel.scrollAmount ? u[1] : u[0] >= l.width() ? .9 * l.width() : u[0],
                                    _ = Math.abs(e("#mCSB_" + a.idx + "_container")[0].offsetLeft),
                                    m = s[1][0].offsetLeft, p = s[1].parent().width() - s[1].width(),
                                    g = t.deltaX || t.deltaY || n; else var c = "y",
                                    u = [Math.round(i * a.scrollRatio.y), parseInt(r.mouseWheel.scrollAmount)],
                                    f = "auto" !== r.mouseWheel.scrollAmount ? u[1] : u[0] >= l.height() ? .9 * l.height() : u[0],
                                    _ = Math.abs(e("#mCSB_" + a.idx + "_container")[0].offsetTop),
                                    m = s[0][0].offsetTop, p = s[0].parent().height() - s[0].height(),
                                    g = t.deltaY || n;
                                "y" === c && !a.overflowed[0] || "x" === c && !a.overflowed[1] || (r.mouseWheel.invert && (g = -g), r.mouseWheel.normalizeDelta && (g = 0 > g ? -1 : 1), (g > 0 && 0 !== m || 0 > g && m !== p || r.mouseWheel.preventDefault) && (t.stopImmediatePropagation(), t.preventDefault()), h._scrollTo(o, (_ - g * f).toString(), {dir: c}))
                            }
                        })
                    }
                }, _disableMousewheel: function (t, o) {
                    var a = o.nodeName.toLowerCase(), r = t.data(n).opt.mouseWheel.disableOver,
                        i = ["select", "textarea"];
                    return e.inArray(a, r) > -1 && !(e.inArray(a, i) > -1 && !e(o).is(":focus"))
                }, _draggerRail: function () {
                    var t = e(this), o = t.data(n), a = n + "_" + o.idx, r = e("#mCSB_" + o.idx + "_container"),
                        i = r.parent(), l = e(".mCSB_" + o.idx + "_scrollbar .mCSB_draggerContainer");
                    l.bind("touchstart." + a + " pointerdown." + a + " MSPointerDown." + a, function () {
                        u = !0
                    }).bind("touchend." + a + " pointerup." + a + " MSPointerUp." + a, function () {
                        u = !1
                    }).bind("click." + a, function (a) {
                        if (e(a.target).hasClass("mCSB_draggerContainer") || e(a.target).hasClass("mCSB_draggerRail")) {
                            h._stop(t);
                            var n = e(this), l = n.find(".mCSB_dragger");
                            if (n.parent(".mCSB_scrollTools_horizontal").length > 0) {
                                if (!o.overflowed[1]) return;
                                var s = "x", c = a.pageX > l.offset().left ? -1 : 1,
                                    d = Math.abs(r[0].offsetLeft) - .9 * c * i.width()
                            } else {
                                if (!o.overflowed[0]) return;
                                var s = "y", c = a.pageY > l.offset().top ? -1 : 1,
                                    d = Math.abs(r[0].offsetTop) - .9 * c * i.height()
                            }
                            h._scrollTo(t, d.toString(), {dir: s, scrollEasing: "mcsEaseInOut"})
                        }
                    })
                }, _focus: function () {
                    var t = e(this), a = t.data(n), r = a.opt, i = n + "_" + a.idx,
                        l = e("#mCSB_" + a.idx + "_container"), s = l.parent();
                    l.bind("focusin." + i, function () {
                        var a = e(o.activeElement), n = l.find(".mCustomScrollBox").length, i = 0;
                        a.is(r.advanced.autoScrollOnFocus) && (h._stop(t), clearTimeout(t[0]._focusTimeout), t[0]._focusTimer = n ? (i + 17) * n : 0, t[0]._focusTimeout = setTimeout(function () {
                            var e = [a.offset().top - l.offset().top, a.offset().left - l.offset().left],
                                o = [l[0].offsetTop, l[0].offsetLeft],
                                n = [o[0] + e[0] >= 0 && o[0] + e[0] < s.height() - a.outerHeight(!1), o[1] + e[1] >= 0 && o[0] + e[1] < s.width() - a.outerWidth(!1)],
                                c = "yx" !== r.axis || n[0] || n[1] ? "all" : "none";
                            "x" === r.axis || n[0] || h._scrollTo(t, e[0].toString(), {
                                dir: "y",
                                scrollEasing: "mcsEaseInOut",
                                overwrite: c,
                                dur: i
                            }), "y" === r.axis || n[1] || h._scrollTo(t, e[1].toString(), {
                                dir: "x",
                                scrollEasing: "mcsEaseInOut",
                                overwrite: c,
                                dur: i
                            })
                        }, t[0]._focusTimer))
                    })
                }, _wrapperScroll: function () {
                    var t = e(this), o = t.data(n), a = n + "_" + o.idx,
                        r = e("#mCSB_" + o.idx + "_container").parent();
                    r.bind("scroll." + a, function () {
                        (0 !== r.scrollTop() || 0 !== r.scrollLeft()) && e(".mCSB_" + o.idx + "_scrollbar").css("visibility", "hidden")
                    })
                }, _buttons: function () {
                    var t = e(this), o = t.data(n), a = o.opt, r = o.sequential, i = n + "_" + o.idx,
                        l = (e("#mCSB_" + o.idx + "_container"), ".mCSB_" + o.idx + "_scrollbar"), s = e(l + ">a");
                    s.bind("mousedown." + i + " touchstart." + i + " pointerdown." + i + " MSPointerDown." + i + " mouseup." + i + " touchend." + i + " pointerup." + i + " MSPointerUp." + i + " mouseout." + i + " pointerout." + i + " MSPointerOut." + i + " click." + i, function (n) {
                        function i(e, o) {
                            r.scrollAmount = a.snapAmount || a.scrollButtons.scrollAmount, h._sequentialScroll.call(this, t, e, o)
                        }

                        if (n.preventDefault(), h._mouseBtnLeft(n)) {
                            var l = e(this).attr("class");
                            switch (r.type = a.scrollButtons.scrollType, n.type) {
                                case"mousedown":
                                case"touchstart":
                                case"pointerdown":
                                case"MSPointerDown":
                                    if ("stepped" === r.type) return;
                                    u = !0, o.tweenRunning = !1, i("on", l);
                                    break;
                                case"mouseup":
                                case"touchend":
                                case"pointerup":
                                case"MSPointerUp":
                                case"mouseout":
                                case"pointerout":
                                case"MSPointerOut":
                                    if ("stepped" === r.type) return;
                                    u = !1, r.dir && i("off", l);
                                    break;
                                case"click":
                                    if ("stepped" !== r.type || o.tweenRunning) return;
                                    i("on", l)
                            }
                        }
                    })
                }, _keyboard: function () {
                    var t = e(this), a = t.data(n), r = a.opt, i = a.sequential, l = n + "_" + a.idx,
                        s = e("#mCSB_" + a.idx), c = e("#mCSB_" + a.idx + "_container"), d = c.parent(),
                        u = "input,textarea,select,datalist,keygen,[contenteditable='true']";
                    s.attr("tabindex", "0").bind("blur." + l + " keydown." + l + " keyup." + l, function (n) {
                        function l(e, o) {
                            i.type = r.keyboard.scrollType, i.scrollAmount = r.snapAmount || r.keyboard.scrollAmount, "stepped" === i.type && a.tweenRunning || h._sequentialScroll.call(this, t, e, o)
                        }

                        switch (n.type) {
                            case"blur":
                                a.tweenRunning && i.dir && l("off", null);
                                break;
                            case"keydown":
                            case"keyup":
                                var s = n.keyCode ? n.keyCode : n.which, f = "on";
                                if ("x" !== r.axis && (38 === s || 40 === s) || "y" !== r.axis && (37 === s || 39 === s)) {
                                    if ((38 === s || 40 === s) && !a.overflowed[0] || (37 === s || 39 === s) && !a.overflowed[1]) return;
                                    "keyup" === n.type && (f = "off"), e(o.activeElement).is(u) || (n.preventDefault(), n.stopImmediatePropagation(), l(f, s))
                                } else if (33 === s || 34 === s) {
                                    if ((a.overflowed[0] || a.overflowed[1]) && (n.preventDefault(), n.stopImmediatePropagation()), "keyup" === n.type) {
                                        h._stop(t);
                                        var _ = 34 === s ? -1 : 1;
                                        if ("x" === r.axis || "yx" === r.axis && a.overflowed[1] && !a.overflowed[0]) var m = "x",
                                            p = Math.abs(c[0].offsetLeft) - .9 * _ * d.width(); else var m = "y",
                                            p = Math.abs(c[0].offsetTop) - .9 * _ * d.height();
                                        h._scrollTo(t, p.toString(), {dir: m, scrollEasing: "mcsEaseInOut"})
                                    }
                                } else if ((35 === s || 36 === s) && !e(o.activeElement).is(u) && ((a.overflowed[0] || a.overflowed[1]) && (n.preventDefault(), n.stopImmediatePropagation()), "keyup" === n.type)) {
                                    if ("x" === r.axis || "yx" === r.axis && a.overflowed[1] && !a.overflowed[0]) var m = "x",
                                        p = 35 === s ? Math.abs(d.width() - c.outerWidth(!1)) : 0; else var m = "y",
                                        p = 35 === s ? Math.abs(d.height() - c.outerHeight(!1)) : 0;
                                    h._scrollTo(t, p.toString(), {dir: m, scrollEasing: "mcsEaseInOut"})
                                }
                        }
                    })
                }, _sequentialScroll: function (t, o, a) {
                    function r(e) {
                        var o = "stepped" !== c.type, a = e ? o ? s.scrollInertia / 1.5 : s.scrollInertia : 1e3 / 60,
                            n = e ? o ? 7.5 : 40 : 2.5, i = [Math.abs(d[0].offsetTop), Math.abs(d[0].offsetLeft)],
                            u = [l.scrollRatio.y > 10 ? 10 : l.scrollRatio.y, l.scrollRatio.x > 10 ? 10 : l.scrollRatio.x],
                            f = "x" === c.dir[0] ? i[1] + c.dir[1] * u[1] * n : i[0] + c.dir[1] * u[0] * n,
                            _ = "x" === c.dir[0] ? i[1] + c.dir[1] * parseInt(c.scrollAmount) : i[0] + c.dir[1] * parseInt(c.scrollAmount),
                            m = "auto" !== c.scrollAmount ? _ : f,
                            p = e ? o ? "mcsLinearOut" : "mcsEaseInOut" : "mcsLinear", g = e ? !0 : !1;
                        return e && 17 > a && (m = "x" === c.dir[0] ? i[1] : i[0]), h._scrollTo(t, m.toString(), {
                            dir: c.dir[0],
                            scrollEasing: p,
                            dur: a,
                            onComplete: g
                        }), e ? void (c.dir = !1) : (clearTimeout(c.step), void (c.step = setTimeout(function () {
                            r()
                        }, a)))
                    }

                    function i() {
                        clearTimeout(c.step), h._stop(t)
                    }

                    var l = t.data(n), s = l.opt, c = l.sequential, d = e("#mCSB_" + l.idx + "_container"),
                        u = "stepped" === c.type ? !0 : !1;
                    switch (o) {
                        case"on":
                            if (c.dir = ["mCSB_buttonRight" === a || "mCSB_buttonLeft" === a || 39 === a || 37 === a ? "x" : "y", "mCSB_buttonUp" === a || "mCSB_buttonLeft" === a || 38 === a || 37 === a ? -1 : 1], h._stop(t), h._isNumeric(a) && "stepped" === c.type) return;
                            r(u);
                            break;
                        case"off":
                            i(), (u || l.tweenRunning && c.dir) && r(!0)
                    }
                }, _arr: function (t) {
                    var o = e(this).data(n).opt, a = [];
                    return "function" == typeof t && (t = t()), t instanceof Array ? a = t.length > 1 ? [t[0], t[1]] : "x" === o.axis ? [null, t[0]] : [t[0], null] : (a[0] = t.y ? t.y : t.x || "x" === o.axis ? null : t, a[1] = t.x ? t.x : t.y || "y" === o.axis ? null : t), "function" == typeof a[0] && (a[0] = a[0]()), "function" == typeof a[1] && (a[1] = a[1]()), a
                }, _to: function (t, o) {
                    if (null != t && "undefined" != typeof t) {
                        var a = e(this), r = a.data(n), i = r.opt, l = e("#mCSB_" + r.idx + "_container"),
                            s = l.parent(), c = typeof t;
                        o || (o = "x" === i.axis ? "x" : "y");
                        var d = "x" === o ? l.outerWidth(!1) : l.outerHeight(!1),
                            u = "x" === o ? l.offset().left : l.offset().top,
                            _ = "x" === o ? l[0].offsetLeft : l[0].offsetTop, m = "x" === o ? "left" : "top";
                        switch (c) {
                            case"function":
                                return t();
                            case"object":
                                if (t.nodeType) var p = "x" === o ? e(t).offset().left : e(t).offset().top; else if (t.jquery) {
                                    if (!t.length) return;
                                    var p = "x" === o ? t.offset().left : t.offset().top
                                }
                                return p - u;
                            case"string":
                            case"number":
                                if (h._isNumeric.call(null, t)) return Math.abs(t);
                                if (-1 !== t.indexOf("%")) return Math.abs(d * parseInt(t) / 100);
                                if (-1 !== t.indexOf("-=")) return Math.abs(_ - parseInt(t.split("-=")[1]));
                                if (-1 !== t.indexOf("+=")) {
                                    var g = _ + parseInt(t.split("+=")[1]);
                                    return g >= 0 ? 0 : Math.abs(g)
                                }
                                if (-1 !== t.indexOf("px") && h._isNumeric.call(null, t.split("px")[0])) return Math.abs(t.split("px")[0]);
                                if ("top" === t || "left" === t) return 0;
                                if ("bottom" === t) return Math.abs(s.height() - l.outerHeight(!1));
                                if ("right" === t) return Math.abs(s.width() - l.outerWidth(!1));
                                if ("first" === t || "last" === t) {
                                    var v = l.find(":" + t), p = "x" === o ? e(v).offset().left : e(v).offset().top;
                                    return p - u
                                }
                                if (e(t).length) {
                                    var p = "x" === o ? e(t).offset().left : e(t).offset().top;
                                    return p - u
                                }
                                return l.css(m, t), void f.update.call(null, a[0])
                        }
                    }
                }, _autoUpdate: function (t) {
                    function o() {
                        clearTimeout(u[0].autoUpdate), u[0].autoUpdate = setTimeout(function () {
                            return d.advanced.updateOnSelectorChange && (_ = i(), _ !== S) ? (l(), void (S = _)) : (d.advanced.updateOnContentResize && (m = [u.outerHeight(!1), u.outerWidth(!1), g.height(), g.width(), x()[0], x()[1]], (m[0] !== C[0] || m[1] !== C[1] || m[2] !== C[2] || m[3] !== C[3] || m[4] !== C[4] || m[5] !== C[5]) && (l(), C = m)), d.advanced.updateOnImageLoad && (p = a(), p !== b && (u.find("img").each(function () {
                                r(this.src)
                            }), b = p)), void ((d.advanced.updateOnSelectorChange || d.advanced.updateOnContentResize || d.advanced.updateOnImageLoad) && o()))
                        }, 60)
                    }

                    function a() {
                        var e = 0;
                        return d.advanced.updateOnImageLoad && (e = u.find("img").length), e
                    }

                    function r(e) {
                        function t(e, t) {
                            return function () {
                                return t.apply(e, arguments)
                            }
                        }

                        function o() {
                            this.onload = null, l()
                        }

                        var a = new Image;
                        a.onload = t(a, o), a.src = e
                    }

                    function i() {
                        d.advanced.updateOnSelectorChange === !0 && (d.advanced.updateOnSelectorChange = "*");
                        var t = 0, o = u.find(d.advanced.updateOnSelectorChange);
                        return d.advanced.updateOnSelectorChange && o.length > 0 && o.each(function () {
                            t += e(this).height() + e(this).width()
                        }), t
                    }

                    function l() {
                        clearTimeout(u[0].autoUpdate), f.update.call(null, s[0])
                    }

                    var s = e(this), c = s.data(n), d = c.opt, u = e("#mCSB_" + c.idx + "_container");
                    if (t) return clearTimeout(u[0].autoUpdate), void h._delete.call(null, u[0].autoUpdate);
                    var _, m, p, g = u.parent(),
                        v = [e("#mCSB_" + c.idx + "_scrollbar_vertical"), e("#mCSB_" + c.idx + "_scrollbar_horizontal")],
                        x = function () {
                            return [v[0].is(":visible") ? v[0].outerHeight(!0) : 0, v[1].is(":visible") ? v[1].outerWidth(!0) : 0]
                        }, S = i(), C = [u.outerHeight(!1), u.outerWidth(!1), g.height(), g.width(), x()[0], x()[1]],
                        b = a();
                    o()
                }, _snapAmount: function (e, t, o) {
                    return Math.round(e / t) * t - o
                }, _stop: function (t) {
                    var o = t.data(n),
                        a = e("#mCSB_" + o.idx + "_container,#mCSB_" + o.idx + "_container_wrapper,#mCSB_" + o.idx + "_dragger_vertical,#mCSB_" + o.idx + "_dragger_horizontal");
                    a.each(function () {
                        h._stopTween.call(this)
                    })
                }, _scrollTo: function (t, o, a) {
                    function r(e) {
                        return s && c.callbacks[e] && "function" == typeof c.callbacks[e]
                    }

                    function i() {
                        return [c.callbacks.alwaysTriggerOffsets || S >= C[0] + w, c.callbacks.alwaysTriggerOffsets || -y >= S]
                    }

                    function l() {
                        var e = [_[0].offsetTop, _[0].offsetLeft], o = [v[0].offsetTop, v[0].offsetLeft],
                            n = [_.outerHeight(!1), _.outerWidth(!1)], r = [f.height(), f.width()];
                        t[0].mcs = {
                            content: _,
                            top: e[0],
                            left: e[1],
                            draggerTop: o[0],
                            draggerLeft: o[1],
                            topPct: Math.round(100 * Math.abs(e[0]) / (Math.abs(n[0]) - r[0])),
                            leftPct: Math.round(100 * Math.abs(e[1]) / (Math.abs(n[1]) - r[1])),
                            direction: a.dir
                        }
                    }

                    var s = t.data(n), c = s.opt, d = {
                            trigger: "internal",
                            dir: "y",
                            scrollEasing: "mcsEaseOut",
                            drag: !1,
                            dur: c.scrollInertia,
                            overwrite: "all",
                            callbacks: !0,
                            onStart: !0,
                            onUpdate: !0,
                            onComplete: !0
                        }, a = e.extend(d, a), u = [a.dur, a.drag ? 0 : a.dur], f = e("#mCSB_" + s.idx),
                        _ = e("#mCSB_" + s.idx + "_container"), m = _.parent(),
                        p = c.callbacks.onTotalScrollOffset ? h._arr.call(t, c.callbacks.onTotalScrollOffset) : [0, 0],
                        g = c.callbacks.onTotalScrollBackOffset ? h._arr.call(t, c.callbacks.onTotalScrollBackOffset) : [0, 0];
                    if (s.trigger = a.trigger, (0 !== m.scrollTop() || 0 !== m.scrollLeft()) && (e(".mCSB_" + s.idx + "_scrollbar").css("visibility", "visible"), m.scrollTop(0).scrollLeft(0)), "_resetY" !== o || s.contentReset.y || (r("onOverflowYNone") && c.callbacks.onOverflowYNone.call(t[0]), s.contentReset.y = 1), "_resetX" !== o || s.contentReset.x || (r("onOverflowXNone") && c.callbacks.onOverflowXNone.call(t[0]), s.contentReset.x = 1), "_resetY" !== o && "_resetX" !== o) {
                        switch (!s.contentReset.y && t[0].mcs || !s.overflowed[0] || (r("onOverflowY") && c.callbacks.onOverflowY.call(t[0]), s.contentReset.x = null), !s.contentReset.x && t[0].mcs || !s.overflowed[1] || (r("onOverflowX") && c.callbacks.onOverflowX.call(t[0]), s.contentReset.x = null), c.snapAmount && (o = h._snapAmount(o, c.snapAmount, c.snapOffset)), a.dir) {
                            case"x":
                                var v = e("#mCSB_" + s.idx + "_dragger_horizontal"), x = "left", S = _[0].offsetLeft,
                                    C = [f.width() - _.outerWidth(!1), v.parent().width() - v.width()],
                                    b = [o, 0 === o ? 0 : o / s.scrollRatio.x], w = p[1], y = g[1],
                                    B = w > 0 ? w / s.scrollRatio.x : 0, T = y > 0 ? y / s.scrollRatio.x : 0;
                                break;
                            case"y":
                                var v = e("#mCSB_" + s.idx + "_dragger_vertical"), x = "top", S = _[0].offsetTop,
                                    C = [f.height() - _.outerHeight(!1), v.parent().height() - v.height()],
                                    b = [o, 0 === o ? 0 : o / s.scrollRatio.y], w = p[0], y = g[0],
                                    B = w > 0 ? w / s.scrollRatio.y : 0, T = y > 0 ? y / s.scrollRatio.y : 0
                        }
                        b[1] < 0 || 0 === b[0] && 0 === b[1] ? b = [0, 0] : b[1] >= C[1] ? b = [C[0], C[1]] : b[0] = -b[0], t[0].mcs || (l(), r("onInit") && c.callbacks.onInit.call(t[0])), clearTimeout(_[0].onCompleteTimeout), (s.tweenRunning || !(0 === S && b[0] >= 0 || S === C[0] && b[0] <= C[0])) && (h._tweenTo.call(null, v[0], x, Math.round(b[1]), u[1], a.scrollEasing), h._tweenTo.call(null, _[0], x, Math.round(b[0]), u[0], a.scrollEasing, a.overwrite, {
                            onStart: function () {
                                a.callbacks && a.onStart && !s.tweenRunning && (r("onScrollStart") && (l(), c.callbacks.onScrollStart.call(t[0])), s.tweenRunning = !0, h._onDragClasses(v), s.cbOffsets = i())
                            }, onUpdate: function () {
                                a.callbacks && a.onUpdate && r("whileScrolling") && (l(), c.callbacks.whileScrolling.call(t[0]))
                            }, onComplete: function () {
                                if (a.callbacks && a.onComplete) {
                                    "yx" === c.axis && clearTimeout(_[0].onCompleteTimeout);
                                    var e = _[0].idleTimer || 0;
                                    _[0].onCompleteTimeout = setTimeout(function () {
                                        r("onScroll") && (l(), c.callbacks.onScroll.call(t[0])), r("onTotalScroll") && b[1] >= C[1] - B && s.cbOffsets[0] && (l(), c.callbacks.onTotalScroll.call(t[0])), r("onTotalScrollBack") && b[1] <= T && s.cbOffsets[1] && (l(), c.callbacks.onTotalScrollBack.call(t[0])), s.tweenRunning = !1, _[0].idleTimer = 0, h._onDragClasses(v, "hide")
                                    }, e)
                                }
                            }
                        }))
                    }
                }, _tweenTo: function (e, o, a, n, r, i, l) {
                    function s() {
                        w.stop || (S || p.call(), S = h._getTime() - x, c(), S >= w.time && (w.time = S > w.time ? S + _ - (S - w.time) : S + _ - 1, w.time < S + 1 && (w.time = S + 1)), w.time < n ? w.id = m(s) : v.call())
                    }

                    function c() {
                        n > 0 ? (w.currVal = f(w.time, C, y, n, r), b[o] = Math.round(w.currVal) + "px") : b[o] = a + "px", g.call()
                    }

                    function d() {
                        _ = 1e3 / 60, w.time = S + _, m = t.requestAnimationFrame ? t.requestAnimationFrame : function (e) {
                            return c(), setTimeout(e, .01)
                        }, w.id = m(s)
                    }

                    function u() {
                        null != w.id && (t.requestAnimationFrame ? t.cancelAnimationFrame(w.id) : clearTimeout(w.id), w.id = null)
                    }

                    function f(e, t, o, a, n) {
                        switch (n) {
                            case"linear":
                            case"mcsLinear":
                                return o * e / a + t;
                            case"mcsLinearOut":
                                return e /= a, e--, o * Math.sqrt(1 - e * e) + t;
                            case"easeInOutSmooth":
                                return e /= a / 2, 1 > e ? o / 2 * e * e + t : (e--, -o / 2 * (e * (e - 2) - 1) + t);
                            case"easeInOutStrong":
                                return e /= a / 2, 1 > e ? o / 2 * Math.pow(2, 10 * (e - 1)) + t : (e--, o / 2 * (-Math.pow(2, -10 * e) + 2) + t);
                            case"easeInOut":
                            case"mcsEaseInOut":
                                return e /= a / 2, 1 > e ? o / 2 * e * e * e + t : (e -= 2, o / 2 * (e * e * e + 2) + t);
                            case"easeOutSmooth":
                                return e /= a, e--, -o * (e * e * e * e - 1) + t;
                            case"easeOutStrong":
                                return o * (-Math.pow(2, -10 * e / a) + 1) + t;
                            case"easeOut":
                            case"mcsEaseOut":
                            default:
                                var r = (e /= a) * e, i = r * e;
                                return t + o * (.499999999999997 * i * r + -2.5 * r * r + 5.5 * i + -6.5 * r + 4 * e)
                        }
                    }

                    e._malihuTween || (e._malihuTween = {top: {}, left: {}});
                    var _, m, l = l || {}, p = l.onStart || function () {
                    }, g = l.onUpdate || function () {
                    }, v = l.onComplete || function () {
                    }, x = h._getTime(), S = 0, C = e.offsetTop, b = e.style, w = e._malihuTween[o];
                    "left" === o && (C = e.offsetLeft);
                    var y = a - C;
                    w.stop = 0, "none" !== i && u(), d()
                }, _getTime: function () {
                    return t.performance && t.performance.now ? t.performance.now() : t.performance && t.performance.webkitNow ? t.performance.webkitNow() : Date.now ? Date.now() : (new Date).getTime()
                }, _stopTween: function () {
                    var e = this;
                    e._malihuTween || (e._malihuTween = {
                        top: {},
                        left: {}
                    }), e._malihuTween.top.id && (t.requestAnimationFrame ? t.cancelAnimationFrame(e._malihuTween.top.id) : clearTimeout(e._malihuTween.top.id), e._malihuTween.top.id = null, e._malihuTween.top.stop = 1), e._malihuTween.left.id && (t.requestAnimationFrame ? t.cancelAnimationFrame(e._malihuTween.left.id) : clearTimeout(e._malihuTween.left.id), e._malihuTween.left.id = null, e._malihuTween.left.stop = 1)
                }, _delete: function (e) {
                    try {
                        delete e
                    } catch (t) {
                        e = null
                    }
                }, _mouseBtnLeft: function (e) {
                    return !(e.which && 1 !== e.which)
                }, _pointerTouch: function (e) {
                    var t = e.originalEvent.pointerType;
                    return !(t && "touch" !== t && 2 !== t)
                }, _isNumeric: function (e) {
                    return !isNaN(parseFloat(e)) && isFinite(e)
                }
            };
            e.fn[a] = function (t) {
                return f[t] ? f[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof t && t ? void e.error("Method " + t + " does not exist") : f.init.apply(this, arguments)
            }, e[a] = function (t) {
                return f[t] ? f[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof t && t ? void e.error("Method " + t + " does not exist") : f.init.apply(this, arguments)
            }, e[a].defaults = i, t[a] = !0, e(t).load(function () {
                e(r)[a]()
            })
        })
    }(jQuery, window, document);

// =====================================================================================================================
    /*
 * Project: Bootstrap Growl - v2.0.1 | Author: Mouse0270 aka Robert McIntosh |
 * License: MIT License | Website: https://github.com/mouse0270/bootstrap-growl
 */
    (function (e, t, n, r) {
        var i = "growl", s = "plugin_" + i, o = {
            element: "body",
            type: "info",
            allow_dismiss: true,
            placement: {from: "top", align: "right"},
            offset: 20,
            spacing: 10,
            z_index: 1031,
            delay: 5e3,
            timer: 1e3,
            url_target: "_blank",
            mouse_over: false,
            animate: {enter: "animated fadeInDown", exit: "animated fadeOutUp"},
            onShow: null,
            onShown: null,
            onHide: null,
            onHidden: null,
            icon_type: "class",
            template: '<div data-growl="container" class="alert" role="alert"><button type="button" aria-hidden="true" class="close" data-growl="dismiss">&times;</button><span data-growl="icon"></span><span data-growl="title"></span><span data-growl="message"></span><a href="#" data-growl="url"></a></div>'
        };
        var u = function (t, n) {
            o = e.extend(true, {}, o, n)
        }, a = function (t) {
            if (!t) {
                e('[data-growl="container"]').find('[data-growl="dismiss"]').trigger("click")
            } else {
                e('[data-growl="container"][data-growl-position="' + t + '"]').find('[data-growl="dismiss"]').trigger("click")
            }
        }, f = function (t, n, r) {
            var n = {
                content: {
                    message: typeof n == "object" ? n.message : n,
                    title: n.title ? n.title : null,
                    icon: n.icon ? n.icon : null,
                    url: n.url ? n.url : null
                }
            };
            r = e.extend(true, {}, n, r);
            this.settings = e.extend(true, {}, o, r);
            plugin = this;
            l(r, this.settings, plugin);
            this.$template = $template
        }, l = function (e, t, n) {
            var r = {settings: t, element: t.element, template: t.template};
            if (typeof t.offset == "number") {
                t.offset = {x: t.offset, y: t.offset}
            }
            $template = c(r);
            h($template, r.settings);
            p($template, r.settings);
            d($template, r.settings, n)
        }, c = function (t) {
            var n = e(t.settings.template);
            n.addClass("alert-" + t.settings.type);
            n.attr("data-growl-position", t.settings.placement.from + "-" + t.settings.placement.align);
            n.find('[data-growl="dismiss"]').css("display", "none");
            n.removeClass("alert-dismissable");
            if (t.settings.allow_dismiss) {
                n.addClass("alert-dismissable");
                n.find('[data-growl="dismiss"]').css("display", "block")
            }
            return n
        }, h = function (e, t) {
            e.find('[data-growl="dismiss"]').css({"z-index": t.z_index - 1 >= 1 ? t.z_index - 1 : 1});
            if (t.content.icon) {
                if (t.icon_type.toLowerCase() == "class") {
                    e.find('[data-growl="icon"]').addClass(t.content.icon)
                } else {
                    if (e.find('[data-growl="icon"]').is("img")) {
                        e.find('[data-growl="icon"]').attr("src", t.content.icon)
                    } else {
                        e.find('[data-growl="icon"]').append('<img src="' + t.content.icon + '" />')
                    }
                }
            }
            if (t.content.title) {
                e.find('[data-growl="title"]').html(t.content.title)
            }
            if (t.content.message) {
                e.find('[data-growl="message"]').html(t.content.message)
            }
            if (t.content.url) {
                e.find('[data-growl="url"]').attr("href", t.content.url).attr("target", t.url_target);
                e.find('[data-growl="url"]').css({
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    "z-index": t.z_index - 2 >= 1 ? t.z_index - 2 : 1
                })
            }
        }, p = function (t, n) {
            var r = n.offset.y, i = {
                position: n.element === "body" ? "fixed" : "absolute",
                margin: 0,
                "z-index": n.z_index,
                display: "inline-block"
            }, s = false;
            e('[data-growl-position="' + n.placement.from + "-" + n.placement.align + '"]').each(function () {
                return r = Math.max(r, parseInt(e(this).css(n.placement.from)) + e(this).outerHeight() + n.spacing)
            });
            i[n.placement.from] = r + "px";
            t.css(i);
            if (n.onShow) {
                n.onShow(event)
            }
            e(n.element).append(t);
            switch (n.placement.align) {
                case"center":
                    t.css({left: "50%", marginLeft: -(t.outerWidth() / 2) + "px"});
                    break;
                case"left":
                    t.css("left", n.offset.x + "px");
                    break;
                case"right":
                    t.css("right", n.offset.x + "px");
                    break
            }
            t.addClass("growl-animated");
            t.one("webkitAnimationStart oanimationstart MSAnimationStart animationstart", function (e) {
                s = true
            });
            t.one("webkitAnimationEnd oanimationend MSAnimationEnd animationend", function (e) {
                if (n.onShown) {
                    n.onShown(e)
                }
            });
            setTimeout(function () {
                if (!s) {
                    if (n.onShown) {
                        n.onShown(event)
                    }
                }
            }, 600)
        }, d = function (e, t, n) {
            e.addClass(t.animate.enter);
            e.find('[data-growl="dismiss"]').on("click", function () {
                n.close()
            });
            e.on("mouseover", function (t) {
                e.addClass("hovering")
            }).on("mouseout", function () {
                e.removeClass("hovering")
            });
            if (t.delay >= 1) {
                e.data("growl-delay", t.delay);
                var r = setInterval(function () {
                    var i = parseInt(e.data("growl-delay")) - t.timer;
                    if (!e.hasClass("hovering") && t.mouse_over == "pause" || t.mouse_over != "pause") {
                        e.data("growl-delay", i)
                    }
                    if (i <= 0) {
                        clearInterval(r);
                        n.close()
                    }
                }, t.timer)
            }
        };
        f.prototype = {
            update: function (e, t) {
                switch (e) {
                    case"icon":
                        if (this.settings.icon_type.toLowerCase() == "class") {
                            this.$template.find('[data-growl="icon"]').removeClass(this.settings.content.icon);
                            this.$template.find('[data-growl="icon"]').addClass(t)
                        } else {
                            if (this.$template.find('[data-growl="icon"]').is("img")) {
                                this.$template.find('[data-growl="icon"]')
                            } else {
                                this.$template.find('[data-growl="icon"]').find("img").attr().attr("src", t)
                            }
                        }
                        break;
                    case"url":
                        this.$template.find('[data-growl="url"]').attr("href", t);
                        break;
                    case"type":
                        this.$template.removeClass("alert-" + this.settings.type);
                        this.$template.addClass("alert-" + t);
                        break;
                    default:
                        this.$template.find('[data-growl="' + e + '"]').html(t)
                }
                return this
            }, close: function () {
                var t = this.$template, n = this.settings, r = t.css(n.placement.from), i = false;
                if (n.onHide) {
                    n.onHide(event)
                }
                t.addClass(this.settings.animate.exit);
                t.nextAll('[data-growl-position="' + this.settings.placement.from + "-" + this.settings.placement.align + '"]').each(function () {
                    e(this).css(n.placement.from, r);
                    r = parseInt(r) + n.spacing + e(this).outerHeight()
                });
                t.one("webkitAnimationStart oanimationstart MSAnimationStart animationstart", function (e) {
                    i = true
                });
                t.one("webkitAnimationEnd oanimationend MSAnimationEnd animationend", function (t) {
                    e(this).remove();
                    if (n.onHidden) {
                        n.onHidden(t)
                    }
                });
                setTimeout(function () {
                    if (!i) {
                        t.remove();
                        if (n.onHidden) {
                            n.onHidden(event)
                        }
                    }
                }, 100);
                return this
            }
        };
        e.growl = function (e, t) {
            if (e == false && t.command == "closeAll") {
                a(t.position);
                return false
            } else if (e == false) {
                u(this, t);
                return false
            }
            var n = new f(this, e, t);
            return n
        }
    })(jQuery, window, document);
// =====================================================================================================================
// =====================================================================================================================

    /*
 * Copyright 2014 Igor Vaynberg
 *
 * Version: 3.5.2 Timestamp: Sat Nov 1 14:43:36 EDT 2014
 *
 * This software is licensed under the Apache License, Version 2.0 (the "Apache
 * License") or the GNU General Public License version 2 (the "GPL License").
 * You may choose either license to govern your use of this software only upon
 * the condition that you accept all of the terms of either the Apache License
 * or the GPL License.
 *
 * You may obtain a copy of the Apache License and the GPL License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Apache License or the GPL Licesnse is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the Apache License and the GPL License for the specific
 * language governing permissions and limitations under the Apache License and
 * the GPL License.
 */
    !function (a) {
        "undefined" == typeof a.fn.each2 && a.extend(a.fn, {
            each2: function (b) {
                for (var c = a([0]), d = -1, e = this.length; ++d < e && (c.context = c[0] = this[d]) && b.call(c[0], d, c) !== !1;) ;
                return this
            }
        })
    }(jQuery), function (a, b) {
        "use strict";

        function n(b) {
            var c = a(document.createTextNode(""));
            b.before(c), c.before(b), c.remove()
        }

        function o(a) {
            function b(a) {
                return m[a] || a
            }

            return a.replace(/[^\u0000-\u007E]/g, b)
        }

        function p(a, b) {
            for (var c = 0, d = b.length; d > c; c += 1) if (r(a, b[c])) return c;
            return -1
        }

        function q() {
            var b = a(l);
            b.appendTo(document.body);
            var c = {width: b.width() - b[0].clientWidth, height: b.height() - b[0].clientHeight};
            return b.remove(), c
        }

        function r(a, c) {
            return a === c ? !0 : a === b || c === b ? !1 : null === a || null === c ? !1 : a.constructor === String ? a + "" == c + "" : c.constructor === String ? c + "" == a + "" : !1
        }

        function s(a, b, c) {
            var d, e, f;
            if (null === a || a.length < 1) return [];
            for (d = a.split(b), e = 0, f = d.length; f > e; e += 1) d[e] = c(d[e]);
            return d
        }

        function t(a) {
            return a.outerWidth(!1) - a.width()
        }

        function u(c) {
            var d = "keyup-change-value";
            c.on("keydown", function () {
                a.data(c, d) === b && a.data(c, d, c.val())
            }), c.on("keyup", function () {
                var e = a.data(c, d);
                e !== b && c.val() !== e && (a.removeData(c, d), c.trigger("keyup-change"))
            })
        }

        function v(c) {
            c.on("mousemove", function (c) {
                var d = h;
                (d === b || d.x !== c.pageX || d.y !== c.pageY) && a(c.target).trigger("mousemove-filtered", c)
            })
        }

        function w(a, c, d) {
            d = d || b;
            var e;
            return function () {
                var b = arguments;
                window.clearTimeout(e), e = window.setTimeout(function () {
                    c.apply(d, b)
                }, a)
            }
        }

        function x(a, b) {
            var c = w(a, function (a) {
                b.trigger("scroll-debounced", a)
            });
            b.on("scroll", function (a) {
                p(a.target, b.get()) >= 0 && c(a)
            })
        }

        function y(a) {
            a[0] !== document.activeElement && window.setTimeout(function () {
                var d, b = a[0], c = a.val().length;
                a.focus();
                var e = b.offsetWidth > 0 || b.offsetHeight > 0;
                e && b === document.activeElement && (b.setSelectionRange ? b.setSelectionRange(c, c) : b.createTextRange && (d = b.createTextRange(), d.collapse(!1), d.select()))
            }, 0)
        }

        function z(b) {
            b = a(b)[0];
            var c = 0, d = 0;
            if ("selectionStart" in b) c = b.selectionStart, d = b.selectionEnd - c; else if ("selection" in document) {
                b.focus();
                var e = document.selection.createRange();
                d = document.selection.createRange().text.length, e.moveStart("character", -b.value.length), c = e.text.length - d
            }
            return {offset: c, length: d}
        }

        function A(a) {
            a.preventDefault(), a.stopPropagation()
        }

        function B(a) {
            a.preventDefault(), a.stopImmediatePropagation()
        }

        function C(b) {
            if (!g) {
                var c = b[0].currentStyle || window.getComputedStyle(b[0], null);
                g = a(document.createElement("div")).css({
                    position: "absolute",
                    left: "-10000px",
                    top: "-10000px",
                    display: "none",
                    fontSize: c.fontSize,
                    fontFamily: c.fontFamily,
                    fontStyle: c.fontStyle,
                    fontWeight: c.fontWeight,
                    letterSpacing: c.letterSpacing,
                    textTransform: c.textTransform,
                    whiteSpace: "nowrap"
                }), g.attr("class", "select2-sizer"), a(document.body).append(g)
            }
            return g.text(b.val()), g.width()
        }

        function D(b, c, d) {
            var e, g, f = [];
            e = a.trim(b.attr("class")), e && (e = "" + e, a(e.split(/\s+/)).each2(function () {
                0 === this.indexOf("select2-") && f.push(this)
            })), e = a.trim(c.attr("class")), e && (e = "" + e, a(e.split(/\s+/)).each2(function () {
                0 !== this.indexOf("select2-") && (g = d(this), g && f.push(g))
            })), b.attr("class", f.join(" "))
        }

        function E(a, b, c, d) {
            var e = o(a.toUpperCase()).indexOf(o(b.toUpperCase())), f = b.length;
            return 0 > e ? (c.push(d(a)), void 0) : (c.push(d(a.substring(0, e))), c.push("<span class='select2-match'>"), c.push(d(a.substring(e, e + f))), c.push("</span>"), c.push(d(a.substring(e + f, a.length))), void 0)
        }

        function F(a) {
            var b = {"\\": "&#92;", "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#47;"};
            return String(a).replace(/[&<>"'\/\\]/g, function (a) {
                return b[a]
            })
        }

        function G(c) {
            var d, e = null, f = c.quietMillis || 100, g = c.url, h = this;
            return function (i) {
                window.clearTimeout(d), d = window.setTimeout(function () {
                    var d = c.data, f = g, j = c.transport || a.fn.select2.ajaxDefaults.transport, k = {
                        type: c.type || "GET",
                        cache: c.cache || !1,
                        jsonpCallback: c.jsonpCallback || b,
                        dataType: c.dataType || "json"
                    }, l = a.extend({}, a.fn.select2.ajaxDefaults.params, k);
                    d = d ? d.call(h, i.term, i.page, i.context) : null, f = "function" == typeof f ? f.call(h, i.term, i.page, i.context) : f, e && "function" == typeof e.abort && e.abort(), c.params && (a.isFunction(c.params) ? a.extend(l, c.params.call(h)) : a.extend(l, c.params)), a.extend(l, {
                        url: f,
                        dataType: c.dataType,
                        data: d,
                        success: function (a) {
                            var b = c.results(a, i.page, i);
                            i.callback(b)
                        },
                        error: function (a, b, c) {
                            var d = {hasError: !0, jqXHR: a, textStatus: b, errorThrown: c};
                            i.callback(d)
                        }
                    }), e = j.call(h, l)
                }, f)
            }
        }

        function H(b) {
            var d, e, c = b, f = function (a) {
                return "" + a.text
            };
            a.isArray(c) && (e = c, c = {results: e}), a.isFunction(c) === !1 && (e = c, c = function () {
                return e
            });
            var g = c();
            return g.text && (f = g.text, a.isFunction(f) || (d = g.text, f = function (a) {
                return a[d]
            })), function (b) {
                var g, d = b.term, e = {results: []};
                return "" === d ? (b.callback(c()), void 0) : (g = function (c, e) {
                    var h, i;
                    if (c = c[0], c.children) {
                        h = {};
                        for (i in c) c.hasOwnProperty(i) && (h[i] = c[i]);
                        h.children = [], a(c.children).each2(function (a, b) {
                            g(b, h.children)
                        }), (h.children.length || b.matcher(d, f(h), c)) && e.push(h)
                    } else b.matcher(d, f(c), c) && e.push(c)
                }, a(c().results).each2(function (a, b) {
                    g(b, e.results)
                }), b.callback(e), void 0)
            }
        }

        function I(c) {
            var d = a.isFunction(c);
            return function (e) {
                var f = e.term, g = {results: []}, h = d ? c(e) : c;
                a.isArray(h) && (a(h).each(function () {
                    var a = this.text !== b, c = a ? this.text : this;
                    ("" === f || e.matcher(f, c)) && g.results.push(a ? this : {id: this, text: this})
                }), e.callback(g))
            }
        }

        function J(b, c) {
            if (a.isFunction(b)) return !0;
            if (!b) return !1;
            if ("string" == typeof b) return !0;
            throw new Error(c + " must be a string, function, or falsy value")
        }

        function K(b, c) {
            if (a.isFunction(b)) {
                var d = Array.prototype.slice.call(arguments, 2);
                return b.apply(c, d)
            }
            return b
        }

        function L(b) {
            var c = 0;
            return a.each(b, function (a, b) {
                b.children ? c += L(b.children) : c++
            }), c
        }

        function M(a, c, d, e) {
            var h, i, j, k, l, f = a, g = !1;
            if (!e.createSearchChoice || !e.tokenSeparators || e.tokenSeparators.length < 1) return b;
            for (; ;) {
                for (i = -1, j = 0, k = e.tokenSeparators.length; k > j && (l = e.tokenSeparators[j], i = a.indexOf(l), !(i >= 0)); j++) ;
                if (0 > i) break;
                if (h = a.substring(0, i), a = a.substring(i + l.length), h.length > 0 && (h = e.createSearchChoice.call(this, h, c), h !== b && null !== h && e.id(h) !== b && null !== e.id(h))) {
                    for (g = !1, j = 0, k = c.length; k > j; j++) if (r(e.id(h), e.id(c[j]))) {
                        g = !0;
                        break
                    }
                    g || d(h)
                }
            }
            return f !== a ? a : void 0
        }

        function N() {
            var b = this;
            a.each(arguments, function (a, c) {
                b[c].remove(), b[c] = null
            })
        }

        function O(b, c) {
            var d = function () {
            };
            return d.prototype = new b, d.prototype.constructor = d, d.prototype.parent = b.prototype, d.prototype = a.extend(d.prototype, c), d
        }

        if (window.Select2 === b) {
            var c, d, e, f, g, i, j, h = {x: 0, y: 0}, k = {
                TAB: 9,
                ENTER: 13,
                ESC: 27,
                SPACE: 32,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                SHIFT: 16,
                CTRL: 17,
                ALT: 18,
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                HOME: 36,
                END: 35,
                BACKSPACE: 8,
                DELETE: 46,
                isArrow: function (a) {
                    switch (a = a.which ? a.which : a) {
                        case k.LEFT:
                        case k.RIGHT:
                        case k.UP:
                        case k.DOWN:
                            return !0
                    }
                    return !1
                },
                isControl: function (a) {
                    var b = a.which;
                    switch (b) {
                        case k.SHIFT:
                        case k.CTRL:
                        case k.ALT:
                            return !0
                    }
                    return a.metaKey ? !0 : !1
                },
                isFunctionKey: function (a) {
                    return a = a.which ? a.which : a, a >= 112 && 123 >= a
                }
            }, l = "<div class='select2-measure-scrollbar'></div>", m = {
                "\u24b6": "A",
                "\uff21": "A",
                "\xc0": "A",
                "\xc1": "A",
                "\xc2": "A",
                "\u1ea6": "A",
                "\u1ea4": "A",
                "\u1eaa": "A",
                "\u1ea8": "A",
                "\xc3": "A",
                "\u0100": "A",
                "\u0102": "A",
                "\u1eb0": "A",
                "\u1eae": "A",
                "\u1eb4": "A",
                "\u1eb2": "A",
                "\u0226": "A",
                "\u01e0": "A",
                "\xc4": "A",
                "\u01de": "A",
                "\u1ea2": "A",
                "\xc5": "A",
                "\u01fa": "A",
                "\u01cd": "A",
                "\u0200": "A",
                "\u0202": "A",
                "\u1ea0": "A",
                "\u1eac": "A",
                "\u1eb6": "A",
                "\u1e00": "A",
                "\u0104": "A",
                "\u023a": "A",
                "\u2c6f": "A",
                "\ua732": "AA",
                "\xc6": "AE",
                "\u01fc": "AE",
                "\u01e2": "AE",
                "\ua734": "AO",
                "\ua736": "AU",
                "\ua738": "AV",
                "\ua73a": "AV",
                "\ua73c": "AY",
                "\u24b7": "B",
                "\uff22": "B",
                "\u1e02": "B",
                "\u1e04": "B",
                "\u1e06": "B",
                "\u0243": "B",
                "\u0182": "B",
                "\u0181": "B",
                "\u24b8": "C",
                "\uff23": "C",
                "\u0106": "C",
                "\u0108": "C",
                "\u010a": "C",
                "\u010c": "C",
                "\xc7": "C",
                "\u1e08": "C",
                "\u0187": "C",
                "\u023b": "C",
                "\ua73e": "C",
                "\u24b9": "D",
                "\uff24": "D",
                "\u1e0a": "D",
                "\u010e": "D",
                "\u1e0c": "D",
                "\u1e10": "D",
                "\u1e12": "D",
                "\u1e0e": "D",
                "\u0110": "D",
                "\u018b": "D",
                "\u018a": "D",
                "\u0189": "D",
                "\ua779": "D",
                "\u01f1": "DZ",
                "\u01c4": "DZ",
                "\u01f2": "Dz",
                "\u01c5": "Dz",
                "\u24ba": "E",
                "\uff25": "E",
                "\xc8": "E",
                "\xc9": "E",
                "\xca": "E",
                "\u1ec0": "E",
                "\u1ebe": "E",
                "\u1ec4": "E",
                "\u1ec2": "E",
                "\u1ebc": "E",
                "\u0112": "E",
                "\u1e14": "E",
                "\u1e16": "E",
                "\u0114": "E",
                "\u0116": "E",
                "\xcb": "E",
                "\u1eba": "E",
                "\u011a": "E",
                "\u0204": "E",
                "\u0206": "E",
                "\u1eb8": "E",
                "\u1ec6": "E",
                "\u0228": "E",
                "\u1e1c": "E",
                "\u0118": "E",
                "\u1e18": "E",
                "\u1e1a": "E",
                "\u0190": "E",
                "\u018e": "E",
                "\u24bb": "F",
                "\uff26": "F",
                "\u1e1e": "F",
                "\u0191": "F",
                "\ua77b": "F",
                "\u24bc": "G",
                "\uff27": "G",
                "\u01f4": "G",
                "\u011c": "G",
                "\u1e20": "G",
                "\u011e": "G",
                "\u0120": "G",
                "\u01e6": "G",
                "\u0122": "G",
                "\u01e4": "G",
                "\u0193": "G",
                "\ua7a0": "G",
                "\ua77d": "G",
                "\ua77e": "G",
                "\u24bd": "H",
                "\uff28": "H",
                "\u0124": "H",
                "\u1e22": "H",
                "\u1e26": "H",
                "\u021e": "H",
                "\u1e24": "H",
                "\u1e28": "H",
                "\u1e2a": "H",
                "\u0126": "H",
                "\u2c67": "H",
                "\u2c75": "H",
                "\ua78d": "H",
                "\u24be": "I",
                "\uff29": "I",
                "\xcc": "I",
                "\xcd": "I",
                "\xce": "I",
                "\u0128": "I",
                "\u012a": "I",
                "\u012c": "I",
                "\u0130": "I",
                "\xcf": "I",
                "\u1e2e": "I",
                "\u1ec8": "I",
                "\u01cf": "I",
                "\u0208": "I",
                "\u020a": "I",
                "\u1eca": "I",
                "\u012e": "I",
                "\u1e2c": "I",
                "\u0197": "I",
                "\u24bf": "J",
                "\uff2a": "J",
                "\u0134": "J",
                "\u0248": "J",
                "\u24c0": "K",
                "\uff2b": "K",
                "\u1e30": "K",
                "\u01e8": "K",
                "\u1e32": "K",
                "\u0136": "K",
                "\u1e34": "K",
                "\u0198": "K",
                "\u2c69": "K",
                "\ua740": "K",
                "\ua742": "K",
                "\ua744": "K",
                "\ua7a2": "K",
                "\u24c1": "L",
                "\uff2c": "L",
                "\u013f": "L",
                "\u0139": "L",
                "\u013d": "L",
                "\u1e36": "L",
                "\u1e38": "L",
                "\u013b": "L",
                "\u1e3c": "L",
                "\u1e3a": "L",
                "\u0141": "L",
                "\u023d": "L",
                "\u2c62": "L",
                "\u2c60": "L",
                "\ua748": "L",
                "\ua746": "L",
                "\ua780": "L",
                "\u01c7": "LJ",
                "\u01c8": "Lj",
                "\u24c2": "M",
                "\uff2d": "M",
                "\u1e3e": "M",
                "\u1e40": "M",
                "\u1e42": "M",
                "\u2c6e": "M",
                "\u019c": "M",
                "\u24c3": "N",
                "\uff2e": "N",
                "\u01f8": "N",
                "\u0143": "N",
                "\xd1": "N",
                "\u1e44": "N",
                "\u0147": "N",
                "\u1e46": "N",
                "\u0145": "N",
                "\u1e4a": "N",
                "\u1e48": "N",
                "\u0220": "N",
                "\u019d": "N",
                "\ua790": "N",
                "\ua7a4": "N",
                "\u01ca": "NJ",
                "\u01cb": "Nj",
                "\u24c4": "O",
                "\uff2f": "O",
                "\xd2": "O",
                "\xd3": "O",
                "\xd4": "O",
                "\u1ed2": "O",
                "\u1ed0": "O",
                "\u1ed6": "O",
                "\u1ed4": "O",
                "\xd5": "O",
                "\u1e4c": "O",
                "\u022c": "O",
                "\u1e4e": "O",
                "\u014c": "O",
                "\u1e50": "O",
                "\u1e52": "O",
                "\u014e": "O",
                "\u022e": "O",
                "\u0230": "O",
                "\xd6": "O",
                "\u022a": "O",
                "\u1ece": "O",
                "\u0150": "O",
                "\u01d1": "O",
                "\u020c": "O",
                "\u020e": "O",
                "\u01a0": "O",
                "\u1edc": "O",
                "\u1eda": "O",
                "\u1ee0": "O",
                "\u1ede": "O",
                "\u1ee2": "O",
                "\u1ecc": "O",
                "\u1ed8": "O",
                "\u01ea": "O",
                "\u01ec": "O",
                "\xd8": "O",
                "\u01fe": "O",
                "\u0186": "O",
                "\u019f": "O",
                "\ua74a": "O",
                "\ua74c": "O",
                "\u01a2": "OI",
                "\ua74e": "OO",
                "\u0222": "OU",
                "\u24c5": "P",
                "\uff30": "P",
                "\u1e54": "P",
                "\u1e56": "P",
                "\u01a4": "P",
                "\u2c63": "P",
                "\ua750": "P",
                "\ua752": "P",
                "\ua754": "P",
                "\u24c6": "Q",
                "\uff31": "Q",
                "\ua756": "Q",
                "\ua758": "Q",
                "\u024a": "Q",
                "\u24c7": "R",
                "\uff32": "R",
                "\u0154": "R",
                "\u1e58": "R",
                "\u0158": "R",
                "\u0210": "R",
                "\u0212": "R",
                "\u1e5a": "R",
                "\u1e5c": "R",
                "\u0156": "R",
                "\u1e5e": "R",
                "\u024c": "R",
                "\u2c64": "R",
                "\ua75a": "R",
                "\ua7a6": "R",
                "\ua782": "R",
                "\u24c8": "S",
                "\uff33": "S",
                "\u1e9e": "S",
                "\u015a": "S",
                "\u1e64": "S",
                "\u015c": "S",
                "\u1e60": "S",
                "\u0160": "S",
                "\u1e66": "S",
                "\u1e62": "S",
                "\u1e68": "S",
                "\u0218": "S",
                "\u015e": "S",
                "\u2c7e": "S",
                "\ua7a8": "S",
                "\ua784": "S",
                "\u24c9": "T",
                "\uff34": "T",
                "\u1e6a": "T",
                "\u0164": "T",
                "\u1e6c": "T",
                "\u021a": "T",
                "\u0162": "T",
                "\u1e70": "T",
                "\u1e6e": "T",
                "\u0166": "T",
                "\u01ac": "T",
                "\u01ae": "T",
                "\u023e": "T",
                "\ua786": "T",
                "\ua728": "TZ",
                "\u24ca": "U",
                "\uff35": "U",
                "\xd9": "U",
                "\xda": "U",
                "\xdb": "U",
                "\u0168": "U",
                "\u1e78": "U",
                "\u016a": "U",
                "\u1e7a": "U",
                "\u016c": "U",
                "\xdc": "U",
                "\u01db": "U",
                "\u01d7": "U",
                "\u01d5": "U",
                "\u01d9": "U",
                "\u1ee6": "U",
                "\u016e": "U",
                "\u0170": "U",
                "\u01d3": "U",
                "\u0214": "U",
                "\u0216": "U",
                "\u01af": "U",
                "\u1eea": "U",
                "\u1ee8": "U",
                "\u1eee": "U",
                "\u1eec": "U",
                "\u1ef0": "U",
                "\u1ee4": "U",
                "\u1e72": "U",
                "\u0172": "U",
                "\u1e76": "U",
                "\u1e74": "U",
                "\u0244": "U",
                "\u24cb": "V",
                "\uff36": "V",
                "\u1e7c": "V",
                "\u1e7e": "V",
                "\u01b2": "V",
                "\ua75e": "V",
                "\u0245": "V",
                "\ua760": "VY",
                "\u24cc": "W",
                "\uff37": "W",
                "\u1e80": "W",
                "\u1e82": "W",
                "\u0174": "W",
                "\u1e86": "W",
                "\u1e84": "W",
                "\u1e88": "W",
                "\u2c72": "W",
                "\u24cd": "X",
                "\uff38": "X",
                "\u1e8a": "X",
                "\u1e8c": "X",
                "\u24ce": "Y",
                "\uff39": "Y",
                "\u1ef2": "Y",
                "\xdd": "Y",
                "\u0176": "Y",
                "\u1ef8": "Y",
                "\u0232": "Y",
                "\u1e8e": "Y",
                "\u0178": "Y",
                "\u1ef6": "Y",
                "\u1ef4": "Y",
                "\u01b3": "Y",
                "\u024e": "Y",
                "\u1efe": "Y",
                "\u24cf": "Z",
                "\uff3a": "Z",
                "\u0179": "Z",
                "\u1e90": "Z",
                "\u017b": "Z",
                "\u017d": "Z",
                "\u1e92": "Z",
                "\u1e94": "Z",
                "\u01b5": "Z",
                "\u0224": "Z",
                "\u2c7f": "Z",
                "\u2c6b": "Z",
                "\ua762": "Z",
                "\u24d0": "a",
                "\uff41": "a",
                "\u1e9a": "a",
                "\xe0": "a",
                "\xe1": "a",
                "\xe2": "a",
                "\u1ea7": "a",
                "\u1ea5": "a",
                "\u1eab": "a",
                "\u1ea9": "a",
                "\xe3": "a",
                "\u0101": "a",
                "\u0103": "a",
                "\u1eb1": "a",
                "\u1eaf": "a",
                "\u1eb5": "a",
                "\u1eb3": "a",
                "\u0227": "a",
                "\u01e1": "a",
                "\xe4": "a",
                "\u01df": "a",
                "\u1ea3": "a",
                "\xe5": "a",
                "\u01fb": "a",
                "\u01ce": "a",
                "\u0201": "a",
                "\u0203": "a",
                "\u1ea1": "a",
                "\u1ead": "a",
                "\u1eb7": "a",
                "\u1e01": "a",
                "\u0105": "a",
                "\u2c65": "a",
                "\u0250": "a",
                "\ua733": "aa",
                "\xe6": "ae",
                "\u01fd": "ae",
                "\u01e3": "ae",
                "\ua735": "ao",
                "\ua737": "au",
                "\ua739": "av",
                "\ua73b": "av",
                "\ua73d": "ay",
                "\u24d1": "b",
                "\uff42": "b",
                "\u1e03": "b",
                "\u1e05": "b",
                "\u1e07": "b",
                "\u0180": "b",
                "\u0183": "b",
                "\u0253": "b",
                "\u24d2": "c",
                "\uff43": "c",
                "\u0107": "c",
                "\u0109": "c",
                "\u010b": "c",
                "\u010d": "c",
                "\xe7": "c",
                "\u1e09": "c",
                "\u0188": "c",
                "\u023c": "c",
                "\ua73f": "c",
                "\u2184": "c",
                "\u24d3": "d",
                "\uff44": "d",
                "\u1e0b": "d",
                "\u010f": "d",
                "\u1e0d": "d",
                "\u1e11": "d",
                "\u1e13": "d",
                "\u1e0f": "d",
                "\u0111": "d",
                "\u018c": "d",
                "\u0256": "d",
                "\u0257": "d",
                "\ua77a": "d",
                "\u01f3": "dz",
                "\u01c6": "dz",
                "\u24d4": "e",
                "\uff45": "e",
                "\xe8": "e",
                "\xe9": "e",
                "\xea": "e",
                "\u1ec1": "e",
                "\u1ebf": "e",
                "\u1ec5": "e",
                "\u1ec3": "e",
                "\u1ebd": "e",
                "\u0113": "e",
                "\u1e15": "e",
                "\u1e17": "e",
                "\u0115": "e",
                "\u0117": "e",
                "\xeb": "e",
                "\u1ebb": "e",
                "\u011b": "e",
                "\u0205": "e",
                "\u0207": "e",
                "\u1eb9": "e",
                "\u1ec7": "e",
                "\u0229": "e",
                "\u1e1d": "e",
                "\u0119": "e",
                "\u1e19": "e",
                "\u1e1b": "e",
                "\u0247": "e",
                "\u025b": "e",
                "\u01dd": "e",
                "\u24d5": "f",
                "\uff46": "f",
                "\u1e1f": "f",
                "\u0192": "f",
                "\ua77c": "f",
                "\u24d6": "g",
                "\uff47": "g",
                "\u01f5": "g",
                "\u011d": "g",
                "\u1e21": "g",
                "\u011f": "g",
                "\u0121": "g",
                "\u01e7": "g",
                "\u0123": "g",
                "\u01e5": "g",
                "\u0260": "g",
                "\ua7a1": "g",
                "\u1d79": "g",
                "\ua77f": "g",
                "\u24d7": "h",
                "\uff48": "h",
                "\u0125": "h",
                "\u1e23": "h",
                "\u1e27": "h",
                "\u021f": "h",
                "\u1e25": "h",
                "\u1e29": "h",
                "\u1e2b": "h",
                "\u1e96": "h",
                "\u0127": "h",
                "\u2c68": "h",
                "\u2c76": "h",
                "\u0265": "h",
                "\u0195": "hv",
                "\u24d8": "i",
                "\uff49": "i",
                "\xec": "i",
                "\xed": "i",
                "\xee": "i",
                "\u0129": "i",
                "\u012b": "i",
                "\u012d": "i",
                "\xef": "i",
                "\u1e2f": "i",
                "\u1ec9": "i",
                "\u01d0": "i",
                "\u0209": "i",
                "\u020b": "i",
                "\u1ecb": "i",
                "\u012f": "i",
                "\u1e2d": "i",
                "\u0268": "i",
                "\u0131": "i",
                "\u24d9": "j",
                "\uff4a": "j",
                "\u0135": "j",
                "\u01f0": "j",
                "\u0249": "j",
                "\u24da": "k",
                "\uff4b": "k",
                "\u1e31": "k",
                "\u01e9": "k",
                "\u1e33": "k",
                "\u0137": "k",
                "\u1e35": "k",
                "\u0199": "k",
                "\u2c6a": "k",
                "\ua741": "k",
                "\ua743": "k",
                "\ua745": "k",
                "\ua7a3": "k",
                "\u24db": "l",
                "\uff4c": "l",
                "\u0140": "l",
                "\u013a": "l",
                "\u013e": "l",
                "\u1e37": "l",
                "\u1e39": "l",
                "\u013c": "l",
                "\u1e3d": "l",
                "\u1e3b": "l",
                "\u017f": "l",
                "\u0142": "l",
                "\u019a": "l",
                "\u026b": "l",
                "\u2c61": "l",
                "\ua749": "l",
                "\ua781": "l",
                "\ua747": "l",
                "\u01c9": "lj",
                "\u24dc": "m",
                "\uff4d": "m",
                "\u1e3f": "m",
                "\u1e41": "m",
                "\u1e43": "m",
                "\u0271": "m",
                "\u026f": "m",
                "\u24dd": "n",
                "\uff4e": "n",
                "\u01f9": "n",
                "\u0144": "n",
                "\xf1": "n",
                "\u1e45": "n",
                "\u0148": "n",
                "\u1e47": "n",
                "\u0146": "n",
                "\u1e4b": "n",
                "\u1e49": "n",
                "\u019e": "n",
                "\u0272": "n",
                "\u0149": "n",
                "\ua791": "n",
                "\ua7a5": "n",
                "\u01cc": "nj",
                "\u24de": "o",
                "\uff4f": "o",
                "\xf2": "o",
                "\xf3": "o",
                "\xf4": "o",
                "\u1ed3": "o",
                "\u1ed1": "o",
                "\u1ed7": "o",
                "\u1ed5": "o",
                "\xf5": "o",
                "\u1e4d": "o",
                "\u022d": "o",
                "\u1e4f": "o",
                "\u014d": "o",
                "\u1e51": "o",
                "\u1e53": "o",
                "\u014f": "o",
                "\u022f": "o",
                "\u0231": "o",
                "\xf6": "o",
                "\u022b": "o",
                "\u1ecf": "o",
                "\u0151": "o",
                "\u01d2": "o",
                "\u020d": "o",
                "\u020f": "o",
                "\u01a1": "o",
                "\u1edd": "o",
                "\u1edb": "o",
                "\u1ee1": "o",
                "\u1edf": "o",
                "\u1ee3": "o",
                "\u1ecd": "o",
                "\u1ed9": "o",
                "\u01eb": "o",
                "\u01ed": "o",
                "\xf8": "o",
                "\u01ff": "o",
                "\u0254": "o",
                "\ua74b": "o",
                "\ua74d": "o",
                "\u0275": "o",
                "\u01a3": "oi",
                "\u0223": "ou",
                "\ua74f": "oo",
                "\u24df": "p",
                "\uff50": "p",
                "\u1e55": "p",
                "\u1e57": "p",
                "\u01a5": "p",
                "\u1d7d": "p",
                "\ua751": "p",
                "\ua753": "p",
                "\ua755": "p",
                "\u24e0": "q",
                "\uff51": "q",
                "\u024b": "q",
                "\ua757": "q",
                "\ua759": "q",
                "\u24e1": "r",
                "\uff52": "r",
                "\u0155": "r",
                "\u1e59": "r",
                "\u0159": "r",
                "\u0211": "r",
                "\u0213": "r",
                "\u1e5b": "r",
                "\u1e5d": "r",
                "\u0157": "r",
                "\u1e5f": "r",
                "\u024d": "r",
                "\u027d": "r",
                "\ua75b": "r",
                "\ua7a7": "r",
                "\ua783": "r",
                "\u24e2": "s",
                "\uff53": "s",
                "\xdf": "s",
                "\u015b": "s",
                "\u1e65": "s",
                "\u015d": "s",
                "\u1e61": "s",
                "\u0161": "s",
                "\u1e67": "s",
                "\u1e63": "s",
                "\u1e69": "s",
                "\u0219": "s",
                "\u015f": "s",
                "\u023f": "s",
                "\ua7a9": "s",
                "\ua785": "s",
                "\u1e9b": "s",
                "\u24e3": "t",
                "\uff54": "t",
                "\u1e6b": "t",
                "\u1e97": "t",
                "\u0165": "t",
                "\u1e6d": "t",
                "\u021b": "t",
                "\u0163": "t",
                "\u1e71": "t",
                "\u1e6f": "t",
                "\u0167": "t",
                "\u01ad": "t",
                "\u0288": "t",
                "\u2c66": "t",
                "\ua787": "t",
                "\ua729": "tz",
                "\u24e4": "u",
                "\uff55": "u",
                "\xf9": "u",
                "\xfa": "u",
                "\xfb": "u",
                "\u0169": "u",
                "\u1e79": "u",
                "\u016b": "u",
                "\u1e7b": "u",
                "\u016d": "u",
                "\xfc": "u",
                "\u01dc": "u",
                "\u01d8": "u",
                "\u01d6": "u",
                "\u01da": "u",
                "\u1ee7": "u",
                "\u016f": "u",
                "\u0171": "u",
                "\u01d4": "u",
                "\u0215": "u",
                "\u0217": "u",
                "\u01b0": "u",
                "\u1eeb": "u",
                "\u1ee9": "u",
                "\u1eef": "u",
                "\u1eed": "u",
                "\u1ef1": "u",
                "\u1ee5": "u",
                "\u1e73": "u",
                "\u0173": "u",
                "\u1e77": "u",
                "\u1e75": "u",
                "\u0289": "u",
                "\u24e5": "v",
                "\uff56": "v",
                "\u1e7d": "v",
                "\u1e7f": "v",
                "\u028b": "v",
                "\ua75f": "v",
                "\u028c": "v",
                "\ua761": "vy",
                "\u24e6": "w",
                "\uff57": "w",
                "\u1e81": "w",
                "\u1e83": "w",
                "\u0175": "w",
                "\u1e87": "w",
                "\u1e85": "w",
                "\u1e98": "w",
                "\u1e89": "w",
                "\u2c73": "w",
                "\u24e7": "x",
                "\uff58": "x",
                "\u1e8b": "x",
                "\u1e8d": "x",
                "\u24e8": "y",
                "\uff59": "y",
                "\u1ef3": "y",
                "\xfd": "y",
                "\u0177": "y",
                "\u1ef9": "y",
                "\u0233": "y",
                "\u1e8f": "y",
                "\xff": "y",
                "\u1ef7": "y",
                "\u1e99": "y",
                "\u1ef5": "y",
                "\u01b4": "y",
                "\u024f": "y",
                "\u1eff": "y",
                "\u24e9": "z",
                "\uff5a": "z",
                "\u017a": "z",
                "\u1e91": "z",
                "\u017c": "z",
                "\u017e": "z",
                "\u1e93": "z",
                "\u1e95": "z",
                "\u01b6": "z",
                "\u0225": "z",
                "\u0240": "z",
                "\u2c6c": "z",
                "\ua763": "z",
                "\u0386": "\u0391",
                "\u0388": "\u0395",
                "\u0389": "\u0397",
                "\u038a": "\u0399",
                "\u03aa": "\u0399",
                "\u038c": "\u039f",
                "\u038e": "\u03a5",
                "\u03ab": "\u03a5",
                "\u038f": "\u03a9",
                "\u03ac": "\u03b1",
                "\u03ad": "\u03b5",
                "\u03ae": "\u03b7",
                "\u03af": "\u03b9",
                "\u03ca": "\u03b9",
                "\u0390": "\u03b9",
                "\u03cc": "\u03bf",
                "\u03cd": "\u03c5",
                "\u03cb": "\u03c5",
                "\u03b0": "\u03c5",
                "\u03c9": "\u03c9",
                "\u03c2": "\u03c3"
            };
            i = a(document), f = function () {
                var a = 1;
                return function () {
                    return a++
                }
            }(), c = O(Object, {
                bind: function (a) {
                    var b = this;
                    return function () {
                        a.apply(b, arguments)
                    }
                }, init: function (c) {
                    var d, e, g = ".select2-results";
                    this.opts = c = this.prepareOpts(c), this.id = c.id, c.element.data("select2") !== b && null !== c.element.data("select2") && c.element.data("select2").destroy(), this.container = this.createContainer(), this.liveRegion = a(".select2-hidden-accessible"), 0 == this.liveRegion.length && (this.liveRegion = a("<span>", {
                        role: "status",
                        "aria-live": "polite"
                    }).addClass("select2-hidden-accessible").appendTo(document.body)), this.containerId = "s2id_" + (c.element.attr("id") || "autogen" + f()), this.containerEventName = this.containerId.replace(/([.])/g, "_").replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, "\\$1"), this.container.attr("id", this.containerId), this.container.attr("title", c.element.attr("title")), this.body = a(document.body), D(this.container, this.opts.element, this.opts.adaptContainerCssClass), this.container.attr("style", c.element.attr("style")), this.container.css(K(c.containerCss, this.opts.element)), this.container.addClass(K(c.containerCssClass, this.opts.element)), this.elementTabIndex = this.opts.element.attr("tabindex"), this.opts.element.data("select2", this).attr("tabindex", "-1").before(this.container).on("click.select2", A), this.container.data("select2", this), this.dropdown = this.container.find(".select2-drop"), D(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass), this.dropdown.addClass(K(c.dropdownCssClass, this.opts.element)), this.dropdown.data("select2", this), this.dropdown.on("click", A), this.results = d = this.container.find(g), this.search = e = this.container.find("input.select2-input"), this.queryCount = 0, this.resultsPage = 0, this.context = null, this.initContainer(), this.container.on("click", A), v(this.results), this.dropdown.on("mousemove-filtered", g, this.bind(this.highlightUnderEvent)), this.dropdown.on("touchstart touchmove touchend", g, this.bind(function (a) {
                        this._touchEvent = !0, this.highlightUnderEvent(a)
                    })), this.dropdown.on("touchmove", g, this.bind(this.touchMoved)), this.dropdown.on("touchstart touchend", g, this.bind(this.clearTouchMoved)), this.dropdown.on("click", this.bind(function () {
                        this._touchEvent && (this._touchEvent = !1, this.selectHighlighted())
                    })), x(80, this.results), this.dropdown.on("scroll-debounced", g, this.bind(this.loadMoreIfNeeded)), a(this.container).on("change", ".select2-input", function (a) {
                        a.stopPropagation()
                    }), a(this.dropdown).on("change", ".select2-input", function (a) {
                        a.stopPropagation()
                    }), a.fn.mousewheel && d.mousewheel(function (a, b, c, e) {
                        var f = d.scrollTop();
                        e > 0 && 0 >= f - e ? (d.scrollTop(0), A(a)) : 0 > e && d.get(0).scrollHeight - d.scrollTop() + e <= d.height() && (d.scrollTop(d.get(0).scrollHeight - d.height()), A(a))
                    }), u(e), e.on("keyup-change input paste", this.bind(this.updateResults)), e.on("focus", function () {
                        e.addClass("select2-focused")
                    }), e.on("blur", function () {
                        e.removeClass("select2-focused")
                    }), this.dropdown.on("mouseup", g, this.bind(function (b) {
                        a(b.target).closest(".select2-result-selectable").length > 0 && (this.highlightUnderEvent(b), this.selectHighlighted(b))
                    })), this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function (a) {
                        a.stopPropagation()
                    }), this.nextSearchTerm = b, a.isFunction(this.opts.initSelection) && (this.initSelection(), this.monitorSource()), null !== c.maximumInputLength && this.search.attr("maxlength", c.maximumInputLength);
                    var h = c.element.prop("disabled");
                    h === b && (h = !1), this.enable(!h);
                    var i = c.element.prop("readonly");
                    i === b && (i = !1), this.readonly(i), j = j || q(), this.autofocus = c.element.prop("autofocus"), c.element.prop("autofocus", !1), this.autofocus && this.focus(), this.search.attr("placeholder", c.searchInputPlaceholder)
                }, destroy: function () {
                    var a = this.opts.element, c = a.data("select2"), d = this;
                    this.close(), a.length && a[0].detachEvent && d._sync && a.each(function () {
                        d._sync && this.detachEvent("onpropertychange", d._sync)
                    }), this.propertyObserver && (this.propertyObserver.disconnect(), this.propertyObserver = null), this._sync = null, c !== b && (c.container.remove(), c.liveRegion.remove(), c.dropdown.remove(), a.show().removeData("select2").off(".select2").prop("autofocus", this.autofocus || !1), this.elementTabIndex ? a.attr({tabindex: this.elementTabIndex}) : a.removeAttr("tabindex"), a.show()), N.call(this, "container", "liveRegion", "dropdown", "results", "search")
                }, optionToData: function (a) {
                    return a.is("option") ? {
                        id: a.prop("value"),
                        text: a.text(),
                        element: a.get(),
                        css: a.attr("class"),
                        disabled: a.prop("disabled"),
                        locked: r(a.attr("locked"), "locked") || r(a.data("locked"), !0)
                    } : a.is("optgroup") ? {
                        text: a.attr("label"),
                        children: [],
                        element: a.get(),
                        css: a.attr("class")
                    } : void 0
                }, prepareOpts: function (c) {
                    var d, e, g, h, i = this;
                    if (d = c.element, "select" === d.get(0).tagName.toLowerCase() && (this.select = e = c.element), e && a.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
                        if (this in c) throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.")
                    }), c = a.extend({}, {
                        populateResults: function (d, e, g) {
                            var h, j = this.opts.id, k = this.liveRegion;
                            h = function (d, e, l) {
                                var m, n, o, p, q, r, s, t, u, v;
                                d = c.sortResults(d, e, g);
                                var w = [];
                                for (m = 0, n = d.length; n > m; m += 1) o = d[m], q = o.disabled === !0, p = !q && j(o) !== b, r = o.children && o.children.length > 0, s = a("<li></li>"), s.addClass("select2-results-dept-" + l), s.addClass("select2-result"), s.addClass(p ? "select2-result-selectable" : "select2-result-unselectable"), q && s.addClass("select2-disabled"), r && s.addClass("select2-result-with-children"), s.addClass(i.opts.formatResultCssClass(o)), s.attr("role", "presentation"), t = a(document.createElement("div")), t.addClass("select2-result-label"), t.attr("id", "select2-result-label-" + f()), t.attr("role", "option"), v = c.formatResult(o, t, g, i.opts.escapeMarkup), v !== b && (t.html(v), s.append(t)), r && (u = a("<ul></ul>"), u.addClass("select2-result-sub"), h(o.children, u, l + 1), s.append(u)), s.data("select2-data", o), w.push(s[0]);
                                e.append(w), k.text(c.formatMatches(d.length))
                            }, h(e, d, 0)
                        }
                    }, a.fn.select2.defaults, c), "function" != typeof c.id && (g = c.id, c.id = function (a) {
                        return a[g]
                    }), a.isArray(c.element.data("select2Tags"))) {
                        if ("tags" in c) throw"tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + c.element.attr("id");
                        c.tags = c.element.data("select2Tags")
                    }
                    if (e ? (c.query = this.bind(function (a) {
                        var f, g, h, c = {results: [], more: !1}, e = a.term;
                        h = function (b, c) {
                            var d;
                            b.is("option") ? a.matcher(e, b.text(), b) && c.push(i.optionToData(b)) : b.is("optgroup") && (d = i.optionToData(b), b.children().each2(function (a, b) {
                                h(b, d.children)
                            }), d.children.length > 0 && c.push(d))
                        }, f = d.children(), this.getPlaceholder() !== b && f.length > 0 && (g = this.getPlaceholderOption(), g && (f = f.not(g))), f.each2(function (a, b) {
                            h(b, c.results)
                        }), a.callback(c)
                    }), c.id = function (a) {
                        return a.id
                    }) : "query" in c || ("ajax" in c ? (h = c.element.data("ajax-url"), h && h.length > 0 && (c.ajax.url = h), c.query = G.call(c.element, c.ajax)) : "data" in c ? c.query = H(c.data) : "tags" in c && (c.query = I(c.tags), c.createSearchChoice === b && (c.createSearchChoice = function (b) {
                        return {id: a.trim(b), text: a.trim(b)}
                    }), c.initSelection === b && (c.initSelection = function (b, d) {
                        var e = [];
                        a(s(b.val(), c.separator, c.transformVal)).each(function () {
                            var b = {id: this, text: this}, d = c.tags;
                            a.isFunction(d) && (d = d()), a(d).each(function () {
                                return r(this.id, b.id) ? (b = this, !1) : void 0
                            }), e.push(b)
                        }), d(e)
                    }))), "function" != typeof c.query) throw"query function not defined for Select2 " + c.element.attr("id");
                    if ("top" === c.createSearchChoicePosition) c.createSearchChoicePosition = function (a, b) {
                        a.unshift(b)
                    }; else if ("bottom" === c.createSearchChoicePosition) c.createSearchChoicePosition = function (a, b) {
                        a.push(b)
                    }; else if ("function" != typeof c.createSearchChoicePosition) throw"invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
                    return c
                }, monitorSource: function () {
                    var d, c = this.opts.element, e = this;
                    c.on("change.select2", this.bind(function () {
                        this.opts.element.data("select2-change-triggered") !== !0 && this.initSelection()
                    })), this._sync = this.bind(function () {
                        var a = c.prop("disabled");
                        a === b && (a = !1), this.enable(!a);
                        var d = c.prop("readonly");
                        d === b && (d = !1), this.readonly(d), this.container && (D(this.container, this.opts.element, this.opts.adaptContainerCssClass), this.container.addClass(K(this.opts.containerCssClass, this.opts.element))), this.dropdown && (D(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass), this.dropdown.addClass(K(this.opts.dropdownCssClass, this.opts.element)))
                    }), c.length && c[0].attachEvent && c.each(function () {
                        this.attachEvent("onpropertychange", e._sync)
                    }), d = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver, d !== b && (this.propertyObserver && (delete this.propertyObserver, this.propertyObserver = null), this.propertyObserver = new d(function (b) {
                        a.each(b, e._sync)
                    }), this.propertyObserver.observe(c.get(0), {attributes: !0, subtree: !1}))
                }, triggerSelect: function (b) {
                    var c = a.Event("select2-selecting", {val: this.id(b), object: b, choice: b});
                    return this.opts.element.trigger(c), !c.isDefaultPrevented()
                }, triggerChange: function (b) {
                    b = b || {}, b = a.extend({}, b, {
                        type: "change",
                        val: this.val()
                    }), this.opts.element.data("select2-change-triggered", !0), this.opts.element.trigger(b), this.opts.element.data("select2-change-triggered", !1), this.opts.element.click(), this.opts.blurOnChange && this.opts.element.blur()
                }, isInterfaceEnabled: function () {
                    return this.enabledInterface === !0
                }, enableInterface: function () {
                    var a = this._enabled && !this._readonly, b = !a;
                    return a === this.enabledInterface ? !1 : (this.container.toggleClass("select2-container-disabled", b), this.close(), this.enabledInterface = a, !0)
                }, enable: function (a) {
                    a === b && (a = !0), this._enabled !== a && (this._enabled = a, this.opts.element.prop("disabled", !a), this.enableInterface())
                }, disable: function () {
                    this.enable(!1)
                }, readonly: function (a) {
                    a === b && (a = !1), this._readonly !== a && (this._readonly = a, this.opts.element.prop("readonly", a), this.enableInterface())
                }, opened: function () {
                    return this.container ? this.container.hasClass("select2-dropdown-open") : !1
                }, positionDropdown: function () {
                    var v, w, x, y, z, b = this.dropdown, c = this.container, d = c.offset(), e = c.outerHeight(!1),
                        f = c.outerWidth(!1), g = b.outerHeight(!1), h = a(window), i = h.width(), k = h.height(),
                        l = h.scrollLeft() + i, m = h.scrollTop() + k, n = d.top + e, o = d.left, p = m >= n + g,
                        q = d.top - g >= h.scrollTop(), r = b.outerWidth(!1), s = function () {
                            return l >= o + r
                        }, t = function () {
                            return d.left + l + c.outerWidth(!1) > r
                        }, u = b.hasClass("select2-drop-above");
                    u ? (w = !0, !q && p && (x = !0, w = !1)) : (w = !1, !p && q && (x = !0, w = !0)), x && (b.hide(), d = this.container.offset(), e = this.container.outerHeight(!1), f = this.container.outerWidth(!1), g = b.outerHeight(!1), l = h.scrollLeft() + i, m = h.scrollTop() + k, n = d.top + e, o = d.left, r = b.outerWidth(!1), b.show(), this.focusSearch()), this.opts.dropdownAutoWidth ? (z = a(".select2-results", b)[0], b.addClass("select2-drop-auto-width"), b.css("width", ""), r = b.outerWidth(!1) + (z.scrollHeight === z.clientHeight ? 0 : j.width), r > f ? f = r : r = f, g = b.outerHeight(!1)) : this.container.removeClass("select2-drop-auto-width"), "static" !== this.body.css("position") && (v = this.body.offset(), n -= v.top, o -= v.left), !s() && t() && (o = d.left + this.container.outerWidth(!1) - r), y = {
                        left: o,
                        width: f
                    }, w ? (y.top = d.top - g, y.bottom = "auto", this.container.addClass("select2-drop-above"), b.addClass("select2-drop-above")) : (y.top = n, y.bottom = "auto", this.container.removeClass("select2-drop-above"), b.removeClass("select2-drop-above")), y = a.extend(y, K(this.opts.dropdownCss, this.opts.element)), b.css(y)
                }, shouldOpen: function () {
                    var b;
                    return this.opened() ? !1 : this._enabled === !1 || this._readonly === !0 ? !1 : (b = a.Event("select2-opening"), this.opts.element.trigger(b), !b.isDefaultPrevented())
                }, clearDropdownAlignmentPreference: function () {
                    this.container.removeClass("select2-drop-above"), this.dropdown.removeClass("select2-drop-above")
                }, open: function () {
                    return this.shouldOpen() ? (this.opening(), i.on("mousemove.select2Event", function (a) {
                        h.x = a.pageX, h.y = a.pageY
                    }), !0) : !1
                }, opening: function () {
                    var f, b = this.containerEventName, c = "scroll." + b, d = "resize." + b,
                        e = "orientationchange." + b;
                    this.container.addClass("select2-dropdown-open").addClass("select2-container-active"), this.clearDropdownAlignmentPreference(), this.dropdown[0] !== this.body.children().last()[0] && this.dropdown.detach().appendTo(this.body), f = a("#select2-drop-mask"), 0 === f.length && (f = a(document.createElement("div")), f.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask"), f.hide(), f.appendTo(this.body), f.on("mousedown touchstart click", function (b) {
                        n(f);
                        var d, c = a("#select2-drop");
                        c.length > 0 && (d = c.data("select2"), d.opts.selectOnBlur && d.selectHighlighted({noFocus: !0}), d.close(), b.preventDefault(), b.stopPropagation())
                    })), this.dropdown.prev()[0] !== f[0] && this.dropdown.before(f), a("#select2-drop").removeAttr("id"), this.dropdown.attr("id", "select2-drop"), f.show(), this.positionDropdown(), this.dropdown.show(), this.positionDropdown(), this.dropdown.addClass("select2-drop-active");
                    var g = this;
                    this.container.parents().add(window).each(function () {
                        a(this).on(d + " " + c + " " + e, function () {
                            g.opened() && g.positionDropdown()
                        })
                    })
                }, close: function () {
                    if (this.opened()) {
                        var b = this.containerEventName, c = "scroll." + b, d = "resize." + b,
                            e = "orientationchange." + b;
                        this.container.parents().add(window).each(function () {
                            a(this).off(c).off(d).off(e)
                        }), this.clearDropdownAlignmentPreference(), a("#select2-drop-mask").hide(), this.dropdown.removeAttr("id"), this.dropdown.hide(), this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active"), this.results.empty(), i.off("mousemove.select2Event"), this.clearSearch(), this.search.removeClass("select2-active"), this.opts.element.trigger(a.Event("select2-close"))
                    }
                }, externalSearch: function (a) {
                    this.open(), this.search.val(a), this.updateResults(!1)
                }, clearSearch: function () {
                }, getMaximumSelectionSize: function () {
                    return K(this.opts.maximumSelectionSize, this.opts.element)
                }, ensureHighlightVisible: function () {
                    var c, d, e, f, g, h, i, j, b = this.results;
                    if (d = this.highlight(), !(0 > d)) {
                        if (0 == d) return b.scrollTop(0), void 0;
                        c = this.findHighlightableChoices().find(".select2-result-label"), e = a(c[d]), j = (e.offset() || {}).top || 0, f = j + e.outerHeight(!0), d === c.length - 1 && (i = b.find("li.select2-more-results"), i.length > 0 && (f = i.offset().top + i.outerHeight(!0))), g = b.offset().top + b.outerHeight(!1), f > g && b.scrollTop(b.scrollTop() + (f - g)), h = j - b.offset().top, 0 > h && "none" != e.css("display") && b.scrollTop(b.scrollTop() + h)
                    }
                }, findHighlightableChoices: function () {
                    return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)")
                }, moveHighlight: function (b) {
                    for (var c = this.findHighlightableChoices(), d = this.highlight(); d > -1 && d < c.length;) {
                        d += b;
                        var e = a(c[d]);
                        if (e.hasClass("select2-result-selectable") && !e.hasClass("select2-disabled") && !e.hasClass("select2-selected")) {
                            this.highlight(d);
                            break
                        }
                    }
                }, highlight: function (b) {
                    var d, e, c = this.findHighlightableChoices();
                    return 0 === arguments.length ? p(c.filter(".select2-highlighted")[0], c.get()) : (b >= c.length && (b = c.length - 1), 0 > b && (b = 0), this.removeHighlight(), d = a(c[b]), d.addClass("select2-highlighted"), this.search.attr("aria-activedescendant", d.find(".select2-result-label").attr("id")), this.ensureHighlightVisible(), this.liveRegion.text(d.text()), e = d.data("select2-data"), e && this.opts.element.trigger({
                        type: "select2-highlight",
                        val: this.id(e),
                        choice: e
                    }), void 0)
                }, removeHighlight: function () {
                    this.results.find(".select2-highlighted").removeClass("select2-highlighted")
                }, touchMoved: function () {
                    this._touchMoved = !0
                }, clearTouchMoved: function () {
                    this._touchMoved = !1
                }, countSelectableResults: function () {
                    return this.findHighlightableChoices().length
                }, highlightUnderEvent: function (b) {
                    var c = a(b.target).closest(".select2-result-selectable");
                    if (c.length > 0 && !c.is(".select2-highlighted")) {
                        var d = this.findHighlightableChoices();
                        this.highlight(d.index(c))
                    } else 0 == c.length && this.removeHighlight()
                }, loadMoreIfNeeded: function () {
                    var c, a = this.results, b = a.find("li.select2-more-results"), d = this.resultsPage + 1, e = this,
                        f = this.search.val(), g = this.context;
                    0 !== b.length && (c = b.offset().top - a.offset().top - a.height(), c <= this.opts.loadMorePadding && (b.addClass("select2-active"), this.opts.query({
                        element: this.opts.element,
                        term: f,
                        page: d,
                        context: g,
                        matcher: this.opts.matcher,
                        callback: this.bind(function (c) {
                            e.opened() && (e.opts.populateResults.call(this, a, c.results, {
                                term: f,
                                page: d,
                                context: g
                            }), e.postprocessResults(c, !1, !1), c.more === !0 ? (b.detach().appendTo(a).html(e.opts.escapeMarkup(K(e.opts.formatLoadMore, e.opts.element, d + 1))), window.setTimeout(function () {
                                e.loadMoreIfNeeded()
                            }, 10)) : b.remove(), e.positionDropdown(), e.resultsPage = d, e.context = c.context, this.opts.element.trigger({
                                type: "select2-loaded",
                                items: c
                            }))
                        })
                    })))
                }, tokenize: function () {
                }, updateResults: function (c) {
                    function m() {
                        d.removeClass("select2-active"), h.positionDropdown(), e.find(".select2-no-results,.select2-selection-limit,.select2-searching").length ? h.liveRegion.text(e.text()) : h.liveRegion.text(h.opts.formatMatches(e.find('.select2-result-selectable:not(".select2-selected")').length))
                    }

                    function n(a) {
                        e.html(a), m()
                    }

                    var g, i, l, d = this.search, e = this.results, f = this.opts, h = this, j = d.val(),
                        k = a.data(this.container, "select2-last-term");
                    if ((c === !0 || !k || !r(j, k)) && (a.data(this.container, "select2-last-term", j), c === !0 || this.showSearchInput !== !1 && this.opened())) {
                        l = ++this.queryCount;
                        var o = this.getMaximumSelectionSize();
                        if (o >= 1 && (g = this.data(), a.isArray(g) && g.length >= o && J(f.formatSelectionTooBig, "formatSelectionTooBig"))) return n("<li class='select2-selection-limit'>" + K(f.formatSelectionTooBig, f.element, o) + "</li>"), void 0;
                        if (d.val().length < f.minimumInputLength) return J(f.formatInputTooShort, "formatInputTooShort") ? n("<li class='select2-no-results'>" + K(f.formatInputTooShort, f.element, d.val(), f.minimumInputLength) + "</li>") : n(""), c && this.showSearch && this.showSearch(!0), void 0;
                        if (f.maximumInputLength && d.val().length > f.maximumInputLength) return J(f.formatInputTooLong, "formatInputTooLong") ? n("<li class='select2-no-results'>" + K(f.formatInputTooLong, f.element, d.val(), f.maximumInputLength) + "</li>") : n(""), void 0;
                        f.formatSearching && 0 === this.findHighlightableChoices().length && n("<li class='select2-searching'>" + K(f.formatSearching, f.element) + "</li>"), d.addClass("select2-active"), this.removeHighlight(), i = this.tokenize(), i != b && null != i && d.val(i), this.resultsPage = 1, f.query({
                            element: f.element,
                            term: d.val(),
                            page: this.resultsPage,
                            context: null,
                            matcher: f.matcher,
                            callback: this.bind(function (g) {
                                var i;
                                if (l == this.queryCount) {
                                    if (!this.opened()) return this.search.removeClass("select2-active"), void 0;
                                    if (g.hasError !== b && J(f.formatAjaxError, "formatAjaxError")) return n("<li class='select2-ajax-error'>" + K(f.formatAjaxError, f.element, g.jqXHR, g.textStatus, g.errorThrown) + "</li>"), void 0;
                                    if (this.context = g.context === b ? null : g.context, this.opts.createSearchChoice && "" !== d.val() && (i = this.opts.createSearchChoice.call(h, d.val(), g.results), i !== b && null !== i && h.id(i) !== b && null !== h.id(i) && 0 === a(g.results).filter(function () {
                                        return r(h.id(this), h.id(i))
                                    }).length && this.opts.createSearchChoicePosition(g.results, i)), 0 === g.results.length && J(f.formatNoMatches, "formatNoMatches")) return n("<li class='select2-no-results'>" + K(f.formatNoMatches, f.element, d.val()) + "</li>"), void 0;
                                    e.empty(), h.opts.populateResults.call(this, e, g.results, {
                                        term: d.val(),
                                        page: this.resultsPage,
                                        context: null
                                    }), g.more === !0 && J(f.formatLoadMore, "formatLoadMore") && (e.append("<li class='select2-more-results'>" + f.escapeMarkup(K(f.formatLoadMore, f.element, this.resultsPage)) + "</li>"), window.setTimeout(function () {
                                        h.loadMoreIfNeeded()
                                    }, 10)), this.postprocessResults(g, c), m(), this.opts.element.trigger({
                                        type: "select2-loaded",
                                        items: g
                                    })
                                }
                            })
                        })
                    }
                }, cancel: function () {
                    this.close()
                }, blur: function () {
                    this.opts.selectOnBlur && this.selectHighlighted({noFocus: !0}), this.close(), this.container.removeClass("select2-container-active"), this.search[0] === document.activeElement && this.search.blur(), this.clearSearch(), this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")
                }, focusSearch: function () {
                    y(this.search)
                }, selectHighlighted: function (a) {
                    if (this._touchMoved) return this.clearTouchMoved(), void 0;
                    var b = this.highlight(), c = this.results.find(".select2-highlighted"),
                        d = c.closest(".select2-result").data("select2-data");
                    d ? (this.highlight(b), this.onSelect(d, a)) : a && a.noFocus && this.close()
                }, getPlaceholder: function () {
                    var a;
                    return this.opts.element.attr("placeholder") || this.opts.element.attr("data-placeholder") || this.opts.element.data("placeholder") || this.opts.placeholder || ((a = this.getPlaceholderOption()) !== b ? a.text() : b)
                }, getPlaceholderOption: function () {
                    if (this.select) {
                        var c = this.select.children("option").first();
                        if (this.opts.placeholderOption !== b) return "first" === this.opts.placeholderOption && c || "function" == typeof this.opts.placeholderOption && this.opts.placeholderOption(this.select);
                        if ("" === a.trim(c.text()) && "" === c.val()) return c
                    }
                }, initContainerWidth: function () {
                    function c() {
                        var c, d, e, f, g, h;
                        if ("off" === this.opts.width) return null;
                        if ("element" === this.opts.width) return 0 === this.opts.element.outerWidth(!1) ? "auto" : this.opts.element.outerWidth(!1) + "px";
                        if ("copy" === this.opts.width || "resolve" === this.opts.width) {
                            if (c = this.opts.element.attr("style"), c !== b) for (d = c.split(";"), f = 0, g = d.length; g > f; f += 1) if (h = d[f].replace(/\s/g, ""), e = h.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i), null !== e && e.length >= 1) return e[1];
                            return "resolve" === this.opts.width ? (c = this.opts.element.css("width"), c.indexOf("%") > 0 ? c : 0 === this.opts.element.outerWidth(!1) ? "auto" : this.opts.element.outerWidth(!1) + "px") : null
                        }
                        return a.isFunction(this.opts.width) ? this.opts.width() : this.opts.width
                    }

                    var d = c.call(this);
                    null !== d && this.container.css("width", d)
                }
            }), d = O(c, {
                createContainer: function () {
                    var b = a(document.createElement("div")).attr({"class": "select2-container"}).html(["<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>", "   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>", "   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>", "</a>", "<label for='' class='select2-offscreen'></label>", "<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />", "<div class='select2-drop select2-display-none'>", "   <div class='select2-search'>", "       <label for='' class='select2-offscreen'></label>", "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'", "       aria-autocomplete='list' />", "   </div>", "   <ul class='select2-results' role='listbox'>", "   </ul>", "</div>"].join(""));
                    return b
                }, enableInterface: function () {
                    this.parent.enableInterface.apply(this, arguments) && this.focusser.prop("disabled", !this.isInterfaceEnabled())
                }, opening: function () {
                    var c, d, e;
                    this.opts.minimumResultsForSearch >= 0 && this.showSearch(!0), this.parent.opening.apply(this, arguments), this.showSearchInput !== !1 && this.search.val(this.focusser.val()), this.opts.shouldFocusInput(this) && (this.search.focus(), c = this.search.get(0), c.createTextRange ? (d = c.createTextRange(), d.collapse(!1), d.select()) : c.setSelectionRange && (e = this.search.val().length, c.setSelectionRange(e, e))), "" === this.search.val() && this.nextSearchTerm != b && (this.search.val(this.nextSearchTerm), this.search.select()), this.focusser.prop("disabled", !0).val(""), this.updateResults(!0), this.opts.element.trigger(a.Event("select2-open"))
                }, close: function () {
                    this.opened() && (this.parent.close.apply(this, arguments), this.focusser.prop("disabled", !1), this.opts.shouldFocusInput(this) && this.focusser.focus())
                }, focus: function () {
                    this.opened() ? this.close() : (this.focusser.prop("disabled", !1), this.opts.shouldFocusInput(this) && this.focusser.focus())
                }, isFocused: function () {
                    return this.container.hasClass("select2-container-active")
                }, cancel: function () {
                    this.parent.cancel.apply(this, arguments), this.focusser.prop("disabled", !1), this.opts.shouldFocusInput(this) && this.focusser.focus()
                }, destroy: function () {
                    a("label[for='" + this.focusser.attr("id") + "']").attr("for", this.opts.element.attr("id")), this.parent.destroy.apply(this, arguments), N.call(this, "selection", "focusser")
                }, initContainer: function () {
                    var b, g, c = this.container, d = this.dropdown, e = f();
                    this.opts.minimumResultsForSearch < 0 ? this.showSearch(!1) : this.showSearch(!0), this.selection = b = c.find(".select2-choice"), this.focusser = c.find(".select2-focusser"), b.find(".select2-chosen").attr("id", "select2-chosen-" + e), this.focusser.attr("aria-labelledby", "select2-chosen-" + e), this.results.attr("id", "select2-results-" + e), this.search.attr("aria-owns", "select2-results-" + e), this.focusser.attr("id", "s2id_autogen" + e), g = a("label[for='" + this.opts.element.attr("id") + "']"), this.opts.element.focus(this.bind(function () {
                        this.focus()
                    })), this.focusser.prev().text(g.text()).attr("for", this.focusser.attr("id"));
                    var h = this.opts.element.attr("title");
                    this.opts.element.attr("title", h || g.text()), this.focusser.attr("tabindex", this.elementTabIndex), this.search.attr("id", this.focusser.attr("id") + "_search"), this.search.prev().text(a("label[for='" + this.focusser.attr("id") + "']").text()).attr("for", this.search.attr("id")), this.search.on("keydown", this.bind(function (a) {
                        if (this.isInterfaceEnabled() && 229 != a.keyCode) {
                            if (a.which === k.PAGE_UP || a.which === k.PAGE_DOWN) return A(a), void 0;
                            switch (a.which) {
                                case k.UP:
                                case k.DOWN:
                                    return this.moveHighlight(a.which === k.UP ? -1 : 1), A(a), void 0;
                                case k.ENTER:
                                    return this.selectHighlighted(), A(a), void 0;
                                case k.TAB:
                                    return this.selectHighlighted({noFocus: !0}), void 0;
                                case k.ESC:
                                    return this.cancel(a), A(a), void 0
                            }
                        }
                    })), this.search.on("blur", this.bind(function () {
                        document.activeElement === this.body.get(0) && window.setTimeout(this.bind(function () {
                            this.opened() && this.search.focus()
                        }), 0)
                    })), this.focusser.on("keydown", this.bind(function (a) {
                        if (this.isInterfaceEnabled() && a.which !== k.TAB && !k.isControl(a) && !k.isFunctionKey(a) && a.which !== k.ESC) {
                            if (this.opts.openOnEnter === !1 && a.which === k.ENTER) return A(a), void 0;
                            if (a.which == k.DOWN || a.which == k.UP || a.which == k.ENTER && this.opts.openOnEnter) {
                                if (a.altKey || a.ctrlKey || a.shiftKey || a.metaKey) return;
                                return this.open(), A(a), void 0
                            }
                            return a.which == k.DELETE || a.which == k.BACKSPACE ? (this.opts.allowClear && this.clear(), A(a), void 0) : void 0
                        }
                    })), u(this.focusser), this.focusser.on("keyup-change input", this.bind(function (a) {
                        if (this.opts.minimumResultsForSearch >= 0) {
                            if (a.stopPropagation(), this.opened()) return;
                            this.open()
                        }
                    })), b.on("mousedown touchstart", "abbr", this.bind(function (a) {
                        this.isInterfaceEnabled() && (this.clear(), B(a), this.close(), this.selection && this.selection.focus())
                    })), b.on("mousedown touchstart", this.bind(function (c) {
                        n(b), this.container.hasClass("select2-container-active") || this.opts.element.trigger(a.Event("select2-focus")), this.opened() ? this.close() : this.isInterfaceEnabled() && this.open(), A(c)
                    })), d.on("mousedown touchstart", this.bind(function () {
                        this.opts.shouldFocusInput(this) && this.search.focus()
                    })), b.on("focus", this.bind(function (a) {
                        A(a)
                    })), this.focusser.on("focus", this.bind(function () {
                        this.container.hasClass("select2-container-active") || this.opts.element.trigger(a.Event("select2-focus")), this.container.addClass("select2-container-active")
                    })).on("blur", this.bind(function () {
                        this.opened() || (this.container.removeClass("select2-container-active"), this.opts.element.trigger(a.Event("select2-blur")))
                    })), this.search.on("focus", this.bind(function () {
                        this.container.hasClass("select2-container-active") || this.opts.element.trigger(a.Event("select2-focus")), this.container.addClass("select2-container-active")
                    })), this.initContainerWidth(), this.opts.element.hide(), this.setPlaceholder()
                }, clear: function (b) {
                    var c = this.selection.data("select2-data");
                    if (c) {
                        var d = a.Event("select2-clearing");
                        if (this.opts.element.trigger(d), d.isDefaultPrevented()) return;
                        var e = this.getPlaceholderOption();
                        this.opts.element.val(e ? e.val() : ""), this.selection.find(".select2-chosen").empty(), this.selection.removeData("select2-data"), this.setPlaceholder(), b !== !1 && (this.opts.element.trigger({
                            type: "select2-removed",
                            val: this.id(c),
                            choice: c
                        }), this.triggerChange({removed: c}))
                    }
                }, initSelection: function () {
                    if (this.isPlaceholderOptionSelected()) this.updateSelection(null), this.close(), this.setPlaceholder(); else {
                        var c = this;
                        this.opts.initSelection.call(null, this.opts.element, function (a) {
                            a !== b && null !== a && (c.updateSelection(a), c.close(), c.setPlaceholder(), c.nextSearchTerm = c.opts.nextSearchTerm(a, c.search.val()))
                        })
                    }
                }, isPlaceholderOptionSelected: function () {
                    var a;
                    return this.getPlaceholder() === b ? !1 : (a = this.getPlaceholderOption()) !== b && a.prop("selected") || "" === this.opts.element.val() || this.opts.element.val() === b || null === this.opts.element.val()
                }, prepareOpts: function () {
                    var b = this.parent.prepareOpts.apply(this, arguments), c = this;
                    return "select" === b.element.get(0).tagName.toLowerCase() ? b.initSelection = function (a, b) {
                        var d = a.find("option").filter(function () {
                            return this.selected && !this.disabled
                        });
                        b(c.optionToData(d))
                    } : "data" in b && (b.initSelection = b.initSelection || function (c, d) {
                        var e = c.val(), f = null;
                        b.query({
                            matcher: function (a, c, d) {
                                var g = r(e, b.id(d));
                                return g && (f = d), g
                            }, callback: a.isFunction(d) ? function () {
                                d(f)
                            } : a.noop
                        })
                    }), b
                }, getPlaceholder: function () {
                    return this.select && this.getPlaceholderOption() === b ? b : this.parent.getPlaceholder.apply(this, arguments)
                }, setPlaceholder: function () {
                    var a = this.getPlaceholder();
                    if (this.isPlaceholderOptionSelected() && a !== b) {
                        if (this.select && this.getPlaceholderOption() === b) return;
                        this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(a)), this.selection.addClass("select2-default"), this.container.removeClass("select2-allowclear")
                    }
                }, postprocessResults: function (a, b, c) {
                    var d = 0, e = this;
                    if (this.findHighlightableChoices().each2(function (a, b) {
                        return r(e.id(b.data("select2-data")), e.opts.element.val()) ? (d = a, !1) : void 0
                    }), c !== !1 && (b === !0 && d >= 0 ? this.highlight(d) : this.highlight(0)), b === !0) {
                        var g = this.opts.minimumResultsForSearch;
                        g >= 0 && this.showSearch(L(a.results) >= g)
                    }
                }, showSearch: function (b) {
                    this.showSearchInput !== b && (this.showSearchInput = b, this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !b), this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !b), a(this.dropdown, this.container).toggleClass("select2-with-searchbox", b))
                }, onSelect: function (a, b) {
                    if (this.triggerSelect(a)) {
                        var c = this.opts.element.val(), d = this.data();
                        this.opts.element.val(this.id(a)), this.updateSelection(a), this.opts.element.trigger({
                            type: "select2-selected",
                            val: this.id(a),
                            choice: a
                        }), this.nextSearchTerm = this.opts.nextSearchTerm(a, this.search.val()), this.close(), b && b.noFocus || !this.opts.shouldFocusInput(this) || this.focusser.focus(), r(c, this.id(a)) || this.triggerChange({
                            added: a,
                            removed: d
                        })
                    }
                }, updateSelection: function (a) {
                    var d, e, c = this.selection.find(".select2-chosen");
                    this.selection.data("select2-data", a), c.empty(), null !== a && (d = this.opts.formatSelection(a, c, this.opts.escapeMarkup)), d !== b && c.append(d), e = this.opts.formatSelectionCssClass(a, c), e !== b && c.addClass(e), this.selection.removeClass("select2-default"), this.opts.allowClear && this.getPlaceholder() !== b && this.container.addClass("select2-allowclear")
                }, val: function () {
                    var a, c = !1, d = null, e = this, f = this.data();
                    if (0 === arguments.length) return this.opts.element.val();
                    if (a = arguments[0], arguments.length > 1 && (c = arguments[1]), this.select) this.select.val(a).find("option").filter(function () {
                        return this.selected
                    }).each2(function (a, b) {
                        return d = e.optionToData(b), !1
                    }), this.updateSelection(d), this.setPlaceholder(), c && this.triggerChange({
                        added: d,
                        removed: f
                    }); else {
                        if (!a && 0 !== a) return this.clear(c), void 0;
                        if (this.opts.initSelection === b) throw new Error("cannot call val() if initSelection() is not defined");
                        this.opts.element.val(a), this.opts.initSelection(this.opts.element, function (a) {
                            e.opts.element.val(a ? e.id(a) : ""), e.updateSelection(a), e.setPlaceholder(), c && e.triggerChange({
                                added: a,
                                removed: f
                            })
                        })
                    }
                }, clearSearch: function () {
                    this.search.val(""), this.focusser.val("")
                }, data: function (a) {
                    var c, d = !1;
                    return 0 === arguments.length ? (c = this.selection.data("select2-data"), c == b && (c = null), c) : (arguments.length > 1 && (d = arguments[1]), a ? (c = this.data(), this.opts.element.val(a ? this.id(a) : ""), this.updateSelection(a), d && this.triggerChange({
                        added: a,
                        removed: c
                    })) : this.clear(d), void 0)
                }
            }), e = O(c, {
                createContainer: function () {
                    var b = a(document.createElement("div")).attr({"class": "select2-container select2-container-multi"}).html(["<ul class='select2-choices'>", "  <li class='select2-search-field'>", "    <label for='' class='select2-offscreen'></label>", "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>", "  </li>", "</ul>", "<div class='select2-drop select2-drop-multi select2-display-none'>", "   <ul class='select2-results'>", "   </ul>", "</div>"].join(""));
                    return b
                }, prepareOpts: function () {
                    var b = this.parent.prepareOpts.apply(this, arguments), c = this;
                    return "select" === b.element.get(0).tagName.toLowerCase() ? b.initSelection = function (a, b) {
                        var d = [];
                        a.find("option").filter(function () {
                            return this.selected && !this.disabled
                        }).each2(function (a, b) {
                            d.push(c.optionToData(b))
                        }), b(d)
                    } : "data" in b && (b.initSelection = b.initSelection || function (c, d) {
                        var e = s(c.val(), b.separator, b.transformVal), f = [];
                        b.query({
                            matcher: function (c, d, g) {
                                var h = a.grep(e, function (a) {
                                    return r(a, b.id(g))
                                }).length;
                                return h && f.push(g), h
                            }, callback: a.isFunction(d) ? function () {
                                for (var a = [], c = 0; c < e.length; c++) for (var g = e[c], h = 0; h < f.length; h++) {
                                    var i = f[h];
                                    if (r(g, b.id(i))) {
                                        a.push(i), f.splice(h, 1);
                                        break
                                    }
                                }
                                d(a)
                            } : a.noop
                        })
                    }), b
                }, selectChoice: function (a) {
                    var b = this.container.find(".select2-search-choice-focus");
                    b.length && a && a[0] == b[0] || (b.length && this.opts.element.trigger("choice-deselected", b), b.removeClass("select2-search-choice-focus"), a && a.length && (this.close(), a.addClass("select2-search-choice-focus"), this.opts.element.trigger("choice-selected", a)))
                }, destroy: function () {
                    a("label[for='" + this.search.attr("id") + "']").attr("for", this.opts.element.attr("id")), this.parent.destroy.apply(this, arguments), N.call(this, "searchContainer", "selection")
                }, initContainer: function () {
                    var c, b = ".select2-choices";
                    this.searchContainer = this.container.find(".select2-search-field"), this.selection = c = this.container.find(b);
                    var d = this;
                    this.selection.on("click", ".select2-container:not(.select2-container-disabled) .select2-search-choice:not(.select2-locked)", function () {
                        d.search[0].focus(), d.selectChoice(a(this))
                    }), this.search.attr("id", "s2id_autogen" + f()), this.search.prev().text(a("label[for='" + this.opts.element.attr("id") + "']").text()).attr("for", this.search.attr("id")), this.opts.element.focus(this.bind(function () {
                        this.focus()
                    })), this.search.on("input paste", this.bind(function () {
                        this.search.attr("placeholder") && 0 == this.search.val().length || this.isInterfaceEnabled() && (this.opened() || this.open())
                    })), this.search.attr("tabindex", this.elementTabIndex), this.keydowns = 0, this.search.on("keydown", this.bind(function (a) {
                        if (this.isInterfaceEnabled()) {
                            ++this.keydowns;
                            var b = c.find(".select2-search-choice-focus"),
                                d = b.prev(".select2-search-choice:not(.select2-locked)"),
                                e = b.next(".select2-search-choice:not(.select2-locked)"), f = z(this.search);
                            if (b.length && (a.which == k.LEFT || a.which == k.RIGHT || a.which == k.BACKSPACE || a.which == k.DELETE || a.which == k.ENTER)) {
                                var g = b;
                                return a.which == k.LEFT && d.length ? g = d : a.which == k.RIGHT ? g = e.length ? e : null : a.which === k.BACKSPACE ? this.unselect(b.first()) && (this.search.width(10), g = d.length ? d : e) : a.which == k.DELETE ? this.unselect(b.first()) && (this.search.width(10), g = e.length ? e : null) : a.which == k.ENTER && (g = null), this.selectChoice(g), A(a), g && g.length || this.open(), void 0
                            }
                            if ((a.which === k.BACKSPACE && 1 == this.keydowns || a.which == k.LEFT) && 0 == f.offset && !f.length) return this.selectChoice(c.find(".select2-search-choice:not(.select2-locked)").last()), A(a), void 0;
                            if (this.selectChoice(null), this.opened()) switch (a.which) {
                                case k.UP:
                                case k.DOWN:
                                    return this.moveHighlight(a.which === k.UP ? -1 : 1), A(a), void 0;
                                case k.ENTER:
                                    return this.selectHighlighted(), A(a), void 0;
                                case k.TAB:
                                    return this.selectHighlighted({noFocus: !0}), this.close(), void 0;
                                case k.ESC:
                                    return this.cancel(a), A(a), void 0
                            }
                            if (a.which !== k.TAB && !k.isControl(a) && !k.isFunctionKey(a) && a.which !== k.BACKSPACE && a.which !== k.ESC) {
                                if (a.which === k.ENTER) {
                                    if (this.opts.openOnEnter === !1) return;
                                    if (a.altKey || a.ctrlKey || a.shiftKey || a.metaKey) return
                                }
                                this.open(), (a.which === k.PAGE_UP || a.which === k.PAGE_DOWN) && A(a), a.which === k.ENTER && A(a)
                            }
                        }
                    })), this.search.on("keyup", this.bind(function () {
                        this.keydowns = 0, this.resizeSearch()
                    })), this.search.on("blur", this.bind(function (b) {
                        this.container.removeClass("select2-container-active"), this.search.removeClass("select2-focused"), this.selectChoice(null), this.opened() || this.clearSearch(), b.stopImmediatePropagation(), this.opts.element.trigger(a.Event("select2-blur"))
                    })), this.container.on("click", b, this.bind(function (b) {
                        this.isInterfaceEnabled() && (a(b.target).closest(".select2-search-choice").length > 0 || (this.selectChoice(null), this.clearPlaceholder(), this.container.hasClass("select2-container-active") || this.opts.element.trigger(a.Event("select2-focus")), this.open(), this.focusSearch(), b.preventDefault()))
                    })), this.container.on("focus", b, this.bind(function () {
                        this.isInterfaceEnabled() && (this.container.hasClass("select2-container-active") || this.opts.element.trigger(a.Event("select2-focus")), this.container.addClass("select2-container-active"), this.dropdown.addClass("select2-drop-active"), this.clearPlaceholder())
                    })), this.initContainerWidth(), this.opts.element.hide(), this.clearSearch()
                }, enableInterface: function () {
                    this.parent.enableInterface.apply(this, arguments) && this.search.prop("disabled", !this.isInterfaceEnabled())
                }, initSelection: function () {
                    if ("" === this.opts.element.val() && "" === this.opts.element.text() && (this.updateSelection([]), this.close(), this.clearSearch()), this.select || "" !== this.opts.element.val()) {
                        var c = this;
                        this.opts.initSelection.call(null, this.opts.element, function (a) {
                            a !== b && null !== a && (c.updateSelection(a), c.close(), c.clearSearch())
                        })
                    }
                }, clearSearch: function () {
                    var a = this.getPlaceholder(), c = this.getMaxSearchWidth();
                    a !== b && 0 === this.getVal().length && this.search.hasClass("select2-focused") === !1 ? (this.search.val(a).addClass("select2-default"), this.search.width(c > 0 ? c : this.container.css("width"))) : this.search.val("").width(10)
                }, clearPlaceholder: function () {
                    this.search.hasClass("select2-default") && this.search.val("").removeClass("select2-default")
                }, opening: function () {
                    this.clearPlaceholder(), this.resizeSearch(), this.parent.opening.apply(this, arguments), this.focusSearch(), "" === this.search.val() && this.nextSearchTerm != b && (this.search.val(this.nextSearchTerm), this.search.select()), this.updateResults(!0), this.opts.shouldFocusInput(this) && this.search.focus(), this.opts.element.trigger(a.Event("select2-open"))
                }, close: function () {
                    this.opened() && this.parent.close.apply(this, arguments)
                }, focus: function () {
                    this.close(), this.search.focus()
                }, isFocused: function () {
                    return this.search.hasClass("select2-focused")
                }, updateSelection: function (b) {
                    var c = [], d = [], e = this;
                    a(b).each(function () {
                        p(e.id(this), c) < 0 && (c.push(e.id(this)), d.push(this))
                    }), b = d, this.selection.find(".select2-search-choice").remove(), a(b).each(function () {
                        e.addSelectedChoice(this)
                    }), e.postprocessResults()
                }, tokenize: function () {
                    var a = this.search.val();
                    a = this.opts.tokenizer.call(this, a, this.data(), this.bind(this.onSelect), this.opts), null != a && a != b && (this.search.val(a), a.length > 0 && this.open())
                }, onSelect: function (a, c) {
                    this.triggerSelect(a) && "" !== a.text && (this.addSelectedChoice(a), this.opts.element.trigger({
                        type: "selected",
                        val: this.id(a),
                        choice: a
                    }), this.nextSearchTerm = this.opts.nextSearchTerm(a, this.search.val()), this.clearSearch(), this.updateResults(), (this.select || !this.opts.closeOnSelect) && this.postprocessResults(a, !1, this.opts.closeOnSelect === !0), this.opts.closeOnSelect ? (this.close(), this.search.width(10)) : this.countSelectableResults() > 0 ? (this.search.width(10), this.resizeSearch(), this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize() ? this.updateResults(!0) : this.nextSearchTerm != b && (this.search.val(this.nextSearchTerm), this.updateResults(), this.search.select()), this.positionDropdown()) : (this.close(), this.search.width(10)), this.triggerChange({added: a}), c && c.noFocus || this.focusSearch())
                }, cancel: function () {
                    this.close(), this.focusSearch()
                }, addSelectedChoice: function (c) {
                    var j, k, d = !c.locked,
                        e = a("<li class='select2-search-choice'>    <div></div>    <a href='#' class='select2-search-choice-close' tabindex='-1'></a></li>"),
                        f = a("<li class='select2-search-choice select2-locked'><div></div></li>"), g = d ? e : f,
                        h = this.id(c), i = this.getVal();
                    j = this.opts.formatSelection(c, g.find("div"), this.opts.escapeMarkup), j != b && g.find("div").replaceWith(a("<div></div>").html(j)), k = this.opts.formatSelectionCssClass(c, g.find("div")), k != b && g.addClass(k), d && g.find(".select2-search-choice-close").on("mousedown", A).on("click dblclick", this.bind(function (b) {
                        this.isInterfaceEnabled() && (this.unselect(a(b.target)), this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus"), A(b), this.close(), this.focusSearch())
                    })).on("focus", this.bind(function () {
                        this.isInterfaceEnabled() && (this.container.addClass("select2-container-active"), this.dropdown.addClass("select2-drop-active"))
                    })), g.data("select2-data", c), g.insertBefore(this.searchContainer), i.push(h), this.setVal(i)
                }, unselect: function (b) {
                    var d, e, c = this.getVal();
                    if (b = b.closest(".select2-search-choice"), 0 === b.length) throw"Invalid argument: " + b + ". Must be .select2-search-choice";
                    if (d = b.data("select2-data")) {
                        var f = a.Event("select2-removing");
                        if (f.val = this.id(d), f.choice = d, this.opts.element.trigger(f), f.isDefaultPrevented()) return !1;
                        for (; (e = p(this.id(d), c)) >= 0;) c.splice(e, 1), this.setVal(c), this.select && this.postprocessResults();
                        return b.remove(), this.opts.element.trigger({
                            type: "select2-removed",
                            val: this.id(d),
                            choice: d
                        }), this.triggerChange({removed: d}), !0
                    }
                }, postprocessResults: function (a, b, c) {
                    var d = this.getVal(), e = this.results.find(".select2-result"),
                        f = this.results.find(".select2-result-with-children"), g = this;
                    e.each2(function (a, b) {
                        var c = g.id(b.data("select2-data"));
                        p(c, d) >= 0 && (b.addClass("select2-selected"), b.find(".select2-result-selectable").addClass("select2-selected"))
                    }), f.each2(function (a, b) {
                        b.is(".select2-result-selectable") || 0 !== b.find(".select2-result-selectable:not(.select2-selected)").length || b.addClass("select2-selected")
                    }), -1 == this.highlight() && c !== !1 && this.opts.closeOnSelect === !0 && g.highlight(0), !this.opts.createSearchChoice && !e.filter(".select2-result:not(.select2-selected)").length > 0 && (!a || a && !a.more && 0 === this.results.find(".select2-no-results").length) && J(g.opts.formatNoMatches, "formatNoMatches") && this.results.append("<li class='select2-no-results'>" + K(g.opts.formatNoMatches, g.opts.element, g.search.val()) + "</li>")
                }, getMaxSearchWidth: function () {
                    return this.selection.width() - t(this.search)
                }, resizeSearch: function () {
                    var a, b, c, d, e, f = t(this.search);
                    a = C(this.search) + 10, b = this.search.offset().left, c = this.selection.width(), d = this.selection.offset().left, e = c - (b - d) - f, a > e && (e = c - f), 40 > e && (e = c - f), 0 >= e && (e = a), this.search.width(Math.floor(e))
                }, getVal: function () {
                    var a;
                    return this.select ? (a = this.select.val(), null === a ? [] : a) : (a = this.opts.element.val(), s(a, this.opts.separator, this.opts.transformVal))
                }, setVal: function (b) {
                    var c;
                    this.select ? this.select.val(b) : (c = [], a(b).each(function () {
                        p(this, c) < 0 && c.push(this)
                    }), this.opts.element.val(0 === c.length ? "" : c.join(this.opts.separator)))
                }, buildChangeDetails: function (a, b) {
                    for (var b = b.slice(0), a = a.slice(0), c = 0; c < b.length; c++) for (var d = 0; d < a.length; d++) r(this.opts.id(b[c]), this.opts.id(a[d])) && (b.splice(c, 1), c > 0 && c--, a.splice(d, 1), d--);
                    return {added: b, removed: a}
                }, val: function (c, d) {
                    var e, f = this;
                    if (0 === arguments.length) return this.getVal();
                    if (e = this.data(), e.length || (e = []), !c && 0 !== c) return this.opts.element.val(""), this.updateSelection([]), this.clearSearch(), d && this.triggerChange({
                        added: this.data(),
                        removed: e
                    }), void 0;
                    if (this.setVal(c), this.select) this.opts.initSelection(this.select, this.bind(this.updateSelection)), d && this.triggerChange(this.buildChangeDetails(e, this.data())); else {
                        if (this.opts.initSelection === b) throw new Error("val() cannot be called if initSelection() is not defined");
                        this.opts.initSelection(this.opts.element, function (b) {
                            var c = a.map(b, f.id);
                            f.setVal(c), f.updateSelection(b), f.clearSearch(), d && f.triggerChange(f.buildChangeDetails(e, f.data()))
                        })
                    }
                    this.clearSearch()
                }, onSortStart: function () {
                    if (this.select) throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
                    this.search.width(0), this.searchContainer.hide()
                }, onSortEnd: function () {
                    var b = [], c = this;
                    this.searchContainer.show(), this.searchContainer.appendTo(this.searchContainer.parent()), this.resizeSearch(), this.selection.find(".select2-search-choice").each(function () {
                        b.push(c.opts.id(a(this).data("select2-data")))
                    }), this.setVal(b), this.triggerChange()
                }, data: function (b, c) {
                    var e, f, d = this;
                    return 0 === arguments.length ? this.selection.children(".select2-search-choice").map(function () {
                        return a(this).data("select2-data")
                    }).get() : (f = this.data(), b || (b = []), e = a.map(b, function (a) {
                        return d.opts.id(a)
                    }), this.setVal(e), this.updateSelection(b), this.clearSearch(), c && this.triggerChange(this.buildChangeDetails(f, this.data())), void 0)
                }
            }), a.fn.select2 = function () {
                var d, e, f, g, h, c = Array.prototype.slice.call(arguments, 0),
                    i = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
                    j = ["opened", "isFocused", "container", "dropdown"], k = ["val", "data"],
                    l = {search: "externalSearch"};
                return this.each(function () {
                    if (0 === c.length || "object" == typeof c[0]) d = 0 === c.length ? {} : a.extend({}, c[0]), d.element = a(this), "select" === d.element.get(0).tagName.toLowerCase() ? h = d.element.prop("multiple") : (h = d.multiple || !1, "tags" in d && (d.multiple = h = !0)), e = h ? new window.Select2["class"].multi : new window.Select2["class"].single, e.init(d); else {
                        if ("string" != typeof c[0]) throw"Invalid arguments to select2 plugin: " + c;
                        if (p(c[0], i) < 0) throw"Unknown method: " + c[0];
                        if (g = b, e = a(this).data("select2"), e === b) return;
                        if (f = c[0], "container" === f ? g = e.container : "dropdown" === f ? g = e.dropdown : (l[f] && (f = l[f]), g = e[f].apply(e, c.slice(1))), p(c[0], j) >= 0 || p(c[0], k) >= 0 && 1 == c.length) return !1
                    }
                }), g === b ? this : g
            }, a.fn.select2.defaults = {
                width: "copy",
                loadMorePadding: 0,
                closeOnSelect: !0,
                openOnEnter: !0,
                containerCss: {},
                dropdownCss: {},
                containerCssClass: "",
                dropdownCssClass: "",
                formatResult: function (a, b, c, d) {
                    var e = [];
                    return E(this.text(a), c.term, e, d), e.join("")
                },
                transformVal: function (b) {
                    return a.trim(b)
                },
                formatSelection: function (a, c, d) {
                    return a ? d(this.text(a)) : b
                },
                sortResults: function (a) {
                    return a
                },
                formatResultCssClass: function (a) {
                    return a.css
                },
                formatSelectionCssClass: function () {
                    return b
                },
                minimumResultsForSearch: 0,
                minimumInputLength: 0,
                maximumInputLength: null,
                maximumSelectionSize: 0,
                id: function (a) {
                    return a == b ? null : a.id
                },
                text: function (b) {
                    return b && this.data && this.data.text ? a.isFunction(this.data.text) ? this.data.text(b) : b[this.data.text] : b.text
                },
                matcher: function (a, b) {
                    return o("" + b).toUpperCase().indexOf(o("" + a).toUpperCase()) >= 0
                },
                separator: ",",
                tokenSeparators: [],
                tokenizer: M,
                escapeMarkup: F,
                blurOnChange: !1,
                selectOnBlur: !1,
                adaptContainerCssClass: function (a) {
                    return a
                },
                adaptDropdownCssClass: function () {
                    return null
                },
                nextSearchTerm: function () {
                    return b
                },
                searchInputPlaceholder: "",
                createSearchChoicePosition: "top",
                shouldFocusInput: function (a) {
                    var b = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
                    return b ? a.opts.minimumResultsForSearch < 0 ? !1 : !0 : !0
                }
            }, a.fn.select2.locales = [], a.fn.select2.locales.en = {
                formatMatches: function (a) {
                    return 1 === a ? "One result is available, press enter to select it." : a + " results are available, use up and down arrow keys to navigate."
                }, formatNoMatches: function () {
                    return "No matches found"
                }, formatAjaxError: function () {
                    return "Loading failed"
                }, formatInputTooShort: function (a, b) {
                    var c = b - a.length;
                    return "Please enter " + c + " or more character" + (1 == c ? "" : "s")
                }, formatInputTooLong: function (a, b) {
                    var c = a.length - b;
                    return "Please delete " + c + " character" + (1 == c ? "" : "s")
                }, formatSelectionTooBig: function (a) {
                    return "You can only select " + a + " item" + (1 == a ? "" : "s")
                }, formatLoadMore: function () {
                    return "Loading more results\u2026"
                }, formatSearching: function () {
                    return "Searching\u2026"
                }
            }, a.extend(a.fn.select2.defaults, a.fn.select2.locales.en), a.fn.select2.ajaxDefaults = {
                transport: a.ajax,
                params: {type: "GET", cache: !1, dataType: "json"}
            }, window.Select2 = {
                query: {ajax: G, local: H, tags: I},
                util: {debounce: w, markMatch: E, escapeMarkup: F, stripDiacritics: o},
                "class": {"abstract": c, single: d, multi: e}
            }
        }
    }(jQuery);

    (function ($) {
        "use strict";

        $.fn.select2.locales['tr'] = {
            formatNoMatches: function () {
                return "Sonuç bulunamadı";
            },
            formatInputTooShort: function (input, min) {
                var n = min - input.length;
                return "En az " + n + " karakter daha girmelisiniz";
            },
            formatInputTooLong: function (input, max) {
                var n = input.length - max;
                return n + " karakter azaltmalısınız";
            },
            formatSelectionTooBig: function (limit) {
                return "Sadece " + limit + " seçim yapabilirsiniz";
            },
            formatLoadMore: function (pageNumber) {
                return "Daha fazla…";
            },
            formatSearching: function () {
                return "Aranıyor…";
            }
        };

        $.extend($.fn.select2.defaults, $.fn.select2.locales['tr']);
    })(jQuery);


// /////init method ///////////////
    $(function () {
        var token = $("meta[name='_csrf']").attr("content");
        $(document).ajaxSend(function (e, xhr, options) {
            xhr.setRequestHeader("X-CSRF-TOKEN", token);
        });
        meshop.init.select2();
    });
// //END///init method ///////////////


// =====================================================================================================================
// console.log('%c www.MiddleEastSoft.com ', 'background: #999; color:#D6223B;
// border: solid 5px #D6223B; font-size: 50px;');

})();

function toTurkishLocaleLowerCase(str) {
    str = str.replace(/Ğ/g, 'ğ')
        .replace(/Ü/g, 'ü')
        .replace(/Ş/g, 'ş')
        .replace(/I/g, 'ı')
        .replace(/İ/g, 'i')
        .replace(/Ö/g, 'ö')
        .replace(/Ç/g, 'ç')
        .toLowerCase();
    return str.trim();
}

function toTurkishLocaleUpperCase(str) {
    str = str.replace(/ğ/g, 'Ğ')
        .replace(/ü/g, 'Ü')
        .replace(/ş/g, 'Ş')
        .replace(/ı/g, 'I')
        .replace(/i/g, 'İ')
        .replace(/ö/g, 'Ö')
        .replace(/ç/g, 'Ç')
        .toUpperCase();
    return str.trim();
}

function encodeUrl(str) {
    str = toTurkishLocaleLowerCase(str);
    str = str.replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/i/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .toLowerCase();
    return str;
}

function isIE() {
    var myNav = navigator.userAgent.toLowerCase();
    return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

if (isIE()) {
    alert("Tarayıcınız desteklenmiyor, güncellemek veya firefox indirin");
    location = "https://www.mozilla.org/en-US/firefox/new/";
}