export let aiCodeId = 0;

export let streamAbortController: AbortController | null = null;
export let streamingMsgEl: HTMLElement | null = null;
export let streamingFullText = '';

export function setStreamAbortController(s: AbortController | null): void {
    streamAbortController = s;
}

export function setStreamingMsgEl(el: HTMLElement | null): void {
    streamingMsgEl = el;
}

export function setStreamingFullText(t: string): void {
    streamingFullText = t;
}

export function highlightAICode(code: string, lang?: string): string {
    const kw: Record<string, string[]> = {
        js: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','import','export','default','from','async','await','yield','try','catch','finally','throw','typeof','instanceof','in','of','true','false','null','undefined','NaN','delete','void'],
        ts: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','implements','interface','type','enum','import','export','default','from','async','await','yield','try','catch','finally','throw','typeof','instanceof','in','of','true','false','null','undefined','readonly','public','private','protected','static','abstract'],
        py: ['def','return','if','elif','else','for','while','in','not','and','or','is','None','True','False','class','import','from','as','try','except','finally','raise','with','async','await','yield','lambda','pass','break','continue','global','nonlocal','self','super'],
        go: ['func','return','if','else','for','range','switch','case','break','continue','go','defer','select','chan','map','struct','interface','type','package','import','var','const','nil','true','false','make','new','append','len','cap'],
        rs: ['fn','let','mut','if','else','for','while','loop','match','return','pub','struct','enum','impl','trait','use','mod','as','in','ref','self','super','Some','None','Ok','Err','true','false','let','const','static','unsafe','async','await','move','where'],
        cs: ['public','private','protected','internal','static','void','int','string','bool','float','double','var','class','struct','enum','interface','namespace','using','return','if','else','for','foreach','while','do','switch','case','break','continue','new','this','base','virtual','override','abstract','sealed','readonly','const','async','await','try','catch','finally','throw','get','set','value'],
        swift: ['func','var','let','if','else','for','in','while','switch','case','break','continue','return','class','struct','enum','protocol','extension','import','guard','defer','throw','throws','rethrows','catch','async','await','actor','nonisolated','mutating','self','super','nil','true','false'],
    };
    const keywords = kw[lang || ''] || ['const','let','var','function','return','if','else','for','while','class','import','export','true','false','null','undefined','new','this','try','catch'];
    const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const lines = escaped.split('\n');
    return lines.map(line => {
        const tokens: string[] = [];
        let i = 0;
        while (i < line.length) {
            const rest = line.slice(i);
            const sCm = rest.match(/^\/\/.*/);
            if (sCm) { tokens.push('<span class="syn-comment">' + sCm[0] + '</span>'); i += sCm[0].length; continue; }
            const bCm = rest.match(/^\/\*[\s\S]*?\*\//);
            if (bCm) { tokens.push('<span class="syn-comment">' + bCm[0] + '</span>'); i += bCm[0].length; continue; }
            const str = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
            if (str) { tokens.push('<span class="syn-string">' + str[1] + '</span>'); i += str[1].length; continue; }
            const num = rest.match(/^\b(\d+\.?\d*|0x[0-9a-fA-F]+)\b/);
            if (num) { tokens.push('<span class="syn-number">' + num[1] + '</span>'); i += num[1].length; continue; }
            const word = rest.match(/^([a-zA-Z_$][\w$]*)/);
            if (word) {
                if (keywords.includes(word[1])) tokens.push('<span class="syn-keyword">' + word[1] + '</span>');
                else tokens.push(word[1]);
                i += word[1].length;
                continue;
            }
            tokens.push(line[i]);
            i++;
        }
        return tokens.join('');
    }).join('\n');
}

export function escapeAIHtml(text: string): string {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function escapeAIAttr(text: string): string {
    return escapeAIHtml(text)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function safeAIHref(url: string): string {
    const decoded = String(url).replace(/&amp;/g, '&').trim();
    if (/^(https?:|mailto:|#)/i.test(decoded)) return escapeAIAttr(decoded);
    return '';
}

export function formatAIText(text: string): string {
    if (!text) return '';
    const codeBlocks: { lang: string; code: string; safeCode: string; highlighted: string }[] = [];
    const noCode = text.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (_match: string, lang: string, code: string) => {
        const idx = codeBlocks.length;
        const safeCode = escapeAIAttr(code);
        const highlighted = highlightAICode(code, lang);
        codeBlocks.push({ lang, code, safeCode, highlighted });
        return `\x00CODEBLOCK${idx}\x00`;
    });
    const lines = noCode.split('\n');
    let result = '';
    let inList = false;
    const listStack: string[] = [];
    for (let li = 0; li < lines.length; li++) {
        let line = lines[li];
        const trimmed = line.trim();
        const cbPlaceholder = line.match(/^\x00CODEBLOCK(\d+)\x00$/);
        if (cbPlaceholder) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
            const cb = codeBlocks[parseInt(cbPlaceholder[1])];
            result += `<div class="ai-code-wrapper"><pre class="ai-code-block notranslate"><code class="notranslate">${cb.highlighted}</code></pre><button class="ai-run-code notranslate" id="ai-code-${++aiCodeId}" data-code="${cb.safeCode}">Run</button></div>`;
            continue;
        }
        const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (hMatch) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
            const level = hMatch[1].length;
            result += `<h${level} style="font-size:${14 - level}px;color:#f1f5f9;margin:8px 0 4px;font-weight:800;">${inlineFormat(hMatch[2], codeBlocks)}</h${level}>`;
            continue;
        }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
            result += '<hr style="border:none;border-top:1px solid #334155;margin:10px 0;">';
            continue;
        }
        if (trimmed.startsWith('> ')) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
            const content = inlineFormat(trimmed.replace(/^>\s?/, ''), codeBlocks);
            result += `<blockquote style="border-left:3px solid var(--accent);margin:6px 0;padding:4px 10px;color:#94a3b8;font-size:11px;">${content}</blockquote>`;
            continue;
        }
        const listMatch = trimmed.match(/^(\s*[-*+]\s)(.*)$/);
        const orderedMatch = trimmed.match(/^(\s*\d+\.\s)(.*)$/);
        const isListItem = listMatch || orderedMatch;
        if (isListItem) {
            const content = listMatch ? listMatch[2] : orderedMatch![2];
            const tag = listMatch ? 'ul' : 'ol';
            if (!inList) { result += `<${tag} style="margin:4px 0;padding-left:20px;">`; inList = true; listStack.push(tag); }
            result += `<li style="font-size:11px;color:#cbd5e1;margin:2px 0;">${inlineFormat(content, codeBlocks)}</li>`;
            continue;
        }
        if (inList && trimmed === '') {
            result += '</li></ul>'.repeat(listStack.length);
            inList = false;
            listStack.length = 0;
            continue;
        }
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
            const nextLine = lines[li + 1];
            const isSep = nextLine && /^\|[\s:-]+\|/.test(nextLine.trim());
            if (isSep) {
                const headers = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
                const hHtml = headers.map(h => `<th style="padding:4px 8px;text-align:left;color:#f1f5f9;font-size:10px;font-weight:800;border-bottom:2px solid #334155;">${inlineFormat(h, codeBlocks)}</th>`).join('');
                result += `<table style="width:100%;border-collapse:collapse;margin:6px 0;font-size:10px;"><thead><tr>${hHtml}</tr></thead><tbody>`;
                li++;
                while (li + 1 < lines.length) {
                    const rowLine = lines[li + 1].trim();
                    if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
                    li++;
                    const cells = rowLine.split('|').filter(c => c.trim()).map(c => c.trim());
                    const rHtml = cells.map(c => `<td style="padding:4px 8px;color:#94a3b8;font-size:10px;border-bottom:1px solid #1e293b;">${inlineFormat(c, codeBlocks)}</td>`).join('');
                    result += `<tr>${rHtml}</tr>`;
                }
                result += '</tbody></table>';
                continue;
            }
            const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
            const rHtml = cells.map(c => `<td style="padding:3px 6px;font-size:10px;">${inlineFormat(c, codeBlocks)}</td>`).join('');
            result += `<table style="width:100%;border-collapse:collapse;margin:4px 0;"><tr>${rHtml}</tr></table>`;
            continue;
        }
        if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack.length = 0; }
        if (trimmed !== '') {
            result += `<p style="margin:4px 0;">${inlineFormat(trimmed, codeBlocks)}</p>`;
        }
    }
    if (inList) { result += '</li></ul>'.repeat(listStack.length); }
    return result;
}

function inlineFormat(text: string, codeBlocks: { lang: string; code: string; safeCode: string; highlighted: string }[]): string {
    let t = escapeAIHtml(text);
    t = t.replace(/\`([^`]+)\`/g, '<code style="background:#1e293b;color:#a5f3fc;padding:1px 4px;border-radius:3px;font-size:10px;" class="notranslate">$1</code>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#a5f3fc;">$1</strong>');
    t = t.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em style="color:#cbd5e1;">$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match: string, label: string, url: string) => {
        const href = safeAIHref(url);
        if (!href) return label;
        return `<a href="${href}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">${label}</a>`;
    });
    t = t.replace(/\x00CODEBLOCK(\d+)\x00/g, (_match: string, idx: string) => {
        const cb = codeBlocks[parseInt(idx)];
        if (cb) return `<div class="ai-code-wrapper"><pre class="ai-code-block"><code>${cb.highlighted}</code></pre><button class="ai-run-code" id="ai-code-${++aiCodeId}" data-code="${cb.safeCode}">Run</button></div>`;
        return '';
    });
    return t;
}

export function autoGrowAIInput(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

export function removeTypingIndicator(): void {
    const typing = document.getElementById('aiTyping');
    if (typing) typing.remove();
}

export function stopAIStream(): void {
    if (streamAbortController) {
        streamAbortController.abort();
        streamAbortController = null;
    }
    document.getElementById('aiStopBtn')!.style.display = 'none';
    if (streamingMsgEl) {
        const content = streamingMsgEl.querySelector('.streaming-content');
        if (content) {
            const existing = content.innerHTML;
            content.innerHTML = existing + '<span class="streaming-cancelled"> [cancelled]</span>';
        }
        const cursor = streamingMsgEl.querySelector('.streaming-cursor');
        if (cursor) cursor.remove();
        streamingMsgEl.classList.remove('streaming');
        streamingMsgEl = null;
    }
}
