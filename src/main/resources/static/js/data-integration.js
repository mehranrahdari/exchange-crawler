$(document).ready(function () {
    var boutiqueid = $("boutique").data("id");
    $(".trenderaboutique").meshop({
        json: {boutiqueid: boutiqueid}
    });

    $(".createjsonfile").on("click", function (e) {
        e.preventDefault();
        var trenderaBoutique = $("[name=sourceBoutique]").select2('data');
        var btn = $(this);
        btn.addClass("loading");
        var ser = "boutiqueid=" + boutiqueid + "&crawlfinished=true&allpages=true&columns=id,barcode,code,faname," +
            "fasaleprice,famarketprice,inventory,vat,typeid,color,size,brandid,boutiqueid," +
            "details,uid,isbaseprod,srcurl,images"; /*+
 				"&columnstr=id,Barcode,Product Code,Farsi Name,Saleprice Iran,Marketprice Iran,Inventory," +
 				"VAT,Type ID,Color Name,Size Name,Brand ID,Boutique ID,ProductDetails,UID,isbaseprod,SourceUrl,Image"*/ //+
        //"&trenderaBoutiqueID=" + trenderaBoutique.id + "&trenderaBoutiqueName=" + trenderaBoutique.name

        $.post("/json/crawler/createjsonfile", ser, function (data) {
            meshop.log("success", "file created successfully!");
            if (data.url)
                $(".link").removeClass("hidden").prop("href", data.url);
        }).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

    $('[name=sourceBoutique]').on("change", function (e) {
        console.log(e.added.pic);

        $("#btkimg").removeClass("hidden").prop("src", "http://localhost:8081/images/boutiques/" + e.added.pic + ".jpg");
        $("#btkname").removeClass("hidden").html(e.added.name);
        /* if (e.removed) {// e.removed.id e.removed.text e.added.text
            catalogfilterManager.addOrRemove(e.removed.id,"CategoryType",false);
        }
        if (e.added) {
            catalogfilterManager.addOrRemove(e.added.id,"CategoryType",true);
        }
        catalogfilterManager.apply();*/
    });
});