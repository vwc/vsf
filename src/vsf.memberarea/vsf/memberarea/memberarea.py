from five import grok
from Acquisition import aq_inner
from plone.directives import dexterity, form

from zope import schema
from zope.schema.interfaces import IContextSourceBinder
from zope.schema.vocabulary import SimpleVocabulary, SimpleTerm

from zope.interface import invariant, Invalid

from z3c.form import group, field

from plone.namedfile.interfaces import IImageScaleTraversable
from plone.namedfile.field import NamedImage, NamedFile
from plone.namedfile.field import NamedBlobImage, NamedBlobFile

from plone.app.textfield import RichText

from z3c.relationfield.schema import RelationList, RelationChoice
from plone.formwidget.contenttree import ObjPathSourceBinder
from Products.CMFCore.utils import getToolByName
from Products.ATContentTypes.interfaces.file import IFileContent
from plone.app.contentlisting.interfaces import IContentListing
from vsf.memberarea import MessageFactory as _


# Interface class; used to define content-type schema.

class IMemberArea(form.Schema, IImageScaleTraversable):
    """
    A folderish member area used as a home folder
    """
    text = RichText(
        title=_(u"Introductional Text"),
        description=_(u"Optional notes or instructions for your folder."),
        required=False,
    )


class MemberArea(dexterity.Container):
    grok.implements(IMemberArea)


class View(grok.View):
    grok.context(IMemberArea)
    grok.require('zope2.View')
    grok.name('view')

    def update(self):
        self.has_items = len(self.contained_files()) > 0

    def contained_files(self):
        context = aq_inner(self.context)
        catalog = getToolByName(context, 'portal_catalog')
        results = catalog(object_provides=IFileContent.__identifier__,
                          path='/'.join(context.getPhysicalPath()),
                          sort_on='modified')
        return results

    def is_owner(self):
        context = aq_inner(self.context)
        mtool = getToolByName(context, 'portal_membership')
        member = mtool.getAuthenticatedMember()
        if not mtool.isAnonymousUser():
            member = mtool.getAuthenticatedMember()
            owner = context.getOwner()
            return member.getId() == owner.getId()
