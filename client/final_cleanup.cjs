const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fullCleanup(content) {
    return content
        // Remove multi-line interfaces
        .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
        // Remove single line interfaces or exports
        .replace(/export\s+interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '')
        .replace(/interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '')
        // Remove types
        .replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '')
        // Remove : React.FC<...> or : React.FC
        .replace(/:\s*React\.FC(<.*?>)?/g, '')
        // Remove useState<...>
        .replace(/useState<.*?>/g, 'useState')
        // Remove other generics <T, ...> except for React.forwardRef which we handled manually or need to be careful with
        // But in JS, we should just remove them.
        .replace(/React\.forwardRef<[\s\S]*?>/g, 'React.forwardRef')
        .replace(/React\.ElementRef<[\s\S]*?>/g, 'React.ElementRef')
        .replace(/React\.ComponentProps<[\s\S]*?>/g, 'React.ComponentProps')
        // Remove as any, as string etc
        .replace(/\s+as\s+[A-Z]\w+/g, '')
        // Remove inline type annotations in functions/arrows
        // Match : type but not followed by : (to avoid ternaries)
        // This is risky, but we'll try common types: string, number, boolean, any, object, void, null, undefined, Event, FormEvent etc.
        .replace(/:\s*(string|number|boolean|any|object|void|null|undefined|Date|Event|FormEvent|KeyboardEvent|MouseEvent|React\.\w+)(\[\])?(?=[\s\),=])/g, '')
        // Fix broken ternaries manually fixed already in some files but script might find others
        .replace(/\?\s*([^:?]+)\s*(?=[,}\)])/g, (match, p1) => {
            if (p1.includes(':')) return match;
            return `? ${p1.trim()} : null`;
        })
        // Fix { asChild? } or { asChild: boolean }
        .replace(/\{\s*asChild\?\s*\}/g, '{ asChild }')
        .replace(/\{\s*asChild:\s*boolean\s*\}/g, '{ asChild }')
        // Fix optional props in objects
        .replace(/(\w+)\?(?=:|}|,)/g, '$1')
        ;
}

const targetDir = path.join(process.cwd(), 'src');
walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleaned = fullCleanup(content);
        if (content !== cleaned) {
            console.log(`Cleaning: ${filePath}`);
            fs.writeFileSync(filePath, cleaned, 'utf8');
        }
    }
});
