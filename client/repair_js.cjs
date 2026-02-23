const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function repairJs(content) {
    return content
        // Fix broken ternaries: condition ? value ,  -> condition ? value : null ,
        // This matches things like: ? someValue , or ? someValue }
        .replace(/\?\s*([^:?]+)\s*(?=[,}\)])/g, (match, p1) => {
            // If it's already a complete ternary (contains a colon at the same level), don't touch it.
            // But the regex above specifically looks for NO colon in the capture group.
            // However, it might be part of a larger expression.
            // Simple heuristic: if it contains a colon, it's probably fine.
            if (p1.includes(':')) return match;
            return `? ${p1.trim()} : null`;
        })
        // Remove remaining TS-like types in JS files (e.g., <{ email?; ... }>)
        .replace(/<\{[\s\S]*?\}>(?=\s*[({])/g, '')
        // Remove as any, as string etc again just in case
        .replace(/\s+as\s+\w+/g, '')
        // Remove : type in arrows and functions that might have been missed
        .replace(/:\s*(string|number|boolean|any|object|void|null|undefined)(\[\])?(?=[\s\),=])/g, '')
        // Remove generic arrows like const f = <T>(...)
        .replace(/<\s*T\s*>(?=\s*\()/g, '')
        // Remove interface and type again just in case
        .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
        .replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '')
        // Remove React.FC<...> again
        .replace(/React\.FC<.*?>/g, 'React.FC')
        // Remove <HTMLDivElement, ...> and similar common TS generic pairs
        .replace(/<[A-Z]\w+(,\s*[A-Z]\w+)*>/g, '')
        // Fix { asChild? } occurrences
        .replace(/\{\s*asChild\?\s*\}/g, '{ asChild }')
        // Fix optional properties like email?
        .replace(/(\w+)\?(?=:|}|,)/g, '$1')
        ;
}

const targetDir = path.join(process.cwd(), 'src');
walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = repairJs(content);
        if (content !== fixed) {
            console.log(`Fixing: ${filePath}`);
            fs.writeFileSync(filePath, fixed, 'utf8');
        }
    }
});
