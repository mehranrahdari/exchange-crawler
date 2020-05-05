$(document).ready(function () {
    var elstart, elend;
    $("#table").meshop({
        url: "/json/productcosttype/load",
        loop: loop,
        page: $('[data-id=productList_page]'),
        pageWidth: 10,
        filterForm: $('#filter-form'),
        modifyJson: function (json) {
            json.trclass = "default";
            if (!json.active)
                json.trclass = "danger";
            return json;
        }
    }).on("render", function (e, json, robj) {


    });

    function loop(obj, json) {
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

        /* DELETE PRODUCT */
        obj.find(".btnremove").on("click", function () {
            $.post("/json/productcosttype/remove", {
                id: $(this).data('id')
            }).done(function (data) {
                meshop.log("success", "Removed!");
                $("#modal").modal("hide");
                meshop.refresh($("#table"));
            }).fail(function (e) {
                meshop.log("error", "Error on saving", "Error");
            });

        });

        obj.click(function (e) {
            e.stopPropagation();
            // get calc vat by product id
            $("#modal").modal("show").meshop({
                url: "/json/productcosttypebyid/load",
                params: {
                    id: json.id
                },
                modifyJson: function (json) {
                    return json;
                }
            }).on('render', function (robj, rjson) {

            });
        });
    }

    $("#addnew").on("click", function (e) {
        e.preventDefault();
        $("#modal").modal("show").meshop({
            // default value for new product modal
            json: {
                id: "",
                title: "",
                titlefa: ""
            }
        })
    });

    /* SAVE */
    $("#save").on("click", function () {

        var prm = $("#frm").serialize();
        $.post("/json/productcosttype/save", prm).done(function (saveId) {

            meshop.log("success", "Saved!");
            $("#modal").modal("hide");
            meshop.refresh($("#table"));
        }).fail(function (e) {
            meshop.log("error", "Error on saving", "Error");
        });

    });

});
