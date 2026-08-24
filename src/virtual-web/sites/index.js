// The general virtual web: every ordinary site the player can reach from TRACE
// Search or by typing a domain into the address bar.
//
// Adding a site means adding one entry to one of these data files and nothing
// else — the resolver, the search index and the renderer all read this list.
// See "31サイト目を追加する" in README.md.

import { newsSites } from './newsSites.js'
import { portalSites } from './portalSites.js'
import { techSites } from './techSites.js'
import { knowledgeSites } from './knowledgeSites.js'
import { qaSites } from './qaSites.js'
import { blogSites } from './blogSites.js'
import { forumSites } from './forumSites.js'
import { softwareSites } from './softwareSites.js'
import { mediaSites } from './mediaSites.js'
import { civicSites } from './civicSites.js'
import { commerceSites } from './commerceSites.js'
import { utilitySites } from './utilitySites.js'
import { closedSites } from './closedSites.js'

export const virtualWebSites = Object.freeze([
  ...portalSites,
  ...newsSites,
  ...techSites,
  ...knowledgeSites,
  ...qaSites,
  ...blogSites,
  ...forumSites,
  ...softwareSites,
  ...mediaSites,
  ...civicSites,
  ...commerceSites,
  ...utilitySites,
  ...closedSites
])

const sitesByDomain = new Map(virtualWebSites.map((site) => [site.domain, site]))
const sitesById = new Map(virtualWebSites.map((site) => [site.id, site]))

export function getSiteByDomain(domain){
  return sitesByDomain.get(String(domain ?? '').toLowerCase()) || null
}

export function getSiteById(id){
  return sitesById.get(id) || null
}

export function isVirtualWebDomain(domain){
  return sitesByDomain.has(String(domain ?? '').toLowerCase())
}
