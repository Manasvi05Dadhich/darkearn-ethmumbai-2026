const fs = require('fs');
const path = require('path');

const contracts = ['BountyEscrow', 'ReputationNFT', 'SkillRegistry'];
const outDir = path.join(__dirname, 'contracts', 'out');
const abiDir = path.join(__dirname, 'frontend', 'src', 'contracts', 'abi');

for (const name of contracts) {
    const src = path.join(outDir, `${name}.sol`, `${name}.json`);
    const data = JSON.parse(fs.readFileSync(src, 'utf8'));
    fs.writeFileSync(path.join(abiDir, `${name}.json`), JSON.stringify(data.abi, null, 2));
    console.log(`Extracted ABI: ${name} (${data.abi.length} entries)`);
}
