from Acquisition import aq_inner, aq_parent
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.layout.viewlets import common
from plone.app.layout.viewlets import content
from plone.app.layout.viewlets.common import ViewletBase

class SiteActionsViewlet(common.SiteActionsViewlet):
    render = ViewPageTemplateFile('templates/vsf_siteactions.pt')
        
