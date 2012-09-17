from five import grok
from plone.directives import dexterity, form

from plone.namedfile.interfaces import IImageScaleTraversable

from plone.app.textfield import RichText

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
