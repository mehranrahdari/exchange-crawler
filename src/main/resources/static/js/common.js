$(function () {

    common = {
        loading: {
            start: function () {
                var progress = $('<div>').attr('id', 'page-progress').html($('<div>').addClass('bubble-loader text-center col-xs-12')
                    .css({
                        "z-index": 99999,
                        bottom: '30px'
                    }).html($('<div/><div/><div/><div/><div/>'))).append($('<img>').attr('src', '/resources/images/logo.png'));

                $('body').append(progress).addClass('body-progress').css({
                    'padding-right': window.innerWidth - $(window).width(),
                    overflow: 'hidden'
                });
            },
            end: function () {
                $('body').removeClass('body-progress').css({"padding-right": ''}, {overflow: ''});
                $('#page-progress').remove();
            }
        },
        init: function (options) {
            this.getHeaderandFooter();
            this.setBasket();
            this.login.setModal();
        },
        getHeaderandFooter: function () {

            // footer ebulten
            $('#post').click(
                function (e) {
                    var inputAds = $('footer input[name=email]');
                    if (meshop.check.email(inputAds)) {

                        $.post("/json/adv/go", {
                            mail: inputAds.val()
                        }, function () {
                            meshop.log("ok", "E-Bülten Başarıyla kaydedildi.");
                        }).fail(function () {
                            meshop.log("fail", "E-Bülten kaydedilirken hata oluştu. Lütfen tekrar deneyeniz");

                        }).always(function () {
                        });

                    } else {
                        if (inputAds.val().length == 0) {

                            var modal = meshop.alert("error", "Lütfen Geçerli Bir E-Posta giriniz  ", "Uyarı ");
                        } else {
                            var modal = meshop.alert("error", inputAds.val()
                                + "<br/> Geçerli E-Posta değil, Lütfen geçerli bir E-Posta adresi giriniz  ", "Uyarı ");
                        }
                    }
                }).closest('.input-group').keyup(function (e) {
                if (e.which == 13) {
                    $('#post').click();
                    $('[data-dismiss=modal]').focus();
                }

            });
            $("header .nav.navbar-nav a.dropdown-toggle ").click(function () {
                if (!meshop.isMobile())
                    window.location = $(this).attr("href");
            });

            setRightNavDropDowns();


            function repoFormatResult(json) {
                var markup = '<div class="row">' + '<div class="col-xs-4"><img src="/images/' + json.pic + '/1.jpg" class="img-responsive" /></div>'
                    + '<div class="col-xs-8" style="font-size: 0.9em;">' + '<div class="row">' + '<div class="col-xs-12">' + json.name + '</div>'
                    + '</div>';

                if (json.barcode) {
                    markup += '<div style="color: #777">' + json.barcode + '</div>';
                }

                markup += '</div></div>';

                return markup;
            }

            $('header #nav-search #search').select2({
                allowClear: true,
                ajax: { // instead of writing the function to execute the
                    // request we use Select2's convenient helper
                    url: "/json/search/product",
                    dataType: 'json',
                    quietMillis: 300,
                    data: function (term, page) {
                        return {
                            s: term, // search term
                            p: page
                            // search term
                        };
                    },
                    results: function (data, page) { // parse the results
                        // into the format
                        // expected by Select2.
                        var more = page < 3; // whether or not there are more
                        // results available
                        // since we are using custom formatting functions we do
                        // not need to alter the remote JSON data
                        return {
                            results: data.content,
                            more: more
                        };
                    },
                    cache: true,

                },
                multiple: true,
                minimumInputLength: 2,
                dropdownCssClass: "bigdrop", // apply css that makes the
                // dropdown taller
                escapeMarkup: function (m) {
                    return m;
                }, // we do not want to escape markup since we are displaying
                // html in results
                formatResult: repoFormatResult,
                formatSelection: function (json) {
                    return json.name
                },
                openOnEnter: false
            });

            $(window).on("resize scroll", function () {
                $('header #nav-search #search').select2("close");
            });
            $('header').click(function (e) {
                $('header #nav-search #search').select2("close");
            });
            $('header #nav-search #search').on("select2-selecting", function (e) {
                e.preventDefault();
                window.location = (meshop.generateUrl(e.choice));
            });
            $('header #nav-search').on("keyup", function (e) {

                if (e.which == 13) {
                    openSearchPage();
                    e.preventDefault();
                }
            });
            $('header #nav-search .search-btn').click(function (e) {
                openSearchPage();
            });

            function openSearchPage() {
                var s = $('header #nav-search .select2-input').val().replace(/[\\/\.:&\?"']/g, "");
                if (s.length > 1 && s != "Ürün Arama")
                    window.location = "/arama/" + s;
            }

            function setRightNavDropDowns() {
                setTimeout(function () {
                    $("header .nav-dropdown-menu").each(function (index, elm) {
                        elm = $(elm);
                        elm.css("right", "inherit");
                        if ((elm.offset().left + elm.width()) > (window.outerWidth - 15)) {
                            elm.css("right", "15px");
                        } else {
                            elm.css("right", "inherit");
                        }
                    });
                }, 1000);
            }

            // fixed-header/////////////////////////////
            $(window).load(function () {
                setTimeout(function () {
                    window.scrollTo(0, 0);
                }, 10);

                var menu = $('header .cat-nav .navbar-static-top');
                var origOffsetY = menu.offset().top + menu.height() - 40;
                var marginTop = menu.height();
                var menuState = 0;
                var menuResize = false;

                function scroll() {
                    if ($(window).scrollTop() > origOffsetY) {
                        if (menuState == 2 || menuState == 0 || menuResize) {
                            // console.log("---------------- "+menuState+" --
                            // "+menuResize+" -- ");

                            var p = $(document).width();
                            var menuWidth = menu.parent().width() + 30;
                            menu.addClass('navbar-fixed-top box-shadow').removeClass('navbar-static-top').css({
                                "width": p + "px",
                                "margin-left": -p / 2 + "px",
                                left: "50%"
                            });
                            // menuState = 1;
                            menuResize = false;
                            $('.cat-nav #nav-search').hide();
                            if (innerWidth > 768)
                                $('.cat-nav  #logo').parent().addClass('col-xs-8').removeClass('col-xs-4');// col-xs-4
                            $('body ').css("margin-top", marginTop + "px");
                            // $( 'header nav div.nav-dropdown-menu').css({
                            // "width" : menuWidth + "px", "margin-left" :
                            // -(menuWidth / 2) + "px"});

                            setRightNavDropDowns();
                        }
                        $('header nav div.nav-dropdown-menu').css({
                            "top": "auto"
                        });
                    } else {
                        if (menuState == 1 || menuState == 0 || menuResize) {
                            // console.log("zzzzzzzzzzzzzzz "+menuState+" --
                            // "+menuResize+" -- ");

                            var menuWidth = menu.parent().width();
                            menu.removeClass('navbar-fixed-top box-shadow').addClass('navbar-static-top').css({
                                "width": menuWidth + "px",
                                "margin-left": -menuWidth / 2 + "px",
                                left: "50%"
                            });
                            // menuState = 2;
                            menuResize = false;
                            $('.cat-nav #nav-search').show();
                            $('.cat-nav  #logo').parent().removeClass('col-xs-8').addClass('col-xs-4');// col-xs-4
                            $('body ').css("margin-top", "0px");
                            // window.scrollTo(0, 0);
                            // $( 'header nav div.nav-dropdown-menu').css({
                            // "width" : menuWidth + "px", "margin-left" :
                            // -(menuWidth / 2) + "px" });
                            setRightNavDropDowns();

                        }

                        function fixDP() {
                            $('header nav div.nav-dropdown-menu').css("top", (menu.offset().top + menu.height()) - $(window).scrollTop() + "px")
                        }

                        setTimeout(fixDP, 1000);
                        fixDP();
                    }
                }

                document.onscroll = scroll;
                setTimeout(function () {
                    menuResize = true;
                    scroll();
                }, 500);
                $(window).resize(function () {
                    menuResize = true;
                    scroll();
                });
            });
            // /////////////////////////////
        },
        setBasket: function (obj) {
            $(window)
                .load(
                    function () {
                        $
                            .get(
                                "/fragments/modal-basket",
                                function (data) {
                                    $("body").append(data);
                                    var basketBtn = $('#basket');
                                    basketBtn.click(function (e) {
                                        basketBtn.addClass('loading');
                                        meshop.refresh($('#basket-modal')).data('init', false);
                                    }).addClass('loading');
                                    $('#basket-modal').meshop({
                                        data: "basket",
                                        get: true,
                                        modifyJson: function (j) {
                                            var sep = meshop.format.sep1000;
                                            j.total.price = sep(j.total.price);
                                            j.items.forEach(function (item) {
                                                item.price = sep(item.price);
                                                item.total = sep(item.total);
                                            });
                                            return j;
                                        }
                                    }).data('init', true);

                                    // function calcPrice(){
                                    //
                                    // var totObj=
                                    // $('#basket-modal
                                    // .alltoplam').text(0);
                                    // $.each($('#basket-modal
                                    // tbody
                                    // tr:not(.meshoptemplate)
                                    // .toplam'),function(i,obj){
                                    // var obj = $(obj);
                                    // var price =
                                    // obj.attr("p")*
                                    // obj.attr("q");
                                    // obj.text(roundNumber(price));
                                    //
                                    // // total price
                                    // var tp = totObj.text();
                                    // totObj.text(roundNumber(eval(tp)+price));
                                    // });
                                    // return totObj.text();
                                    // }

                                    function roundNumber(rnum) {
                                        return rnum.toFixed(2);
                                    }

                                    function loopItems(obj, json) {
                                        obj.find(".removeOrder").one("click", function () {
                                            var id = json.pid;
                                            obj.addClass("danger").fadeOut(function () {
                                                $(this).remove();
                                            });

                                            if (id == $("#inBasket").attr("data-pid")) {

                                                $(".addBasket,#inBasket").toggle();

                                            }

                                            $.post("/json/basket/remove", {
                                                id: json.id
                                            }, function () {
                                                meshop.refresh($('#basket-modal'));
                                            });
                                        });

                                        var timerid, logTimer;
                                        var logRun = true;
                                        obj.find("input.quantity").on("input", function () {
                                            var value = meshop.format.onlyNum($(this).val());
                                            var qty = (value < 1) ? 1 : value;
                                            var max = +json.inventory;
                                            if (+qty > max) {
                                                qty = max;

                                                if (logRun)
                                                    meshop.log("warning", "Bu ürün için En fazla stok <b>" + max + "</b> olduğunu");

                                                logRun = false;
                                                clearTimeout(logTimer);

                                                logTimer = setTimeout(function () {
                                                    logRun = true;
                                                }, 2000);
                                            }

                                            $(this).val(qty);

                                            clearTimeout(timerid);
                                            if (json.qty != qty)
                                                timerid = setTimeout(function () {
                                                    updateQty(json.id, qty);
                                                }, 600);
                                        });

                                        function updateQty(id, qty) {

                                            $.post("/json/basket/update", {
                                                id: id,
                                                qty: qty
                                            }, function () {
                                                meshop.refresh($('#basket-modal'));
                                            });

                                        }

                                        var img = obj.find('img.img-thumbnail');
                                        img.one("mouseover", function () {

                                            img.CloudZoom({
                                                zoomImage: img.attr('src').replace(/\/([0-9]+)\.jpg/, "/z/$1.jpg"),
                                                // zoomSizeMode:"image",
                                                // zoomOffsetX:
                                                // 100,
                                                // zoomOffsetY:
                                                // -150,
                                                zoomWidth: 300,
                                                zoomHeight: 450,
                                                // zoomClass:"meshop-zoom"
                                            });
                                        });

                                    }

                                    $('#basket-modal')
                                        .on("render", function (e, json, modal) {

                                            if (!$(this).data('init')) {
                                                $(this).modal("show")
                                            }

                                            $('#basket').popover('destroy');

                                            modal.find("tbody tr").each(function (i, obj) {
                                                loopItems($(obj), json.items[i]);
                                            });

                                            modal.find(".increment").click(function () {
                                                var qtyInput = $(this).closest(".input-group").find("input");
                                                var value = qtyInput.val();
                                                qtyInput.val(eval(value) + 1).trigger("input");
                                            });

                                            modal.find(".decrement").click(function () {
                                                var qtyInput = $(this).closest(".input-group").find("input");
                                                var value = qtyInput.val();
                                                var newValue = (eval(value) - 1 < 1) ? 1 : eval(value) - 1;
                                                qtyInput.val(newValue).trigger("input");
                                            });

                                            $("#basket-modal button.save-btn").on("click", function () {
                                                $(this).addClass("disabled");
                                                var val = $(this).siblings("input.quantity").val();
                                            });

                                            var pageBasket = $("#basket span");
                                            pageBasket.eq(1).text(json.total.price);
                                            pageBasket.eq(0).text("(" + (json.items.length) + ")");

                                        })
                                        .on(
                                            "empty",
                                            function () {
                                                if (!$(this).data('init')) {
                                                    if (!basketBtn.data('bs.popover')) {
                                                        $('#basket')
                                                            .popover(
                                                                {
                                                                    trigger: 'manual',
                                                                    content: $('.top li').length > 2 ? 'Sepetinizde Ürün bulunmamaktadır'
                                                                        : 'Sepetinizde ürün bulunmamaktadır veya <a href="#login-modal" data-toggle="modal" >giriş </a> yapmanız gerekir',
                                                                    placement: 'bottom',
                                                                    container: 'body',
                                                                    html: true

                                                                }).popover('show');
                                                        $(window).one("click", function () {
                                                            basketBtn.popover('destroy');
                                                        });
                                                    }
                                                    $(this).modal("hide");
                                                }
                                                var pageBasket = $("#basket span");
                                                pageBasket.eq(1).text("0");
                                                pageBasket.eq(0).text("(0)");

                                            }).on("fail", function () {

                                    }).on("always", function () {
                                        basketBtn.removeClass('loading').addClass('in');
                                    });

                                });

                    });
        },
        login: {
            setModal: function () {
                $(window).load(function () {
                    if ($('.top li').length > 2)
                        return;
                    $.get("/fragments/modal-login", function (data) {
                        $("body").append(data);
                        $("#login-modal #loginBtn").on("click", function () {
                            post();
                        });
                        $("#login-modal").keydown(function (e) {
                            if (e.which == 13) {
                                post();
                            }
                        });

                        function post() {
                            $("#login-modal #loginBtn").addClass('loading');
                            $.post(location.protocol + "//" + location.host + "/signin", $('#login-modal form').serialize(), function (data) {
                                location.reload();
                            }).fail(function (e) {
                                $("#login-modal #loginBtn").removeClass('loading');
                                switch (e.responseText) {
                                    case '0':
                                        var uInput = $("#login-modal [name=u]");
                                        meshop.alert("Bu ePosta adresi site'de kayıtlı değil.", "Hata", "Kapat");
//									meshop.check.inValidate(uInput);
//									uInput.one("input", function() {
//										meshop.check.clearValidate(uInput);
//									});
                                        break;
                                    case '1':
                                        var pInput = $("#login-modal [name=p]").val('');
                                        meshop.alert("Şifre doğru değil", "Hata", "Kapat");
//									meshop.check.inValidate(pInput);
//									pInput.one("input", function() {
//										meshop.check.clearValidate(pInput);
//									});
                                        break;
                                    case undefined:
                                        meshop.alert("Hata, lütfen yeniden deneyin");
                                        break;
                                }
                            });
                        }

                        $("#login-modal .modal-footer .btn").click(function () {
                            $(this).addClass('loading');
                        });
                        $("#login-modal").one("show.bs.modal", function () {
                            var curPage = document.URL.split("/");

                            if (curPage[curPage.length - 1] != "checkout" && curPage[curPage.length - 1] != "sepet")
                                $("#buy-without-login").remove();
                        });
                    });

                });
            },
            showModal: function () {
                $('#login-modal').modal('show');
            },
            isLogin: function () {
                return $('.top li').length > 2;
            }
        }

    }


});
