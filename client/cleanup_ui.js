const fs = require('fs');
const path = require('path');

const uiDir = 'c:/Users/panka/Downloads/qcws-inspection-main (2)/qcws-inspection-main/inspectiq/client/src/components/ui';

const toPascalCase = (str) => {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

fs.readdirSync(uiDir).forEach(file => {
    if (!file.endsWith('.jsx')) return;

    const filePath = path.join(uiDir, file);
    let content = fs.readFileSync(filePath, 'utf8');


    content = content.replace(/import \* from "react"/g, 'import * as React from "react"');


    content = content.replace(/import \* from "@radix-ui\/react-([\w-]+)"/g, (match, p1) => {
        const primitiveName = toPascalCase(p1) + 'Primitive';
        return `import * as ${primitiveName} from "@radix-ui/react-${p1}"`;
    });


    content = content.replace(/React\.forwardRef,?\s*(?:React\.ComponentPropsWithoutRef<[^>]+>|[\w\s&{}|,]+)?\s*>\(/g, 'React.forwardRef(');


    content = content.replace(/,\s*type\s+[\w]+\s*/g, '');
    content = content.replace(/\{\s*type\s+[\w]+\s*,/g, '{');


    content = content.replace(/\(\s*{\s*([^}]+)\s*}\s*:\s*[^)]+\)/g, '({ $1 })');


    content = content.replace(/\(([\w\s,{}]+):\s*[\w\s<>[\]|&{}]+(\s*)\)/g, '($1$2)');


    content = content.replace(/export\s*{\s*type\s+[\w]+,\s*/g, 'export { ');
    content = content.replace(/export\s*{\s*type\s+[\w]+\s*}/g, '');

    fs.writeFileSync(filePath, content);
    console.log(`Cleaned up ${file}`);
});
