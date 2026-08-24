// Which template renders which site. A site data file picks one by name in its
// `template` field; unknown names fall back to the generic blog layout.

import BlogTemplate from './BlogTemplate.vue'
import CivicTemplate from './CivicTemplate.vue'
import ClosedTemplate from './ClosedTemplate.vue'
import ForumTemplate from './ForumTemplate.vue'
import MediaTemplate from './MediaTemplate.vue'
import NewsTemplate from './NewsTemplate.vue'
import PortalTemplate from './PortalTemplate.vue'
import QaTemplate from './QaTemplate.vue'
import RetroBlogTemplate from './RetroBlogTemplate.vue'
import ShopTemplate from './ShopTemplate.vue'
import SoftwareTemplate from './SoftwareTemplate.vue'
import UtilityTemplate from './UtilityTemplate.vue'
import WikiTemplate from './WikiTemplate.vue'

export const WEB_TEMPLATES = Object.freeze({
  news: NewsTemplate,
  portal: PortalTemplate,
  blog: BlogTemplate,
  'retro-blog': RetroBlogTemplate,
  forum: ForumTemplate,
  qa: QaTemplate,
  wiki: WikiTemplate,
  civic: CivicTemplate,
  media: MediaTemplate,
  shop: ShopTemplate,
  utility: UtilityTemplate,
  software: SoftwareTemplate,
  closed: ClosedTemplate
})

export function templateFor(site){
  if(site.status === 'closed') return ClosedTemplate
  return WEB_TEMPLATES[site.template] || BlogTemplate
}
