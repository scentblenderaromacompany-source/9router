const fs = require('fs');
const path = './open-sse/providers/registry';
const files = fs.readdirSync(path);

let filesToFix = [];
let totalModelsToFix = 0;

files.forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(`${path}/${file}`, 'utf8');
    const match = content.match(/export default ({.*?});/s);
    if (match) {
      try {
        const provider = eval('(' + match[1] + ')');
        
        if (provider.models) {
          provider.models.forEach((model, index) => {
            if (!model.capabilities) {
              filesToFix.push({
                file,
                id: provider.id,
                modelIndex: index,
                modelId: model.id,
                field: 'capabilities'
              });
              totalModelsToFix++;
            }
            if (!model.params) {
              filesToFix.push({
                file,
                id: provider.id,
                modelIndex: index,
                modelId: model.id,
                field: 'params'
              });
              totalModelsToFix++;
            }
          });
        }
      } catch (e) {
        console.error('Error parsing', file, e);
      }
    }
  }
});

console.log('Files to fix:', filesToFix.length);
console.log('Total models to fix:', totalModelsToFix);
console.log('\nSample fixes needed:', filesToFix.slice(0, 20));
