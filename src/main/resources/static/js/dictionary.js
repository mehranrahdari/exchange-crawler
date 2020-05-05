$(document).ready(function () {
    var elstart, elend;
    $("#table").meshop({
        url: "/json/dictionary/load",
        loop: loop,
        page: $('[data-id=productList_page]'),
        pageWidth: 10,
        filterForm: $('#filter-form')
    }).on("render", function (e, json, robj) {

        $("#sortable").sortable({
            revert: true,
            start: function (event, ui) {
                elstart = ui.item;
                var start_pos = ui.item.index();
                ui.item.data('start_pos', start_pos);
            },
            change: function (event, ui) {
                var start_pos = ui.item.data('start_pos');
                var index = ui.placeholder.index();
                if (start_pos < index) {
                    $('#sortable tr:nth-child(' + index + ')').addClass('highlights');
                } else {
                    $('#sortable tr:eq(' + (index + 1) + ')').addClass('highlights');
                }

                elend = ui.placeholder;
            },
            update: function (event, ui) {
                $('#sortable tr').removeClass('highlights');

                var json = {
                    indexes: [],
                    ids: []
                };
                $('#sortable tr.ui-state-default').each(function (i, itm) {
                    json.indexes.push(i);
                    json.ids.push($(itm).data("id"));
                });

                $.ajax({
                    contentType: 'application/json',
                    data: JSON.stringify(json),
                    success: function (data) {
                        meshop.log("success", "Saved!");
                        meshop.refresh($("#table"));
                    },
                    error: function (err) {
                        meshop.log("error", "Error on saving", "Error");
                    },
                    complete: function () {
                    },
                    processData: false,
                    type: 'POST',
                    url: "/json/dictionary/allwords/save"
                });

            }
        }).disableSelection();

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
            $.post("/json/dictionary/remove", {
                id: $(this).data('id')
            }).done(function (data) {
                meshop.log("success", "Removed!");
                $("#modal").modal("hide");
                meshop.refresh($("#table"));
            }).fail(function (e) {
                meshop.log("error", "Error on saving", "Error");
            });

        });

        obj.find(".btnpreview").click(function (e) {
            e.stopPropagation();
            // get calc vat by product id
            $("#modal").modal("show").meshop({
                url: "/json/dictionarybyid/load",
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
        productdetailshtm = "";
        $("#modal").modal("show").meshop({
            // default value for new product modal
            json: {
                tr: "",
                fa: ""
            }
        })
    });

    /* SAVE PRODUCT */
    $("#save").on("click", function () {

        var prm = $("#frm").serialize();
        $.post("/json/dictionary/save", prm).done(function (saveId) {

            meshop.log("success", "Saved!");
            $("#modal").modal("hide");
            meshop.refresh($("#table"));
        }).fail(function (e) {
            meshop.log("error", "Error on saving", "Error");
        });

    });

});
