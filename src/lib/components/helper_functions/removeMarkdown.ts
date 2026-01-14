export function removeMarkdown(text: string) {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
        .replace(/!<!--LATEXDISPLAY1ffefb370d76483b90b62abe05ff088b--><!--LATEXINLINEd4681ad749544637a4d877e0a69bd211-->/g, '')
        .replace(/<!--LATEXDISPLAY3c0d2346237f42988c7352071ea758ca--><!--LATEXINLINE6c5d940be27b413b9947ec4a5b7bdf37-->/g, '$1')
        .replace(/^\s*>\s?/gm, '')
        .replace(/^\s*[-*+] ?/gm, '')
        .replace(/^\s*\d+\. ?/gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}