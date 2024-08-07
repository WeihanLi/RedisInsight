import { visit } from 'unist-util-visit'

const permittedAttibutes = [
  'dangerouslySetInnerHTML'
]

const dangerousAttributes = [
  'onabort', 'onafterprint', 'onanimationend', 'onanimationiteration', 'onanimationstart',
  'onbeforeprint', 'onbeforeunload', 'onblur', 'oncancel', 'oncanplay', 'oncanplaythrough',
  'onchange', 'onclick', 'onclose', 'oncontextmenu', 'oncopy', 'oncuechange', 'oncut', 'ondblclick',
  'ondrag', 'ondragend', 'ondragenter', 'ondragexit', 'ondragleave', 'ondragover', 'ondragstart',
  'ondrop', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onfocus', 'onfocusin', 'onfocusout',
  'onformdata', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup',
  'onlanguagechange', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmessage',
  'onmessageerror', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout',
  'onmouseover', 'onmouseup', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpaste',
  'onpause', 'onplay', 'onplaying', 'onpopstate', 'onprogress', 'onratechange', 'onrejectionhandled',
  'onreset', 'onresize', 'onscroll', 'onsearch', 'onseeked', 'onseeking', 'onselect', 'onstalled',
  'onstorage', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'ontransitionend', 'onunhandledrejection',
  'onunload', 'onvolumechange', 'onwaiting', 'onwheel', 'href', 'src', 'action', 'formaction', 'manifest',
  'background', 'poster', 'cite', 'data', 'ping', 'xlink:href', 'style', 'srcdoc', 'sandbox'
].join('|')

// Define an array of potentially dangerous tags
const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'meta']

export const remarkSanitize = (): (tree: Node) => void => (tree: any) => {
  visit(tree, 'html', (node) => {
    const inputTag = node.value.toLowerCase()

    // remove dangerous tags
    if (dangerousTags.some((tag) => inputTag.startsWith(`<${tag}`))) {
      node.value = ''
      return
    }

    // remove permitted attributes
    if (permittedAttibutes.some((attr) => node.value.includes(`${attr}=`))) {
      node.value = ''
      return
    }

    // sanitize dangerous attributes
    const dangerousAttrRegex = new RegExp(`\\s*(${dangerousAttributes})="[^"]*"`, 'gi')
    if (node.value.match(dangerousAttrRegex)) {
      node.value = node.value.replace(dangerousAttrRegex, (match: string) => {
        const attr = match.toLowerCase().trim()
        if (attr.startsWith('href') || attr.startsWith('src') || attr.startsWith('xlink:href')) {
          if (attr.indexOf('"javascript:') > -1) return ''
          return match
        }

        return ''
      })
    }
  })
}
