import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
}

const SITE_NAME = 'TireLink'
const DEFAULT_DESCRIPTION = 'Find and book professional tire shops in seconds. Transparent pricing, verified reviews, and seamless scheduling for domestic and import vehicles.'
const DEFAULT_IMAGE = '/icons.svg'

export function SEO({ title, description, image }: SEOProps) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Expert Tire Service, Precisely Linked`

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description || DEFAULT_DESCRIPTION)
    setMeta('og:title', title || SITE_NAME)
    setMeta('og:description', description || DEFAULT_DESCRIPTION)
    setMeta('og:image', image || DEFAULT_IMAGE)
    setMeta('og:type', 'website')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title || SITE_NAME)
    setMeta('twitter:description', description || DEFAULT_DESCRIPTION)
  }, [title, description, image])

  return null
}
