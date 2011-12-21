from five import grok
from Acquisition import aq_inner
from Products.CMFCore.utils import getToolByName
from plone.app.layout.navigation.interfaces import INavigationRoot
from vsf.memberarea.interfaces import IMemberArea


class Dashboard(grok.View):
    grok.context(INavigationRoot)
    grok.layer(IMemberArea)
    grok.require('zope2.View')
    grok.name('dashboard')

    def update(self):
        if self.member_info():
            mtool = getToolByName(self.context, 'portal_membership')
            member = mtool.getAUtehnticatedMember()
            home_folder = member.getHomeFolder().absolute_url()
            return self.request.response.redirect(
                home_folder+'/@@profile-dashboard')

    def member_info(self):
        context = aq_inner(self.context)
        mtool = getToolByName(context, 'portal_membership')
        if not mtool.isAnonymousUser():
            member = mtool.getAuthenticatedMember()
            return member
