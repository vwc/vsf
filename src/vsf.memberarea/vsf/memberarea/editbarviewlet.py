from five import grok
from Acquisition import aq_inner
from plone.app.layout.viewlets.interfaces import IAboveContent
from Products.CMFCore.utils import getToolByName
from Products.CMFCore.interfaces import IContentish

class EditBarViewlet(grok.Viewlet):
    grok.name('vsf.memberarea.EditBarViewlet')
    grok.context(IContentish)
    grok.require('zope2.View')
    grok.viewletmanager(IAboveContent)
    
    def update(self):
        context = aq_inner(self.context)
        mtool = getToolByName(context, 'portal_membership')
        checkPerm = mtool.checkPermission
        if not checkPerm('Review portal content', context):
            # disable Plone's editable border
            self.request.set('disable_border', True)
    
    def render(self):
        return ''