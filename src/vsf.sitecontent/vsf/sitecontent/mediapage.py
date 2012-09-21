import math
from five import grok
from Acquisition import aq_inner
from zope.component import getMultiAdapter

from plone.directives import dexterity, form

from plone.namedfile.interfaces import IImageScaleTraversable

from plone.app.textfield import RichText

from Products.CMFCore.utils import getToolByName

from plone.app.blob.interfaces import IATBlobImage

from vsf.sitecontent import MessageFactory as _


class IMediaPage(form.Schema, IImageScaleTraversable):
    """
    A page with automatic galleries.
    """
    text = RichText(
        title=_(u"Text"),
        required=True
    )


class MediaPage(dexterity.Container):
    grok.implements(IMediaPage)


class View(grok.View):
    grok.context(IMediaPage)
    grok.require('zope2.View')
    grok.name('view')

    def update(self):
        self.has_images = len(self.contained_images()) > 0

    def contained_images(self):
        context = aq_inner(self.context)
        catalog = getToolByName(context, 'portal_catalog')
        results = catalog(object_provides=IATBlobImage.__identifier__,
                          path=dict(query='/'.join(context.getPhysicalPath()),
                                    depth=1))
        return results

    def image_list(self):
        images = self.contained_images()
        data = []
        for item in images:
            info = {}
            info['title'] = item.Title
            thumb = self.getImageTag(item, scalename='thumb')
            info['thumb_url'] = thumb['url']
            info['thumb_width'] = thumb['width']
            info['thumb_height'] = thumb['height']
            original = self.getImageTag(item, scalename='original')
            info['original_url'] = original['url']
            info['original_width'] = original['width']
            info['original_height'] = original['height']
            data.append(info)
        return data

    def image_matrix(self):
        items = self.image_list()
        count = len(items)
        rowcount = count / 2.0
        rows = math.ceil(rowcount)
        matrix = []
        for i in range(int(rows)):
            row = []
            for j in range(2):
                index = 2 * i + j
                if index <= int(count - 1):
                    cell = {}
                    cell['item'] = items[index]
                    row.append(cell)
            matrix.append(row)
        return matrix

    def getImageTag(self, item, scalename):
        obj = item.getObject()
        scales = getMultiAdapter((obj, self.request), name='images')
        if scalename == 'thumb':
            scale = scales.scale('image', width=200, height=200)
        else:
            scale = scales.scale('image', width=800, height=800)
        item = {}
        if scale is not None:
            item['url'] = scale.url
            item['width'] = scale.width
            item['height'] = scale.height
        return item
