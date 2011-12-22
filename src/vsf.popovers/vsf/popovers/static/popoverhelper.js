/*jslint white:false, onevar:true, undef:true, nomen:false, eqeqeq:true,
   plusplus:true, bitwise:true, regexp:false, newcap:true, immed:true,
   strict:false, browser:true */
/*global jQuery:false, $:false, document:false, window:false, location:false,
  common_content_filter:false, TinyMCEConfig:false */


var CURRENT_OVERLAY_TRIGGER = null;
var menu_offset;
var menu_size = 'menu';
var common_content_filter = '#content>*:not(div.configlet),dl.portalMessage.error,dl.portalMessage.info';

(function ($) {
    var Browser = {},
        loadUploader;

    // jquery method to load an overlay
    $.fn.loadOverlay = function(href, data, callback) {
        $(document).trigger('startLoadOverlay', [this, href, data]);
        var self = $(this),
            $overlay = this.closest('.pb-ajax');

        if(self.length === 0){
            $overlay = $('div.overlay-ajax:visible div.pb-ajax');
            self = $overlay;
        }
        self.load(href, data, function () {
            $overlay[0].handle_load_inside_overlay.apply(this, arguments);
            if (callback !== undefined) {
                callback.apply(this, arguments);
            }
            $(document).trigger('endLoadOverlay', [this, href, data]);
        });
        return this;
    };

    $().ready(function () {
        $('a.overlayUpload').prepOverlay({
            subtype: 'ajax',
            filter: common_content_filter,
            // Add this to a link or button to make it close the overlay e.g.
            // on cancel without reloading the page
            closeselector: '.overlayCloseAction',
            formselector: 'form.overlayForm,form.edit-form',
            noform: 'redirect',
            cssclass:'workspace-popup',
            config: {
                closeOnClick: false,
                top: 130,
                mask: {
                    color: '#000000',
                    opacity: 0.8
                },
                onLoad: function (e) {
                    loadUploader();
                    $(document).trigger('loadOverlay', [this, e]);
                    return true;
                },
                onClose: function (e) {
                    CURRENT_OVERLAY_TRIGGER = null;
                    $(document).trigger('closeOverlay', [this, e]);
                    return true;
                }
            },
            redirect: function () {
                return location.href
            }
        });
        $('a.popoverView').prepOverlay({
            subtype: 'ajax',
            filter: common_content_filter,
            // Add this to a link or button to make it close the overlay e.g.
            // on cancel without reloading the page
            closeselector: 'a.closePopover',
            cssclass:'popover-view',
            config: {
                closeOnClick: false,
                top: 130,
                mask: {
                    color: '#000000',
                    opacity: 0.8
                },
                onLoad: function (e) {
                    mapsGoogleMaps.init();
                    $(document).trigger('loadOverlay', [this, e]);
                    return true;
                },
                onClose: function (e) {
                    CURRENT_OVERLAY_TRIGGER = null;
                    $(document).trigger('closeOverlay', [this, e]);
                    return true;
                }
            },
            redirect: function () {
                return location.href
            }
        });
        $('a.popoverForm').prepOverlay({
            subtype: 'ajax',
            filter: common_content_filter,
            // Add this to a link or button to make it close the overlay e.g.
            // on cancel without reloading the page
            closeselector: '[name=form.button.Cancel], [name=form.buttons.cancel]',
            formselector: 'form.overlayForm,form.edit-form, form',
            noform: 'redirect',
            cssclass:'popover-view',
            config: {
                closeOnClick: false,
                top: 130,
                mask: {
                    color: '#000000',
                    opacity: 0.8
                },
                onLoad: function (e) {
                    $(document).trigger('loadOverlay', [this, e]);
                    return true;
                },
                onClose: function (e) {
                    CURRENT_OVERLAY_TRIGGER = null;
                    $(document).trigger('closeOverlay', [this, e]);
                    return true;
                }
            },
            redirect: function () {
                return location.href
            }
        });
        $('a.popoverPreview').prepOverlay({
            subtype: 'iframe',
            filter: common_content_filter,
            // Add this to a link or button to make it close the overlay e.g.
            // on cancel without reloading the page
            closeselector: 'a.closePopover',
            cssclass:'popover-view',
            config: {
                closeOnClick: false,
                top: 130,
                mask: {
                    color: '#000000',
                    opacity: 0.8
                },
                onLoad: function (e) {
                    $(document).trigger('loadOverlay', [this, e]);
                    return true;
                },
                onClose: function (e) {
                    CURRENT_OVERLAY_TRIGGER = null;
                    $(document).trigger('closeOverlay', [this, e]);
                    return true;
                }
            },
            redirect: function () {
                return location.href
            }
        });
        
        $(document).bind('beforeAjaxClickHandled', function(event, ele, api, clickevent){
            if(ele === CURRENT_OVERLAY_TRIGGER){
                return event.preventDefault();
            }else{
                if(CURRENT_OVERLAY_TRIGGER !== null){
                    var overlays = $('div.overlay:visible');
                    overlays.fadeOut(function(){ $(this).remove(); });
                }
                CURRENT_OVERLAY_TRIGGER = ele;
                
            }
        });

        $("a.popoverView, a.overlayUpload, a.overlayForm").live('click', function(){
            $(document).trigger('overlayLinkClicked', [this]);
            var url = $(this).attr("href");
            $(this).closest('#overlay-content').loadOverlay(url + ' ' + common_content_filter);
            return false;
        });
    });


    // workaround this MSIE bug :
    // https://dev.plone.org/plone/ticket/10894
    if (jQuery.browser.msie) {jQuery("#settings").remove();}
    Browser = {};
    // Browser.onUploadComplete = function() {
    //     window.location.reload();
    // }
    loadUploader = function() {
        var ulContainer = jQuery('.uploaderContainer');
        ulContainer.each(function(){
            var uploadUrl =  jQuery('.uploadUrl', this).val(),
                uploadData =  jQuery('.uploadData', this).val(),
                UlDiv = jQuery(this);
            jQuery.ajax({
                type: 'GET',
                url: uploadUrl,
                data: uploadData,
                dataType: 'html',
                contentType: 'text/html; charset=utf-8',
                success: function (html) {
                    UlDiv.html(html);
                }
            });
        });
    };
    jQuery(document).ready(loadUploader);

}(jQuery));

/**
 * Initialize tinymce
 */
$(document).bind('loadInsideOverlay', function() {
    $('textarea.mce_editable').each(function() {
        var config = new TinyMCEConfig($(this).attr('id'));
        config.init();
    });
});

/**
 *
 * JQuery Helpers for Plone Quick Upload
 *
 */

var PloneQuickUpload = {};

PloneQuickUpload.addUploadFields = function (uploader, domelement, file, id, fillTitles, fillDescriptions) {
    var blocFile,
        labelfiledescription,
        labelfiletitle;

    if (fillTitles || fillDescriptions) {
        blocFile = uploader._getItemByFileId(id);
        if (typeof id === 'string') {
            // If the string begins with any other value, the radix for
            // parseInt is 10 (decimal)
            id = parseInt(id.replace('qq-upload-handler-iframe', ''), 10);
        }
    }
    if (fillDescriptions)  {
        labelfiledescription = jQuery('#uploadify_label_file_description').val();

        jQuery('.qq-upload-cancel', blocFile).after(
            '<div class="uploadField">' +
            '  <label for="description_' + id + '">' + labelfiledescription + '</label>' +
            '    <textarea rows="2"' +
            '        class="file_description_field"' +
            '        id="description_' + id + '"' +
            '        name="description"' +
            '        value="" />' +
            '</div>');
    }
    if (fillTitles)  {
        labelfiletitle = jQuery('#uploadify_label_file_title').val();

        jQuery('.qq-upload-cancel', blocFile).after(
            '<div class="uploadField">' +
            '  <label for="title_' + id + '">' + labelfiletitle + '</label>' +
            '  <input type="text"' +
            '         class="file_title_field"' +
            '         id="title_' + id + '"' +
            '         name="title"' +
            '         value="' + file.fileName + '" />' +
            '</div>');
    }
    PloneQuickUpload.showButtons(uploader, domelement);
};

PloneQuickUpload.showButtons = function (uploader, domelement) {
    var handler = uploader._handler;
    if (handler._files.length) {
        jQuery('.uploadifybuttons', jQuery(domelement).parent()).show();
        return 'ok';
    }
    return false;
};

PloneQuickUpload.sendDataAndUpload = function (uploader, domelement, typeupload) {
    var handler = uploader._handler,
        files = handler._files,
        missing = 0,
        id,
        fileContainer,
        fillTitles,
        fillDescriptions,
        file_title,
        file_description;

    jQuery('.uploadifybuttons', jQuery(domelement).parent())
        .find('input')
        .attr({disabled: 'disabled', opacity: 0.8});

    for (id = 0; id < files.length; id += 1) {
        if (files[id]) {
            fileContainer = jQuery('.qq-upload-list li', domelement)[id - missing];
            file_title = '';
            file_description = '';
            if (fillTitles) {
                file_title = jQuery('.file_title_field', fileContainer).val();
            }
            if (fillDescriptions) {
                file_description = jQuery('.file_description_field', fileContainer).val();
            }
            uploader._queueUpload(id, {'title': file_title, 'description': file_description, 'typeupload' : typeupload});
        }
        // if file is null for any reason jq block is no more here
        else {
            missing += 1;
        }
    }
    jQuery('.uploadifybuttons', jQuery(domelement).parent()).hide();
    jQuery('.uploadifybuttons', jQuery(domelement).parent()).find('input').removeAttr('disabled').attr('opacity', 1);
};

PloneQuickUpload.onAllUploadsComplete = function(uploader){
    //$("div.pb-ajax").loadOverlay(uploader._options.container_url);
    Browser.onUploadComplete();
};

PloneQuickUpload.clearQueue = function(uploader, domelement) {
    var handler = uploader._handler,
        files = handler._files,
        id;

    for (id = 0; id < files.length; id+=1) {
        if (files[id]) {
            handler.cancel(id);
        }
        jQuery('.qq-upload-list li', domelement).remove();
        handler._files = [];
        if (typeof handler._inputs !== 'undefined') {
            handler._inputs = {};
        }
    }
    jQuery('.uploadifybuttons', jQuery(domelement).parent()).hide();
};

PloneQuickUpload.onUploadComplete = function (uploader, domelement, id, fileName, responseJSON) {
    var uploadList = jQuery('.qq-upload-list', domelement);
    if (responseJSON.success) {
        window.setTimeout(function () {
            jQuery(uploader._getItemByFileId(id)).remove();
            // after the last upload, if no errors, reload the page
            var newlist = jQuery('li', uploadList);
            if (! newlist.length) {
                PloneQuickUpload.onAllUploadsComplete(uploader);
            }
        }, 50);
    }

};
