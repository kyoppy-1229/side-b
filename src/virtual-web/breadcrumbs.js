// Breadcrumb trails for virtual site pages, derived from the path and the
// site's own category list.

import { categoryLabel } from './pages.js'

export function buildBreadcrumbs(site, page){
  const trail = [{ label: site.shortName || site.name, path: '/' }]
  if(!page || page.path === '/') return trail

  const categorySlug = site.categories.find((category) => category.label === page.category)?.slug
  const monthMatch = page.path.match(/^\/archive\/(\d{4})\/(\d{2})$/)
  const yearMatch = page.path.match(/^\/archive\/(\d{4})$/)
  const categoryMatch = page.path.match(/^\/category\/([^/]+)$/)

  if(categoryMatch){
    trail.push({ label: categoryLabel(site, decodeURIComponent(categoryMatch[1])) })
    return trail
  }

  if(page.path === '/archive'){
    trail.push({ label: 'アーカイブ' })
    return trail
  }

  if(yearMatch){
    trail.push({ label: 'アーカイブ', path: '/archive' })
    trail.push({ label: `${yearMatch[1]}年` })
    return trail
  }

  if(monthMatch){
    trail.push({ label: 'アーカイブ', path: '/archive' })
    trail.push({ label: `${monthMatch[1]}年`, path: `/archive/${monthMatch[1]}` })
    trail.push({ label: `${Number(monthMatch[2])}月` })
    return trail
  }

  if(page.path.startsWith('/tags/')){
    trail.push({ label: `タグ: ${decodeURIComponent(page.path.slice(6))}` })
    return trail
  }

  if(categorySlug) trail.push({ label: page.category, path: `/category/${categorySlug}` })
  else if(page.category) trail.push({ label: page.category })

  trail.push({ label: page.heading || page.title })
  return trail
}
