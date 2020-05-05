$(function () {
    var datax = [];
    /* SAVE PRODUCT */
    $(document).on("click", ".btnsave", function (e) {
        e.preventDefault();
        var btn = $(this);

        btn.addClass("loading");

        var prm = $("#frm").serialize().replace(/[^&]+=&/g, '').replace(/&[^&]+=$/g, '');
        var code = $("#frm input[name='code']").val();
        $.post("/json/product/savebycode", prm, function (data) {
                meshop.log("success", "ذخیره شد");
                $(".chkfetch input[data-code='" + code + "']").prop('checked', true);

                // $('#product-modal').modal('hide');
            }
        ).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");

        }).always(function () {
            btn.removeClass('loading');
        });
    });


    /* DELETE ALL IMGES */
    $(document).on("click", ".trash-all-images", function (e) {
        meshop.alert("ask", "Resimler silinecek. emin misiniz?").yes = function () {

            e.preventDefault();
            var images = $('.check');
            var id;
            var selecteditems = [];
            $.each($('.check'), function (i, item) {
                selecteditems.push($(item).data("imgid"));
                id = $(item).data("id");
            });


            $.post("/json/product-images/remove", {
                imgnames: selecteditems.join(),
                id: id
            }, function () {
                meshop.refresh($('#img'));
            }).fail(function () {
                meshop.log("fail", "خطا در سیستم");
            })
        }
    });


    $(document).on("click", ".img-check", function (e) {
        e.preventDefault();
        $(this).toggleClass("check");
        // $(this).toggleClass("showdelbutton");
    });


    /* DELETE IMG */
    $(document).on("click", ".remove", function (e) {
        var btn = $(this);
        meshop.alert("ask", "Resim silinecek. emin misiniz?").yes = function () {

            $.post("/json/product-image/remove", {
                name: btn.data('imgid'),
                id: btn.data('id')
            }, function () {
                meshop.refresh($('#img'));
            }).fail(function () {
                meshop.log("fail", "خطا در سیستم");
            }).always(function () {
            });
        }
    });
    var boutique = $("boutique");
    var currentpage = 1;
    var data = {};

    $(document).find(".btnsavebb").on("click", function (e) {
        var prm = $("#frmbb").serialize() + "&boutiqueid=" + $("boutique").data("id");
        var btn = $(this);
        btn.addClass('loading');
        $.post("/json/product/savebbbycode", prm, function (data) {
                meshop.log("success", "ذخیره شد");
                $('#frmbb').modal('hide');
            }
        ).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

    $(document).find(".btnsaveproductcosttype").on("click", function (e) {
        var prm = $.param({type: $("[name=productcosttype]").val(), products: datax.join()});
        console.log(prm);

        var btn = $(this);
        btn.addClass('loading');

        $.post("/json/crawler/productcosttype/setproducts", prm, function (data) {
                meshop.log("success", "ذخیره شد");
                $('#modalproductcosttype').modal('hide');
            }
        ).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

    $(".btnBBfromTrendera").on("click", function (e) {
        e.preventDefault();
        $("#modalbb").modal("show").meshop({
            json: {boutiqueid: boutique.data("id")}
        });
    });

    $(".btnSetProductType").on("click", function (f) {

        $("#modalproductcosttype").modal("show")
            .meshop({json: {boutiqueid: boutique.data("id")}});

    });


    $("#products-panel").meshop({
        data: "products",
        get: true,
        page: $('[data-id=productList_page]'),
        params: {c: $('[name=c]').val(), s: $('[name=s]').val(), boutique: $("boutique").data('id')},
        filterForm: $('[data-id=search-filter]'),
        modifyJson: function (json) {
            json.oldprice = json.discount ? "strike" : "";
            json.hideDiscBadge = json.discount ? "" : "hidden";
            return json;
        },
        loop: function (obj, json) {
            if (json.crawlfinished) {
                $(obj).find(".btnsendtosite").removeClass("hidden");
                $(obj).find(".chkfetch").removeClass("hidden");
            } else {
                $(obj).find(".btnsendtosite").addClass("hidden");
                $(obj).find(".chkfetch").addClass("hidden");
            }

            $(obj).find(".chkfetch input[type=checkbox]").prop('checked', json.allowsend);

            if (json.pics > 0)
                obj.find('.product-pic').mousemove(function (e) {
                    var offset = $(this).offset();
                    var relX = e.pageX - offset.left;
                    var picInd = Math.ceil(relX * json.pics / $(this).width()) || 1;
                    $(this).find('a').css('background-image', 'url(/images/' + json.picpath + '/n/' + picInd + '.jpg)');
                });

            $(obj).find(".btnfetch").on("click", function (e) {
                e.preventDefault();
                var btn = $(this);
                var barcode = btn.data("barcode");
                var isrefetch = btn.data("crawlfinished");
                btn.addClass("loading");

                fetchproduct(barcode, isrefetch, btn, obj);

            });

            $(obj).find(".chkfetch input[type=checkbox]").on("click", function (e) {
                e.preventDefault();
                var chk = $(this);
                var ischecked = chk.is(':checked');
                chk.addClass('disabled');
                $.post("/json/crawler/product/allowsend", $.param({
                    code: chk.data("code"),
                    allow: ischecked,
                    boutiqueid: $("boutique").data('id')
                }), function (data) {
                    meshop.log("success", "Updated successfully!");
                }).fail(function (e) {
                    meshop.log("fail", "خطا در سیستم");
                }).always(function () {
                    chk.removeClass('disabled');
                    chk.prop('checked', ischecked);
                });
            });
            /* for each prod */
            $(obj).find(".btnupdateinventory").on("click", function (e) {
                e.preventDefault();
                var btn = $(this);
                btn.addClass("loading");


                $.post("/json/crawler/product/updateinventory", $.param({
                    code: btn.data("code"),
                    isallprods: btn.data("allprods"),
                    boutiqueid: $("boutique").data('id')
                }), function (data) {
                    meshop.log("success", "Inventory is updated successfully!");
                }).fail(function (e) {
                    meshop.log("fail", "خطا در سیستم");
                }).always(function () {
                    btn.removeClass('loading');
                });
            });

            $(obj).find('.btncopy').click(function (e) {
                e.stopPropagation();
                meshop.copyToClipboard($(this).data("code"));
            });


            $(obj).find('.btnpin').click(function (e) {
                e.stopPropagation();
                var btn = $(this);
                btn.addClass("loading");
                $.post("/json/crawler/product/pin", $.param({code: btn.data("code")}), function (data) {
                    meshop.log("success", "Pinned successfully!");
                }).fail(function (e) {
                    meshop.log("fail", "خطا در سیستم");
                }).always(function () {
                    btn.removeClass('loading');
                });
            });

            $(obj).find('.btnfix').click(function (e) {
                e.stopPropagation();
                var btn = $(this);
                btn.addClass("loading");
                $.post("/json/crawler/product/fix", $.param({code: btn.data("code")}), function (data) {
                    meshop.log("success", "Fixed successfully!");
                }).fail(function (e) {
                    meshop.log("fail", "خطا در سیستم");
                }).always(function () {
                    btn.removeClass('loading');
                });
            });

            $(obj).find(".manage-variant").click(function (e) {
                e.stopPropagation();
                showVariantModal(e, $(this));
            });

            $(obj).find(".btnsendtosite").on("click", function (e) {
                e.preventDefault();
                var btn = $(this);

                $("#product-modal").modal("show").meshop({
                    url: "/crawler/json/product/load",
                    params: {
                        id: $(btn).data("id")
                    },
                    modifyJson: function (json) {
                        var piclist = [];
                        for (i = 1; i <= json.pic; i++) {
                            var pic = {id: i, name: json.picpath};
                            piclist.push(pic)
                        }
                        json.piclist = piclist;
                        return json;
                    }
                }).on('render', function (robj, jsonx) {
                    $('.summernote').summernote({height: 190});
                    $(".manage-variant").click(function (e) {
                        showVariantModal(e, $(this));
                    });
                    if (jsonx.brand.hassrcbrand) {
                        $.get("/json/search/sourcebrand?s=" + jsonx.brand.name + "&p=", function (data) {
                            // console.log(data.content[0]) ;
                            $("input[name=sourceBrand]").select2("data", data.content[0])
                        });
                    }
                    /*
                     * $(".btnlang").on("click", function(e){
                     * e.preventDefault();
                     *
                     * $("#lang-modal").modal("show").meshop({ json : { faname :
                     * jsonx.faname , enname : jsonx.name }, modifyJson :
                     * function(jsonm) { var s = jsonm.faname; var wordlist =
                     * s.split(" "); var words = []; for (i=1; i<=wordlist.length;
                     * i++){ var word = {idx: i, name: wordlist[i-1] }
                     * words.push(word) } jsonm.words = words; return jsonm; }
                     * }); });
                     */

                    $("#lang-modal").on('render', function (e, json, renderObj) {
                        $(".litextbox").on("change", function (e) {
                            e.preventDefault();
                            var s = "";
                            $("#sortable1 li input[type=text]").each(function (index, itm) {
                                s += $(this).val() + " ";
                            });
                            $("[name=sortedtext]").val(s);
                        });

                        $(".btnsavetext").on("click", function (e) {
                            e.preventDefault();
                            data.faname = $("[name=sortedtext]").val();
                            $("[name=faname]").val(data.faname);
                            $('#lang-modal').modal('hide');
                        });

                        $(".btnremoveword").on("click", function (e) {
                            e.preventDefault();
                            $(this).parents("li").remove();
                            var s = "";
                            $("#sortable1 li input[type=text]").each(function (index, itm) {
                                s += $(this).val() + " ";
                            });
                            $("[name=sortedtext]").val(s);
                            $("[name=faname]").val(data.faname);
                        });

                        $(renderObj).find("#sortable1").sortable({
                            revert: true,
                            connectWith: ".connectedSortable",
                            update: function (event, ui) {
                                $('#sortable1 tr').removeClass('highlights');

                                var s = "";
                                $("#sortable1 li input[type=text]").each(function (index, itm) {
                                    s += $(this).val() + " ";
                                });
                                $("[name=sortedtext]").val(s);
                            }

                        }).disableSelection();
                    });


                    // Add CKEDITOR
                    /*
                     * var editor = CKEDITOR.replace("editor", { language :
                     * 'tr', uiColor : '#9AB8F3', toolbarGroups : [ { name :
                     * 'clipboard', groups : [ 'clipboard', 'undo' ] }, { name :
                     * 'editing', groups : [ 'find', 'selection', 'spellchecker' ] }, {
                     * name : 'links' }, { name : 'insert' }, { name : 'forms' }, {
                     * name : 'tools' }, { name : 'document', groups : [ 'mode',
                     * 'document', 'doctools' ] }, { name : 'others' }, '/', {
                     * name : 'basicstyles', groups : [ 'basicstyles', 'cleanup' ] }, {
                     * name : 'paragraph', groups : [ 'list', 'indent',
                     * 'blocks', 'align' ] }, { name : 'styles', groups : [
                     * 'Styles', 'Format', 'Font', 'FontSize' ] }, { name :
                     * 'colors' }, { name : 'about' } ], removeButtons :
                     * 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
                     * }); editor.setData($("input[name=info]").val());
                     * editor.on('change', function(evt) { var data = { htm :
                     * evt.editor.getData() }
                     * $("input[name=info]").val(evt.editor.getData());
                     * productdetails = data; });
                     */


                    $(".btnupload").on("click", function (e) {
                        // reset first
                        $(".btnupload").removeClass("loading");
                        $(".thumbnail").removeClass("borderheavy");

                        e.preventDefault();
                        var btn = $(this);
                        var id = btn.data("id");
                        var imgid = btn.data("imgid");
                        btn.addClass("loading");
                        $(".thumbnail[data-id=" + id + "][data-imgid=" + imgid + "]").addClass("borderheavy");
                        $("[name=imageno]").val(imgid);
                        $("#upload-panel").removeClass("hidden");


                        if (id) {
                            meshop.uploadImageSetup($('#upload-panel'), "crawler-product-image", {
                                id: id, imgid: imgid
                            });
                        } else {
                            $('#upload-panel').remove();
                        }

                        btn.removeClass("loading");
                    });
                });
            });
        }
    }).on("render", function (e, json, robj) {
        datax = [];
        json.forEach(function (entry) {
            if (entry.id) {
                datax.push(entry.id);
            }
            /*console.log(datax);*/
        });
        $('.totalItems').text(json[json.length - 1].items);
        $('.fetchedItems').text(json[json.length - 1].totalfeched);
        currentpage = json[json.length - 1].number;
        robj.find('.product-pic a.lazy').lazyload({
            effect: "fadeIn"
        });

        $('#filter-body form').addClass('in');
        $('#spinner-page').removeClass('in');

        var page = json[json.length - 1];
        $(window).off('scroll.nextpage');
        if (page.total && page.number < page.total)
            $(window).on("scroll.nextpage", function () {
                if ($(document).height() - $(document).scrollTop() < screen.height) {
                    $(window).off('scroll.nextpage');

                    if (page.total && page.number < page.total) {
                        $('#spinner-page').addClass('in');
                        meshop.refresh($("#products-panel"), {
                            params: {'p': page.number + 1},
                            removeOld: false
                        });
                    }
                }
            });


        var grid = false;
        $(".btngrid").on("click", function (e) {
            e.preventDefault();
            if (!grid) {
                grid = true;
                $("#products-panel .meshop-rendered").removeClass("col-sm-4").removeClass("col-md-4").removeClass("col-lg-4").addClass("col-sm-1").addClass("col-md-1").addClass("col-lg-1")
            } else {
                grid = false;
                $("#products-panel .meshop-rendered").removeClass("col-sm-1").removeClass("col-md-1").removeClass("col-lg-1").addClass("col-sm-4").addClass("col-md-4").addClass("col-lg-4")
            }
        });


    }).on('empty', function () {
        $(window).off('scroll.nextpage');
        $('#filter-body form').addClass('in');
        $('#spinner-page').removeClass('in');
    });

    /* update inv. by filtering */
    $(".btnupdateinventory2").on("click", function (e) {
        e.preventDefault();
        var btn = $(this);
        btn.addClass("loading");
        /*
        * $(".btnupdateinventory2").meshop({ url:
        * "/json/crawler/product/updateinventory/filter", get: true, params
        * :{boutique : $("boutique").data('id')}, filterForm:
        * $('[data-id=search-filter]') });
        */
        $.post("/json/crawler/product/updateinventory", $.param({
            code: btn.data("code"),
            isallprods: btn.data("allprods"),
            boutiqueid: $("boutique").data('id')
        }), function (data) {
            meshop.log("success", "Inventory is updated successfully!");
        }).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

    /* ####################################### */

    // ##PROGRESS
    function showlog() {
        $(".progress").removeClass("hidden");
        if ($(".progress").data("percent") != 100) {

            $.post("/json/crawler/excel-integration/showlog", $.param({boutiqueid: $("boutique").data("id")}), function (json) {
                $(".progress").data("percent", json.percent);
                progressHandlingFunction(json.percent);
            }).fail(function (e) {
                meshop.log("Fail", "error: " + e.responseText);
            });
        } else {
            $(".progress").addClass("hidden");
        }
    }

    // ## EXCEL
    var btncontinueexcel = $('#btncontinueexcel'), btnexporttoexcel = $('#exporttoexcel');

    btncontinueexcel.click(function (e) {
        e.preventDefault();
        $("#selectcolumnsmodal").modal("show").meshop({
            json: [{
                name: "id",
                db: "id",
                selected: true
            }, {
                name: "Barcode",
                db: "barcode",
                selected: true
            }, {
                name: "Product Code",
                db: "code",
                selected: true
            }, {
                name: "Turkish Name",
                db: "name",
                selected: false
            }, {
                name: "Farsi Name",
                db: "faname",
                selected: true
            }, {
                name: "Saleprice Iran",
                db: "fasaleprice",
                selected: true
            }, {
                name: "Marketprice Iran",
                db: "famarketprice",
                selected: true
            }, {
                name: "Category Code",
                db: "catid",
                selected: false
            }, {
                name: "Category Name",
                db: "cat",
                selected: false
            }, {
                name: "Inventory",
                db: "inventory",
                selected: true
            }, {
                name: "Sales Price TR",
                db: "saleprice",
                selected: false
            }, {
                name: "VAT",
                db: "vat",
                selected: true
            }, {
                name: "Type ID",
                db: "typeid",
                selected: true
            }, {
                name: "Type Name",
                db: "typename",
                selected: false
            }, {
                name: "Market price TR",
                db: "marketprice",
                selected: false
            }, {
                name: "Color Code",
                db: "colorid",
                selected: false
            }, {
                name: "Color Name",
                db: "color",
                selected: true
            }, {
                name: "Size Code",
                db: "sizeid",
                selected: false
            }, {
                name: "Size Name",
                db: "size",
                selected: true
            }, {
                name: "Brand Code",
                db: "brandid",
                selected: true
            }, {
                name: "Brand Name",
                db: "brand",
                selected: true
            }, {
                name: "Boutique ID",
                db: "boutiqueid",
                selected: true
            }, {
                name: "Boutique Name",
                db: "boutique",
                selected: true
            }, {
                name: "ProductDetails",
                db: "details",
                selected: true
            }, {
                name: "UID",
                db: "uid",
                selected: true
            }, {
                name: "SourceUrl",
                db: "srcurl",
                selected: true
            }, {
                name: "Private Show",
                db: "private_show",
                selected: true
            }, {
                name: "Image",
                db: "images",
                selected: true
            }],
            loop: loopColumns
        })
    });

    $("#selectcolumnsmodal").on(
        "render",
        function (e, json, renderObj) {
            $(this).find('#exporttoexcel').on('click',
                function (e) {
                    e.preventDefault();
                    $(this).addClass('loading');
                    var ser;
                    var columns = [];
                    var columnstr = [];
                    $.each($('#ColumnsListTable tbody .scheck').find('span.fa-check-square-o'), function (i, item) {
                        columns.push($(item).parent().data('col'));
                        columnstr.push($(item).parent().data('coltr'));
                    });
                    var ser = 'boutiqueid=' + $("boutique").data('id') + '&crawlfinished=true&allpages=true' + '&columns=' + columns.join() + '&columnstr=' + columnstr.join();

                    $.post("/crawler/json/excel-integration/export/products", ser, function (data) {
                        setTimeout(function () {
                            $('<a href="/crawler/excel-integration/exporttoexcel" download=""></a>')[0].click();
                        }, 10000);

                        progressHandlingFunction(100);
                        $(".progress").data("percent", 100);
                        meshop.log("ok", "İşlem tamamlandi.");
                    }).fail(function (e) {
                        meshop.log("fail", "Excel dosyası çıkarılırken hata oluştu. Lütfen tekrar deneyiniz ");
                    }).always(function () {
                        btnexporttoexcel.removeClass('loading');
                    });

                    setInterval(function () {
                        showlog()
                    }, 5000);
                });

        });


    /* used for excel export */
    function loopColumns(obj, json) {
        // check box
        obj.find('.scheck').parent().off('click').click(function (e) {
            e.stopPropagation();
            var checkbox = obj.find(".selected");
            if (checkbox.hasClass('fa-check-square-o')) {
                checkbox.addClass("fa-square-o").removeClass("fa-check-square-o");
            } else {
                checkbox.addClass("fa-check-square-o").removeClass("fa-square-o");
                btncontinueexcel.removeClass("disabled");
            }
            var count = $('span.selected.fa-check-square-o').length;
            if (count > 0) {
                btncontinueexcel.removeClass("disabled");
            } else {
                btncontinueexcel.addClass("disabled");
                obj.find('#selectall').removeClass("fa-check-square-o").addClass("fa-square-o");
            }
        });

        if (!json.hidden) {
            obj.find('.active-check').addClass("fa-check-square-o").removeClass("fa-square-o");
        } else {
            obj.find('.active-check').removeClass("fa-check-square-o").addClass("fa-square-o");
        }

        if (json.selected) {
            var checkbox = obj.find(".selected");
            checkbox.removeClass("fa-square-o").addClass("fa-check-square-o");
        } else {
            var checkbox = obj.find(".selected");
            checkbox.addClass("fa-square-o").removeClass("fa-check-square-o");
        }
    }


    var selectall2 = $('.selectallColumns');
    selectall2.parent().click(function (e) {
        if (selectall2.hasClass('fa-check-square-o')) {
            check(selectall2);
            check(selectall2.closest('table').find("tbody .selected"));
            btncontinueexcel.addClass("disabled");
        } else {
            uncheck(selectall2);
            uncheck(selectall2.closest('table').find("tbody .selected"));
            btncontinueexcel.removeClass("disabled");
        }
    });

    function check(obj) {
        obj.addClass("fa-square-o").removeClass("fa-check-square-o");
    }

    function uncheck(obj) {
        obj.removeClass("fa-square-o").addClass("fa-check-square-o");
    }

    // end of loopColumns used to export to excel

    // ################ EXCEL ####################


    $('#filter-body form').addClass('in');
    $('#spinner-page').removeClass('in');

    $('.totalItems').text($(".productwrap").length);

    /* filtering */
    var catalogfilterManager = {
        filters: [],
        stackcat: [],
        stackbrand: [],
        stackprice: [],
        stacksize: [],
        stackcolor: [],
        addOrRemove: function (fid, ftype, isAdd) {
            var filterItem = {id: fid, type: ftype};
            var u, f, r;
            if (isAdd) {
                for (f = !1, r = catalogfilterManager.filters.length - 1; r >= 0; r--)
                    u = catalogfilterManager.filters[r],
                    u.id === fid && u.type === ftype && (f = !0);
                f || catalogfilterManager.filters.push(filterItem)
            } else
                for (r = catalogfilterManager.filters.length - 1; r >= 0; r--)
                    u = catalogfilterManager.filters[r],
                    u.id === fid && u.type === ftype && (lastRemovedFilterType = ftype,
                        lastRemovedFilterId = fid,
                        catalogfilterManager.filters.splice(r, 1));
        },
        addPrice: function (fid, ftype) {
            var filterItem = {id: fid, type: ftype};
            catalogfilterManager.filters = catalogfilterManager.filters.filter(function (x) {
                return x.type != ftype;
            }); // removeAllPriceType
            catalogfilterManager.filters.push(filterItem);
        },
        showAllOnOff: function (selector, isshow) {
            if (isshow) {
                $(selector).removeClass("hidden");
            } else {
                $(selector).addClass("hidden");
            }
        },
        showFilteredProducts: function (selector) {
            var results = catalogfilterManager.getOnlySharedItems();
            if (typeof (results) !== 'undefined') $('.totalItems').text(results.length);

            $(selector).each(function (i, o) {
                var ppic = $(o);
                if (jQuery.inArray(ppic.data('code'), results) == -1) {
                    $(o).parent().addClass("hidden");
                } else {
                    $(o).parent().removeClass("hidden");
                }
            });
        },
        reset: function () {
            catalogfilterManager.stackcat = [];
            catalogfilterManager.stackbrand = [];
            catalogfilterManager.stacksize = [];
            catalogfilterManager.stackcolor = [];
            catalogfilterManager.stackprice = [];
        },
        getOnlySharedItems: function () {
            var arr = [];
            var ct = 0, br = 0, sz = 0, cl = 0, pr = 0;
            var result;
            if (catalogfilterManager.stackcat.length > 0) ct = 1;
            if (catalogfilterManager.stackbrand.length > 0) br = 1;
            if (catalogfilterManager.stacksize.length > 0) sz = 1;
            if (catalogfilterManager.stackcolor.length > 0) cl = 1;
            if (catalogfilterManager.stackprice.length > 0) pr = 1;
            if (ct == 1) arr.push(catalogfilterManager.stackcat);
            if (br == 1) arr.push(catalogfilterManager.stackbrand);
            if (sz == 1) arr.push(catalogfilterManager.stacksize);
            if (cl == 1) arr.push(catalogfilterManager.stackcolor);
            if (pr == 1) arr.push(catalogfilterManager.stackprice);

            if (arr.length > 0) {
                result = arr.shift().reduce(function (res, v) {
                    if (res.indexOf(v) === -1 && arr.every(function (a) {
                        return a.indexOf(v) !== -1;
                    })) res.push(v);
                    return res;
                }, []);
            } else {
                catalogfilterManager.showAllOnOff($(".productwrap").parent(), true);
                $('.totalItems').text($(".productwrap").length);
            }
            return result;
        },
        apply: function () {

            // filter for Cats
            catalogfilterManager.filters.forEach(function (f) {
                switch (f.type) {
                    case "CategoryType":
                        $(".productwrap").each(function (i, o) {
                            var ppic = $(o);// .find(".product-pic");
                            var ct = ppic.data("cats");

                            if (typeof (ct) !== 'undefined') {
                                ct = ct.slice(1, -1);
                                var cats = ct.split('|');
                                if (cats.length > 0) {
                                    var x = 0;
                                    for (x = 0; x < cats.length; x++) {
                                        if (f.id == cats[x]) {
                                            catalogfilterManager.stackcat.push(ppic.data("code"));
                                        }
                                    }
                                }
                            }

                        });

                        break;
                    case "BrandType":
                        $(".productwrap").each(function (i, o) {
                            var ppic = $(o);// .find(".product-pic");
                            var br = ppic.data("brands");

                            if (typeof (br) !== 'undefined') {
                                // br = br.slice(1,-1);
                                var brands = br.toString().split('|');
                                if (brands.length > 0) {
                                    var x = 0;
                                    for (x = 0; x < brands.length; x++) {
                                        if (f.id == brands[x]) {
                                            catalogfilterManager.stackbrand.push(ppic.data("code"));
                                        }
                                    }
                                }
                            }

                        });
                        break;
                    case "SizeType":
                        $(".productwrap").each(function (i, o) {
                            var ppic = $(o);// .find(".product-pic");
                            var sz = ppic.data("sizes");

                            if (typeof (sz) !== 'undefined') {
                                sz = sz.slice(1, -1);
                                var sz = sz.toString().split('|');
                                if (sz.length > 0) {
                                    var x = 0;
                                    for (x = 0; x < sz.length; x++) {
                                        if (encodeUrl(f.id) == encodeUrl(sz[x])) {
                                            catalogfilterManager.stacksize.push(ppic.data("code"));
                                        }
                                    }
                                }
                            }

                        });
                        break;
                    case "ColorType":
                        $(".productwrap").each(function (i, o) {
                            var ppic = $(o);// .find(".product-pic");
                            var cl = ppic.data("colors");

                            if (typeof (cl) !== 'undefined') {
                                cl = cl.slice(1, -1);
                                var cl = cl.toString().split('|');
                                if (cl.length > 0) {
                                    var x = 0;
                                    for (x = 0; x < cl.length; x++) {
                                        if (encodeUrl(f.id) == encodeUrl(cl[x])) {
                                            catalogfilterManager.stackcolor.push(ppic.data("code"));
                                        }
                                    }
                                }
                            }

                        });
                        break;
                    case "PriceType":
                        $(".productwrap").each(function (i, o) {
                            var ppic = $(o);// .find(".product-pic");
                            var pr = ppic.data("price");

                            if (typeof (pr) !== 'undefined') {
                                var p = f.id.toString().split(';');
                                if (parseFloat(pr) >= parseFloat(p[0]) && parseFloat(pr) <= parseFloat(p[1])) {
                                    catalogfilterManager.stackprice.push(ppic.data("code"));
                                }
                            }
                        });
                        break;
                }
            });

            catalogfilterManager.stackcat = jQuery.unique(catalogfilterManager.stackcat);
            catalogfilterManager.stackbrand = jQuery.unique(catalogfilterManager.stackbrand);
            catalogfilterManager.stacksize = jQuery.unique(catalogfilterManager.stacksize);
            catalogfilterManager.stackcolor = jQuery.unique(catalogfilterManager.stackcolor);
            catalogfilterManager.stackprice = jQuery.unique(catalogfilterManager.stackprice);

            if (catalogfilterManager.filters.length == 0) {
                catalogfilterManager.reset();
                catalogfilterManager.showAllOnOff($(".productwrap").parent(), true);
            } else {
                catalogfilterManager.showFilteredProducts(".productwrap");
            }


        },
        sort: function (type) {
            switch (type) {
                case "saleprice-0":
                    tinysort('.productwrap', {attr: 'data-price', order: 'asc'});
                    break;
                case "saleprice-1":
                    tinysort('.productwrap', {attr: 'data-price', order: 'desc'});
                    break;
                case "discount":
                    tinysort('.productwrap', {attr: 'data-hasdiscount', order: 'desc'});
                    break;

                default:
                    break;
            }


        }
    };
    var form = $('[data-id=search-filter]');
    form.find('select.select2').each(function (index, obj) {
        $(obj).select2({allowClear: true});
    });

    $('select[name=cats]').on("change", function (e) {
        if (e.removed) {// e.removed.id e.removed.text e.added.text
            catalogfilterManager.addOrRemove(e.removed.id, "CategoryType", false);
        }
        if (e.added) {
            catalogfilterManager.addOrRemove(e.added.id, "CategoryType", true);
        }
        catalogfilterManager.apply();
    });

    $('select[name=brand]').on("change", function (e) {
        if (e.removed) {// e.removed.id e.removed.text e.added.text
            catalogfilterManager.addOrRemove(e.removed.id, "BrandType", false);
        }
        if (e.added) {
            catalogfilterManager.addOrRemove(e.added.id, "BrandType", true);
        }
        catalogfilterManager.apply();
    });

    $('select[name=size]').on("change", function (e) {
        if (e.removed) {// e.removed.id e.removed.text e.added.text
            catalogfilterManager.addOrRemove(e.removed.text, "SizeType", false);
        }
        if (e.added) {
            catalogfilterManager.addOrRemove(e.added.text, "SizeType", true);
        }
        catalogfilterManager.apply();
    });

    $('select[name=color]').on("change", function (e) {
        if (e.removed) {// e.removed.id e.removed.text e.added.text
            catalogfilterManager.addOrRemove(e.removed.text, "ColorType", false);
        }
        if (e.added) {
            catalogfilterManager.addOrRemove(e.added.text, "ColorType", true);
        }
        catalogfilterManager.apply();
    });

    $('select[name=price]').on("change", function (e) {
        var val = $(this).val();
        if (val != "")
            catalogfilterManager.addPrice(val, "PriceType");

        catalogfilterManager.apply();
    });

    var timerid;
    form.find('input,select').on("input change", function () {
        clearTimeout(timerid);
        timerid = setTimeout(function () {
            form.trigger('filterChange');
        }, 500);
    });


    $(window).scroll(function () {
        if ($(window).scrollTop() > 400) {
            $('#filter-fixed').addClass('in');// .html("").html($('#filter-body').clone());
        } else {
            $('#filter-fixed').removeClass('in');
        }
    });
    $(window).on("resize scroll", function () {
        $('[name=cats],[name=brand],[name=color],[name=size],[name=price]').select2("close");
    });

    $('[name=cats],[name=brand],[name=color],[name=size],[name=price]').change(function (e) {
        var elm = $(this);
        $('[name=' + elm.attr('name')).not(elm).select2('data', elm.select2('data'));
    });

    $("#sort").on("change", function () {
        catalogfilterManager.sort($(this).find(":selected").data("sort"));

    });

    $('.product-pic a.lazy').lazyload({
        effect: "fadeIn"
    });
    $(".product-pic").mousemove(function (e) {
        if ($(this).data("pics") > 0) {
            var offset = $(this).offset();
            var relX = e.pageX - offset.left;
            var picInd = Math.ceil(relX * $(this).data("pics") / $(this).width()) || 1;
            $(this).find('a').css('background-image', 'url(/images/' + $(this).data("picpath") + '/n/' + picInd + '.jpg)');
        }
    });

    function progressHandlingFunction(percent) {
        $('#excelprogress .progress-bar').css({
            width: percent + "%"
        });// 45% Tamamlandı
        $('#excelprogress .progress-bar').text(percent + "%");
        $('#excelprogress .progress-bar').prop("aria-valuenow", percent);
        if (percent == "100%") {
            // $("#exportlog").removeClass("disabled");
            $('#excelprogress .progress').fadeOut(1000, function () {
                $('#excelprogress .progress-bar').css({
                    width: 0
                });
            });
        }
    }


    function showVariantModal(e, btn) {
        e.preventDefault();
        // show variant modal for selected product id
        $("#variants-modal").modal("show").meshop({
            url: "/crawler/json/producttypes/loadbyprodid",
            params: {
                productid: btn.data("id")
            }
        }).on(
            "render",
            function (e, varjson, varobj) {
                var modal = $(this);
                modal.data("isGenerateRandomBarcode", varjson.isGenerateRandomBarcode);

                if (!varjson.producttype)
                    return;

                // for each variant for example renk/beden add name
                // to
                // table header
                $("#variantstable thead").meshop({
                    json: varjson.producttype.variants
                }).on("render", function (e) {
                    e.stopPropagation();
                });
                // for each variant for example renk/beden/...
                // create a
                // new select2
                $.each(varjson.producttype.variants, function (i, item) {
                    $("#variantstable tbody tr td:nth-child(" + (i + 8) + ") input[name^=vv]").each(function (j, elm) {
                        if (typeof varjson.productvariants[j].values[i] !== "undefined") {
                            $(elm).select2('data', varjson.productvariants[j].values[i]);
                        }
                    });
                });

                // change picture
                varobj.find('.variant_img li').on('click', function () {
                    selectImgForVariants($(this));

                });

                function selectImgForVariants(obj) {
                    var img_src = $(obj).find('img').attr("src");
                    var img_preview = $(obj).parents(".variant_img").find('.selectedimg');
                    img_preview.attr("src", img_src);

                    var s = img_src;
                    if (s.length > 0)
                        s = s.replace("\/images\/", "").replace("\/1.jpg", "");
                    $(obj).parents(".variant_img").find('input[name=selectedimg]').val(s);
                }
            }); // END OF RENDER MODAL VARIANTS
    }

    $(".btnupdateinventory").on("click", function (e) {
        e.preventDefault();
        var btn = $(this);
        btn.addClass("loading");
        $.post("/json/crawler/product/updateinventory", $.param({
            code: btn.data("code"),
            isallprods: btn.data("allprods"),
            boutiqueid: $("boutique").data('id')
        }), function (data) {
            meshop.log("success", "Inventory is updated successfully!");
        }).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

    $(".btnunfetchbtk").on("click", function (e) {
        var modal = meshop.alert("ask", "آیا مطمین هستید؟", "هشدار");
        modal.size("md");
        modal.yes = function () {
            e.preventDefault();
            var btn = $(this);
            btn.addClass("loading");
            $.post("/json/crawler/product/unfetch", $.param({boutiqueid: $("boutique").data('id')}), function (data) {
                meshop.log("success", "btk unfetch successfully!");
            }).fail(function (e) {
                meshop.log("fail", "خطا در سیستم");
            }).always(function () {
                btn.removeClass('loading');
            });
        }
    });


    function fetchproduct(barcode, isrefetch, btn, obj) {
        $.post("/json/crawler/product/fetch", $.param({barcode: barcode, isrefetch: isrefetch}), function (data) {
                $(obj).find(".btnsendtosite").removeClass("hidden");
                btn.data("crawlfinished", true);
                btn.removeClass('loading');
                // $(obj).find(".chkfetch input[type=checkbox]").prop('checked',
                // true);
                $(obj).find(".chkfetch").removeClass("hidden");
            }
        ).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    }
});


