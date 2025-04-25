import * as fs from 'fs';
import * as path from 'path';

const base = fs.readFileSync(path.join(__dirname, '../prisma/base.prisma'), 'utf-8');
const modelsDir = path.join(__dirname, '../prisma/models');

const models = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.prisma'))
    .map(f => fs.readFileSync(path.join(modelsDir, f), 'utf-8'));

const finalSchema = [base, ...models].join('\n\n');

fs.writeFileSync(path.join(__dirname, '../prisma/schema.prisma'), finalSchema);
console.log('✅ Merged Prisma schema generated.');
