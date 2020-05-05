$(function () {
    var productdetails = "";
    var jsonvariants = null;

    // loop products in grid
    function loop(obj, json) {
        obj.find(".manage-variant").click(function (e) {
            e.stopPropagation();
            // show variant modal for selected product id
            $("#variants-modal").modal("show").meshop({
                url: "/crawler/json/producttypes/loadbyprodid",
                params: {
                    productid: json.id
                }
            });
        });
        obj.click(function (e) {
            e.stopPropagation();
            // get calc vat by product id
            $("#product-modal").modal("show").meshop({
                url: "/crawler/json/product/load",
                params: {
                    id: json.id
                },
                modifyJson: function (json) {
                    json.calcvat = true;
                    return json;
                }
            }).on('render', function (robj, rjson) {
                if (rjson.barcode) {
                    $("#variant-div").removeClass('hidden');
                } else {
                    $("#variant-div").addClass('hidden');
                }

            });
        });
        obj.find('.btn').parent().click(function (e) {
            e.stopPropagation();
        });
        // check box
        obj.find('.scheck').off('click').click(function (e) {
            e.stopPropagation();
            var checkbox = obj.find(".selected");
            if (checkbox.hasClass('fa-check-square-o')) {
                checkbox.addClass("fa-square-o").removeClass("fa-check-square-o");
            } else {
                checkbox.addClass("fa-check-square-o").removeClass("fa-square-o");
                del.removeClass("disabled");
            }
            var count = $('span.selected.fa-check-square-o').length;
            if (count > 0) {
                del.removeClass("disabled");
                btncontinuenebim.removeClass("disabled");
            } else {
                del.addClass("disabled");
                btncontinuenebim.addClass("disabled");
                $('#selectall').removeClass("fa-check-square-o").addClass("fa-square-o");
            }
        });
    }

    $("#addnewProduct").on("click", function (e) {
        e.preventDefault();
        productdetailshtm = "";
        $("#product-modal").modal("show").meshop({
            // default value for new product modal
            json: {
                vat: {
                    id: 2,
                    name: '8'
                },
                showorder: 100,
                available: true,
                inventory: 0,
                calcvat: true,
                categories: []
            }
        })
    });

    // UpdateImage picpath
    $("#updateImages").on("click", function (e) {
        var btn = $(this);
        btn.addClass("loading");
        e.preventDefault();
        $.post("/crawler/json/product/updateimages", function (data) {
            meshop.log("ok", "Ürün resimleri başarıyla güncellendi.");
        }).fail(function (e) {
            meshop.log("error", "Ürünü resimleri güncellendirken bir hata oluştu. Lütfen tekrar deneyeniz.");
        }).always(function () {
            btn.removeClass("loading");
        });
    });

    // RENDER MODAL variants(GET BY PROD ID)
    $("#variants-modal")
        .on(
            "render",
            function (e, json, robj) {
                var modal = $(this);
                modal.data("isGenerateRandomBarcode", json.isGenerateRandomBarcode);
                robj.find("input[name=producttype]").on(
                    'change',
                    function (e) {
                        var selectedtypeid = $(this).val();
                        var modal = meshop.alert("ask", "Şanda Ürüntipini değiştirmektesiniz, "
                            + "bu işlemi yaparsanız yeni ürün tipine geçtiğinizde aynı varyantlar olmaz ise, "
                            + "bazı varyant degerlerini kaybedebilirsiniz. Emin misiniz ?", "Uyarı");
                        modal.size("md");
                        modal.yes = function () {
                            e.preventDefault();
                            $.post("/crawler/json/producttypevariants/change", {
                                id: selectedtypeid,
                                baseprodid: json.baseprodid
                            }, function (data) {
                                if (data) {
                                    meshop.log("Ürün tipi başarıyla değişti");
                                    meshop.refresh($("#variants-modal"));
                                } else {
                                    meshop.alert("error", "Ürün tipini değiştirirken hata oluştu, Lüften tekrar deyiniz.");
                                }
                            });
                        };
                    });

                if (!json.producttype)
                    return;

                // for each variant for example renk/beden add name to
                // table header
                $("#variantstable thead").meshop({
                    json: json.producttype.variants
                }).on("render", function (e) {
                    e.stopPropagation();
                });
                // for each variant for example renk/beden/... create a
                // new select2
                $.each(json.producttype.variants, function (i, item) {
                    $("#variantstable tbody tr td:nth-child(" + (i + 8) + ") input[name^=vv]").each(function (j, elm) {
                        $(elm).select2('data', json.productvariants[j].values[i]);
                    });
                });
                robj
                    .find("#addnewVariant")
                    .click(
                        function () {
                            var barcode = "";
                            if (json.isGenerateRandomBarcode)
                                barcode = Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1)) + 1000000000000;
                            // console.log(barcode);
                            var strhtm = "<tr data-render='productvariants'> " + "    <td>#</td>"
                                + "    <td><input type='text' class='form-control input-sm' name='name' value='"
                                + json.productvariants[0].title
                                + "' /></td>"
                                + "    <td><input type='text' class='form-control input-sm' name='code' value='"
                                + json.productvariants[0].code
                                + "' /></td>"
                                + "    <td><input type='text' class='form-control input-sm' name='barcode' value='"
                                + barcode
                                + "' /></td>"
                                + "    <td><input type='text' class='form-control input-sm' name='inventory' value='"
                                + json.productvariants[0].inventory
                                + "'/></td>"
                                + "    <td><input type='text' class='form-control input-sm' name='saleprice' value='"
                                + json.productvariants[0].saleprice
                                + "' /></td>"
                                + "<td class='variant_img text-center'>"
                                + "   <div class='dropdown pull-right' data-id='"
                                + json.productvariants[0].id
                                + "'>"
                                + "   <input type='hidden' name='selectedimg' value='"
                                + json.productvariants[0].picpath
                                + "'></input>"
                                + "   <img class='selectedimg' src='/images/"
                                + json.productvariants[0].picpath
                                + "/1.jpg' width='30' heigh='35'></img>"
                                + "   <button class='btn btn-default btn-xs dropdown-toggle varimgbtn' type='button' id='dropdownMenu1' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>"
                                + "      <span class='caret'></span>"
                                + "   </button>"
                                + "   <ul class='dropdown-menu' aria-labelledby='dropdownMenu1'>";

                            $.each(json.imglist, function (i, item) {
                                strhtm += "   	<li data-render='imglist'><a href='#'><img class='variantimg' src='/images/" + item.imgpath
                                    + "/1.jpg' width='30' height='35'></img></a></li>";
                            });

                            strhtm += "  </div>" + "</td>";

                            $.each(json.producttype.variants, function (i, item) {
                                strhtm += "<td data-render='productvariants.values'>" + "<input name='vv_" + item.id
                                    + "' class='form-control' meshop-select2='/adminpanel/json/variantsvalue/load?v=" + item.id
                                    + "' /></td>";
                            });
                            strhtm += "   <td>"
                                + "      <button type='button' class='btn btn-primary btn-xs saveVariant' data-id='' title='kaydet'><span class='fa fa-save'></span></button>"
                                + "      <button type='button' class='btn btn-success btn-xs btnOpenChangeBaseprodModal'  data-id='' title='Ana ürünü değiştir'><span class='fa fa-edit'></span></button>"
                                + "      <button type='button' class='btn btn-danger btn-xs btnDeleteVariant' data-id='' title='Sil'><span class='fa fa-remove'></span></button>"
                                + "   </td></tr>";
                            var newRow; // the new row added
                            // when preeing
                            // addnewbtn
                            newRow = $(strhtm);
                            $("#variantstable tbody").append(newRow);
                            meshop.init.select2(newRow);
                            // Save new variant as a new product
                            newRow.find("button.saveVariant").click(function () {
                                var btnsave = $(this);
                                savevariants(btnsave, newRow, true);
                            });

                            newRow.find('.variant_img li').on('click', function () {
                                selectImgForVariants($(this));
                            });

                            newRow.find('.btnDeleteVariant').on('click', function () {
                                $(this).parent().parent().remove();
                            });
                        });
                // update old variant
                robj.find("button.saveVariant").click(function () {
                    var btnsave = $(this);
                    savevariants(btnsave, robj, false);
                });
                robj.find("#saveAllVariants").on(
                    'click',
                    function (e) {
                        // console.log(JSON.stringify(json));
                        var myjson;
                        jsonvariants = "[";
                        var ind = 1;
                        var count = robj.find("[data-render=productvariants]").size();
                        $.each(robj.find("[data-render=productvariants]"), function (i, elm) {
                            var id = $(elm).find("td").eq(0).text().trim();
                            id = (id == '#') ? "0" : id;
                            var barcode = $(elm).find("[name=barcode]").val();
                            var sprice = $(elm).find("[name=saleprice]").val();
                            var inventory = $(elm).find("[name=inventory]").val();
                            var pic = $(elm).find('input[name=selectedimg]').val();

                            var jsonvv = "[";
                            var indv = 1;
                            var countv = json.producttype.variants.length;
                            $.each(json.producttype.variants, function (i, item) {

                                var variantid = item.id;
                                var variantvalue = $(elm).find("input[name=vv_" + variantid + "]").val();
                                var v = '{"variantid":' + variantid + ', "variantvalue":' + variantvalue + '}';
                                if (indv < countv)
                                    v += ",";

                                jsonvv += v;
                                indv++;
                            });
                            jsonvv += ']';
                            var s = '{"id":' + id + ', "barcode":' + barcode + ',"inventory":' + inventory + ', "saleprice":' + sprice
                                + ', "picpath":"' + pic + '","variantvalues":' + jsonvv + '}';

                            if (ind < count)
                                s += ",";
                            jsonvariants += s;
                            ind++;
                        });
                        jsonvariants += "]";
                        // console.log(jsonvariants);
                        $("td[data-varid]").parent().css("border", "none");
                        var x = validateVariants(jsonvariants);
                        if (x != 0) {
                            meshop.log("warn", "Varyant değerleri iki ayri barkod'ta aynı olamaz!");
                            $.each(x, function (i, itm) {
                                $("td[data-varid=" + itm + "]").parent().css("border", "2px solid red");
                            });
                        }
                        myjson = '{"prodvariants":' + jsonvariants + '}';
                        // '{"prodvariants":' + jsonvariants +
                        // ',"baseprodid":' + json.baseprodid + '}';
                        myjson = JSON.parse(myjson);
                        $.ajax({
                            type: 'POST',
                            url: '/crawler/json/products/saveallvariants',
                            data: JSON.stringify(myjson),
                            success: function (data) {
                                meshop.log('ok', '1');
                            },
                            fail: function (e) {
                                meshop.log('error', '2');
                            },
                            contentType: "application/json",
                            dataType: 'json'
                        });

                    });

                function validateVariants(json) {
                    var retval = 0;
                    var arrVV = [];
                    var arrError = [];
                    var prodvariant = JSON.parse(json);
                    $.each(prodvariant, function (i, item) {
                        var s = "";
                        $.each(item.variantvalues, function (i, vv) {
                            s += vv.variantid + '-' + vv.variantvalue + '-';
                        });
                        if (arrVV.indexOf(s) == -1) { // if not
                            // contains
                            arrVV.push(s);
                        } else {
                            arrError.push(item.id);
                        }

                    });
                    if (arrError.length > 0) {
                        retval = arrError;
                    }
                    return retval;

                }

                // only one row save(will be deleted)
                function savevariants(btnsave, containerobj, isnew) {
                    var code = btnsave.parent().parent().find("input[name=code]").val();
                    if (code.length > 0) {
                        var id = btnsave.data('id');
                        var ser = "id=" + id + "&baseprodid=" + json.baseprodid + "&type=" + $("input[name=producttype]").val() + "&newvariant="
                            + isnew + "&";
                        $.each(btnsave.closest("tr").find(":input[name]"), function (i, input) {
                            ser += input.name + "=" + input.value + "&"
                        });
                        var variantvalues = '';
                        $.each(json.producttype.variants, function (i, item) {
                            variantvalues += btnsave.parent().parent().find("input[name=vv_" + item.id + "]").val() + ',';
                        });
                        variantvalues = variantvalues.substring(0, variantvalues.length - 1);
                        ser += "variantvalues=" + variantvalues;
                        $.post("/adminpanel/json/products/savevariant", ser, function (data) {
                            btnsave.parent().parent().find("td").eq(0).html(data + " <i class='fa fa-arrow-right'></i>");
                            meshop.log("ok", "Varyant başarıyla güncellendi.");
                            meshop.refresh($("#variants-modal"));
                            meshop.refresh($("#product-modal"));
                        }).fail(function (e) {
                            switch (e.responseJSON) {
                                // case 1: // duplicate code
                                // meshop.alert('error', 'Ürün kodu daha
                                // önce kullanılmış.');
                                // break;
                                case 2: // duplicate barcode
                                    meshop.alert('error', 'Barkod kodu daha önce kullanılmış. ');
                                    break;
                                case 3: // same values
                                    meshop.alert('error', 'Bu varyant zaten kayıtlı');
                                    break;
                                default:
                                    meshop.log("fail", "Varyant kaydedilirken bir hata oluştu. lütfen tekrar deneyeniz ");
                                    break;
                            }
                        }).always(function () {
                            containerobj.find("button.saveVariant").removeClass('loading').removeClass('disabled');
                        });
                    }

                }

                robj.find("button.btnOpenChangeBaseprodModal").click(function () {
                    $("#baseprod-modal").modal("show").meshop({
                        json: json
                    });
                });

                // change picture
                robj.find('.variant_img li').on('click', function () {
                    selectImgForVariants($(this));
                    // var img_src = $(this).find('img').attr("src");
                    // var img_preview =
                    // $(this).parents(".variant_img").find('.selectedimg');
                    // img_preview.attr("src", img_src);
                    //
                    // var s = img_src;
                    // if(s.length>0)
                    // s =
                    // s.replace("\/images\/","").replace("\/1.jpg","");
                    // $(this).parents(".variant_img").find('input[name=selectedimg]').val(s);
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

    $("#baseprod-modal").on("render", function (e, json, robj) {
        var modal = $(this);
        // update baseprod
        robj.find("button.btnchangebaseprod").click(function () {
            var modal = meshop.alert("ask", "Seçtiğiniz ürünün ana ürününü güncellemektesiniz, " + " Emin misiniz ?", "Uyarı");
            modal.size("md");
            modal.yes = function () {
                e.preventDefault();
                $.post("/crawler/json/baseproduct/update", {
                    prodid: json.id,
                    baseprodid: robj.find("input[name=cmbbaseprod]").val()
                }, function (data) {
                    if (data) {
                        meshop.log("Ana ürün başarıyla güncellendi.");
                        modal.close();
                        meshop.refresh($("#variants-modal"));
                    } else {
                        meshop.alert("error", "Ana ürün değiştirirken hata oluştu, Lüften tekrar deyiniz.");
                    }
                });
            };
        });
    }); // END OF RENDER MODAL BASE PROD CHANGE

    // RENDER MODAL PRODUCTS
    // GET BY PROD ID
    $("#product-modal").on("render", function (e, json, robj) {
        var modal = $(this);
        // Categories
        $.get("/crawler/json/cattree/load", function (data) {
            var setting = {
                check: {
                    enable: true,
                    chkboxType: {
                        "Y": "",
                        "N": ""
                    },
                },
                view: {
                    dblClickExpand: false,
                    selectedMulti: false,
                    expandSpeed: "fast"
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: onClick
                }
            }, zTreeNodes = data;
            zTreeObj = $.fn.zTree.init(robj.find('.ztree'), setting, zTreeNodes);

            function filter(node) {
                var found = false;
                $.each(json.categories, function (index, cat) {
                    if (node.id == cat.toString()) {
                        found = true;
                    }
                });
                return found;
            }

            var treeNodes = zTreeObj.getNodesByFilter(filter);
            $.each(treeNodes, function (index, node) {
                zTreeObj.checkNode(node, true, false);
                zTreeObj.expandNode(node.getParentNode(), true, false, true);
            });

            function onClick(e, treeId, treeNode) {
                zTreeObj.expandNode(treeNode);
            }
        });

        // Add CKEDITOR
        var editor = CKEDITOR.replace("editor", {
            language: 'tr',
            uiColor: '#9AB8F3',
            toolbarGroups: [{
                name: 'clipboard',
                groups: ['clipboard', 'undo']
            }, {
                name: 'editing',
                groups: ['find', 'selection', 'spellchecker']
            }, {
                name: 'links'
            }, {
                name: 'insert'
            }, {
                name: 'forms'
            }, {
                name: 'tools'
            }, {
                name: 'document',
                groups: ['mode', 'document', 'doctools']
            }, {
                name: 'others'
            }, '/', {
                name: 'basicstyles',
                groups: ['basicstyles', 'cleanup']
            }, {
                name: 'paragraph',
                groups: ['list', 'indent', 'blocks', 'align']
            }, {
                name: 'styles',
                groups: ['Styles', 'Format', 'Font', 'FontSize']
            }, {
                name: 'colors'
            }, {
                name: 'about'
            }],
            removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
        });
        editor.setData($("input[name=info]").val());
        editor.on('change', function (evt) {
            var data = {
                htm: evt.editor.getData()
            };
            productdetails = data;
        });

        $('a[href=#urundetaytab]').one('show.bs.tab', function (e) {
            if (json.id) {
                $('#urundetaytab .alert').remove();
            } else {
                $('#urundetaytab #details').remove();
            }
        });

        // clone product
        $("#copyProduct").on("click", function (e) {
            var btn = $(this);
            btn.addClass("loading");
            e.preventDefault();
            $.post("/crawler/json/product/clone", {
                id: json.id
            }, function (data) {
                meshop.refresh($("#ProductListTable"));
                meshop.log("ok", "Ürün başarıyla kopiyalandi.");
            }).fail(function (e) {
                meshop.log("error", "Ürünü kopiyalarken bir hata oluştu. Lütfen tekrar deneyeniz.");
            }).always(function () {
                btn.removeClass("loading");
            });
        });
        // Calcuale Desi
        robj.find(".calcdesi").click(function (e) {
            e.stopPropagation();
            var desi = (robj.find("input[name=width]").val() * robj.find("input[name=lengthh]").val() * robj.find("input[name=height]").val()) / 3000;
            robj.find("input[name=desi]").val(desi);
        });
        if (json.barcode)
            robj.find("input[name=friendlyurl]").val(meshop.generateUrl(json));
        $("#productModalLabel").text(json.name);
        robj.find("li a.imagetab").click(function () {
            console.log();
        });
        // ////////////////////////////////////////////////////////////////////
        $('a[href=#images]').one('show.bs.tab', function (e) {
            if (json.id) {
                $('#images .alert').remove();
                meshop.uploadImageSetup($('#images'), "", {
                    id: json.id
                });
                meshop.refresh($("#ProductListTable"));
            } else {
                $('#images #upload-panel').remove();
            }
        });
        $('#product-picture').on("change", function (e) {
            e.stopPropagation();
            if ($(this).data("oldval") != $(this).val()) {
                $(this).data("oldval", $(this).val());
                $.post("/crawler/json/product-image/picpath", {
                    id: json.id,
                    picpath: $(this).val()
                }, function () {
                    meshop.refresh($('#images'));
                });
            }
        });
        // end image upload section

        /* render friendlyUrl */
        robj.find("input[name=barcode],input[name=name]").on("change", function (e) {
            e.stopPropagation();
            var jsonProd = {
                barcode: robj.find("input[name=barcode]").val(),
                name: robj.find("input[name=name]").val()
            };
            if (validates())
                robj.find("input[name=friendlyurl]").val(meshop.generateUrl(jsonProd));
        });

        /* KDV Dahil/Haric */
        robj.find("input[name=calcvat]").on("change", function (e) {
            var obj = $("input[name=saleprice]");
            $("#c1").prop("checked", true);
            $("#c2").prop("checked", false);
            var price = checkPrice(obj);
            if (price != null) {
                // if kdv dahil
                if ($(this).val() == "true") {
                    $("#c1").prop("checked", false);
                    $("#c2").prop("checked", true);
                    price = calculateVat(price, $("input[name=vat]"));
                }

                obj.val(price.replace(".", ","))
            }

        })
    });

    function calculateVat(price, objvat) {
        price = price / (objvat.select2('data').name / 100 + 1);
        price = price.toFixed(2);
        return price;
    }

    // validations price input
    function checkPrice(obj) {
        var price = obj.val(), strprice = price;

        var chk = meshop.check;
        if (!chk.length(obj, 1))
            return null;

        price = price.replace(",", ".");
        price = parseFloat(price).toFixed(2);

        obj.val(price);
        if (!chk.isnumeric(obj))
            return null;

        return price;
    }

    $("#ProductListTable").meshop({
        url: "/crawler/json/products/load",
        params: {
            removed: false
        },
        loop: loop,
        page: $('[data-id=productList_page]'),
        pageWidth: 10,
        filterForm: $('#filter-form'),
        modifyJson: mdfJson
    });

    $("#removeProduct").on("click", function () {
        var btn = $(this);
        btn.addClass('loading');
        var selectedtypeid = $(this).val();
        var modal = meshop.alert("ask", "Şeçtiğiniz ürün(ler) silmektesiniz, " + "bu işlemi yapmaktan emin misiniz?", "Uyarı");
        modal.size("md");
        modal.close = function () {
            btn.removeClass('loading');
        };
        modal.yes = function () {
            var selecteditems = "";
            var count = $('.scheck .fa-check-square-o').map(function (index, obj) {
                return $(obj).closest('tr').data('id');
            });
            var selecteditems = count.get().join();
            if (selecteditems) {
                $.post("/adminpanel/json/products/remove", {
                    ids: selecteditems
                }, function (data) {
                    $.each(data, function (i, val) {
                        meshop.log("error", "(barkod: " + val.barcode + " ürün: " + val.code + ") " + val.error);
                    });
                    meshop.refresh($("#ProductListTable"));
                    meshop.log("ok", "Ürünler Silindi");
                }).fail(function (e) {
                    meshop.log("fail", "Ürünler silinirken bir hata oluştu. Lütfen tekrar deneyeniz !");
                }).always(function () {
                    btn.removeClass('loading');
                });
            }
        };
    });

    /* SAVE this barkod */
    $("#saveNewProductBarcode").on("click", function (e) {
        e.preventDefault();
        saveProduct(true);
    });
    /* SAVE PRODUCT */
    $("#saveNewProduct").on(
        "click",
        function (e) {
            e.preventDefault();
            saveProduct(false);
        });

    function saveProduct(onlyThisBarcode) {
        if (!validates()) { // VALIDATE
            meshop.log("error", "Lütfen seçili alanları doldurunuz. <br/><b> " + validatesMsg() + "</b>", "Hata");

        } else {

            // var editordata = CKEDITOR.instances.editor.getData();
            var cats = [];
            $.each(zTreeObj.getCheckedNodes(), function (index, node) {
                cats.push(node.id);
            });

            var relatives = [];
            var rel = $("input[name=relativeproducts]").val();
            if (rel.length > 0) {
                relatives = rel.split(",");
            }

            var labels = [];
            var lab = $("input[name=tags]").val();
            if (lab.length > 0) {
                labels = lab.split(",");
            }

            var prm = $("#addproduct-form").serialize().replace(/[^&]+=&/g, '').replace(/&[^&]+=$/g, '');
            var contents = productdetails.htm;
            $.post("/crawler/json/products/save",
                manipulateParams(prm) + "&labels=" + encodeURI(meshop.replaceAll(JSON.stringify(labels), '"', '').replace(']', '').replace('[', '')) + "&relativeproducts=" + encodeURI(meshop.replaceAll(JSON.stringify(relatives), '"', '').replace(']', '').replace('[', '')) + "&cats=" + encodeURI(JSON.stringify(cats))).done(function (saveId) {
                if (productdetails.htm != null) {
                    $.post("/crawler/json/product/details/save", {
                        productDetail: contents,
                        onlythisbarcode: onlyThisBarcode,
                        id: $("input[name=id]").val()
                    });
                }

                $("#ProductListTable").data("id", saveId);
                meshop.log("success", "Başarıyla kaydedildi!");
                $("#product-modal").modal("hide");
                meshop.refresh($("#ProductListTable"));
            }).fail(function (e) {
                meshop.log("error", "Kayedilirken hata oluştu. Lütfen tekrak deneyiniz", "Hata");
            });
        }
    }

    function manipulateParams(prm) {
        var json = prm ? JSON.parse('{"' + prm.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === "" ? value : decodeURIComponent(value)
        }) : {};
        var sprice = json.saleprice;
        if (typeof json.saleprice !== "undefined") {
            json.saleprice = parseFloat(sprice.replace(",", "."));
            if ($("#c1").prop("checked") == true) { // c1 means calcvat true
                json.saleprice = calculateVat(json.saleprice, $("input[name=vat]"));
            }
        }

        var mprice = json.marketprice;
        if (typeof json.marketprice !== "undefined")
            json.marketprice = parseFloat(mprice.replace(",", "."));

        var pprice = json.purchaseprice;
        if (typeof json.purchaseprice !== "undefined")
            json.purchaseprice = parseFloat(pprice.replace(",", "."));

        var sprice1 = json.saleprice1;
        if (typeof json.saleprice1 !== "undefined")
            json.saleprice1 = parseFloat(sprice1.replace(",", "."));

        var sprice2 = json.saleprice2;
        if (typeof json.saleprice2 !== "undefined")
            json.saleprice2 = parseFloat(sprice2.replace(",", "."));

        var sprice3 = json.saleprice3;
        if (typeof json.saleprice3 !== "undefined")
            json.saleprice3 = parseFloat(sprice3.replace(",", "."));

        var sprice4 = json.saleprice4;
        if (typeof json.saleprice4 !== "undefined")
            json.saleprice4 = parseFloat(sprice4.replace(",", "."));

        delete (json.labels);
        delete (json.relativeproducts);
        return encodeURI(jsontoparam(JSON.stringify(json)));
    }

    function jsontoparam(strjson) {
        var s = meshop.replaceAll(strjson, "\"", "");
        s = meshop.replaceAll(s, "{", "");
        s = meshop.replaceAll(s, "}", "");
        s = meshop.replaceAll(s, ":", "=");
        s = meshop.replaceAll(s, ",", "&");
        return s;
    }

    function validatesMsg() {
        var chk = meshop.check;
        /*
         * if (!chk.length($('#product-modal input[name=brand]'), 1)) return
         * "Marka";
         */
        if (!chk.length($('#product-modal input[name=vat]'), 1))
            return "KDV";
        if (!chk.length($('#product-modal input[name=name]'), 3))
            return "Ürün Adı";
        if (!chk.length($('#product-modal input[name=code]'), 3))
            return "Stok Kodu";
        if (!chk.length($('#product-modal input[name=barcode]'), 3))
            return "Barkod";
    }

    function validates() {
        // validations
        var chk = meshop.check;
        /* chk.length($('#product-modal input[name=brand]'), 1), */
        return chk.length($('#product-modal input[name=vat]'), 1), chk.length($('#product-modal input[name=name]'), 3), chk.length(
            $('#product-modal input[name=code]'), 3), chk.length($('#product-modal input[name=barcode]'), 3)
    }

    function mdfJson(json) {
        json.hiddenEye = json.hidden ? "fa-eye-slash" : "fa-eye";
        return json;
    }

    // /Filter////
    // SELECT OR DESELECT ALL OF PRODUCT AND CHANGE DELETE BTN//
    var del = $('#removeProduct');
    del.addClass("disabled");
    var selectall = $('#selectall');
    selectall.parent().click(function (e) {
        if (selectall.hasClass('fa-check-square-o')) {
            check(selectall);
            check($(".selected"));
            del.addClass("disabled");
        } else {
            uncheck(selectall);
            uncheck($(".selected"));
            del.removeClass("disabled");
        }

        function check(obj) {
            obj.addClass("fa-square-o").removeClass("fa-check-square-o");
        }

        function uncheck(obj) {
            obj.removeClass("fa-square-o").addClass("fa-check-square-o");
        }
    });

    $("#hidden-switch-div").find('input[name=hidden]').on("change", function (e) {
        if ($(this).prop('checked')) {
            $("#ProductListTable").meshop({
                url: "/crawler/json/products/load",
                params: {
                    removed: false,
                    hidden: true
                },
                loop: loop,
                page: $('[data-id=productList_page]'),
                pageWidth: 10,
                filterForm: $('#filter-form'),
                modifyJson: mdfJson
            })
        } else {
            $("#ProductListTable").meshop({
                url: "/crawler/json/products/load",
                params: {
                    removed: false,
                    hidden: false
                },
                loop: loop,
                page: $('[data-id=productList_page]'),
                pageWidth: 10,
                filterForm: $('#filter-form'),
                modifyJson: mdfJson
            })
        }

    });

    // / ON modal close
    $('#product-modal').on('hidden.bs.modal', function () {
        meshop.refresh($("#product-modal"));
    })

}); // end document ready
