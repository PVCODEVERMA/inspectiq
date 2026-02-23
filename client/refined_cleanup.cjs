const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function cleanContent(content) {
    return content
        // Remove : React.FC, : Record<...>, : any, etc.
        .replace(/:\s*(React\.FC(<.*?>)?|Record<.*?>|string|number|boolean|any|object|void|null|undefined|Date|Event|FormEvent|KeyboardEvent|MouseEvent|React\.\w+)(\[\])?(?=[\s\),=;!])/g, '')
        // Remove useState<...>
        .replace(/useState<.*?>/g, 'useState')
        // Remove interfaces and types (even multi-line)
        .replace(/(export\s+)?interface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '')
        .replace(/(export\s+)?type\s+\w+\s*=\s*[\s\S]*?;/g, '')
        // Remove as T
        .replace(/\s+as\s+[A-Z]\w+(<.*?>)?/g, '')
        // Remove generic arrows
        .replace(/<\s*T\s*>(?=\s*\()/g, '')
        // Fix broken optional chaining from previous scripts (e.g., profile? .full_name -> profile?.full_name)
        .replace(/(\w+)\?\s*\.\s*/g, '$1?.')
        // Fix broken optional props (e.g., asChild? -> asChild)
        .replace(/(\w+)\?(?=:|}|,|\s)/g, '$1')
        // Remove leftover TS types in generics like <HTMLDivElement, ...>
        .replace(/<[A-Z]\w+(,\s*[A-Z]\w+)*>/g, '')
        // VERY CAREFUL: Fix broken ternaries (missing : null)
        // Only if it really looks like a ternary: condition ? value followed by , or } or )
        // AND there is NO colon later on the same line/block.
        // Instead of auto-fixing, let's just find and REMOVE any ": null" that was added incorrectly.
        // Wait, some ": null" are correct.
        .replace(/\?\s*[^:?]+\s*:\s*null\s*:\s*null/g, (m) => m.replace(/:\s*null\s*:\s*null/, ': null'))
        ;
}

const targetDir = path.join(process.cwd(), 'src');
walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const cleaned = cleanContent(content);
        if (content !== cleaned) {
            console.log(`Cleaning: ${filePath}`);
            fs.writeFileSync(filePath, cleaned, 'utf8');
        }
    }
});
