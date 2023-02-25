const replaceReg = /([&<>"'])/g;
const replaceMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
};

function encodeHTML(source) {
    return source == null
        ? ''
        : (source + '').replace(replaceReg, function (str, c) {
            return replaceMap[c];
        });
}

function createElementOpen(name, attrs) {
    const attrsStr = [];
    if (attrs) {
        // eslint-disable-next-line
        for (let key in attrs) {
            const val = attrs[key];
            let part = key;
            // Same with the logic in patch.
            if (val === false) {
                continue;
            }
            else if (val !== true && val != null) {
                part += `="${val}"`;
            }
            attrsStr.push(part);
        }
    }
    return `<${name} ${attrsStr.join(' ')}>`;
}

function createElementClose(name) {
    return `</${name}>`;
}

export function vNodeToString(el, newline) {
    const S = newline ? '\n' : '';
    function convertElToString(el) {
        const {children, tag, attrs, text} = el;
        return createElementOpen(tag, attrs)
            + (tag !== 'style' ? encodeHTML(text) : text || '')
            + (children ? `${S}${children.map(child => convertElToString(child)).join(S)}${S}` : '')
            + createElementClose(tag);
    }
    return convertElToString(el);
}

export function parseSvg(svgStr, width, height, regionPath) {
    if (!regionPath) {
        return svgStr
    } else {
        const tempElement = document.createElement('div')
        tempElement.innerHTML = regionPath;
        const svg = tempElement.querySelector('svg')
        const svgBase64 = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)))
        const image = document.createElement('image')
        image.setAttribute('width', svg.getAttribute('width'))
        image.setAttribute('height', svg.getAttribute('height'))
        image.setAttribute('xlink:href', svgBase64)
        svg.appendChild(image)
        return svg
    }
}
