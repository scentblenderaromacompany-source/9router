const fs = require('fs');
const path = './open-sse/providers/registry';
const files = fs.readdirSync(path);

let filesWithIssues = [];
let filesMissingTextIcon = [];
let filesMissingModelInfo = [];

files.forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(`${path}/${file}`, 'utf8');
    const match = content.match(/export default ({.*?});/s);
    if (match) {
      try {
        const provider = eval('(' + match[1] + ')');
        
        let hasIssues = false;
        let issues = [];
        
        // Check for textIcon
        if (!provider.display?.textIcon) {
          filesMissingTextIcon.push(file);
          hasIssues = true;
          issues.push('Missing textIcon in display');
        }
        
        // Check models
        if (provider.models) {
          provider.models.forEach((model, index) => {
            if (!model.name) {
              hasIssues = true;
              issues.push(`Model ${index} (${model.id}) missing name`);
            }
            if (!model.capabilities) {
              hasIssues = true;
              issues.push(`Model ${index} (${model.id}) missing capabilities`);
            }
            if (!model.params) {
              hasIssues = true;
              issues.push(`Model ${index} (${model.id}) missing params`);
            }
          });
        }
        
        if (hasIssues) {
          filesWithIssues.push({
            file,
            id: provider.id,
            issues
          });
        }
      } catch (e) {
        console.error('Error parsing', file, e);
      }
    }
  }
});

console.log('Files missing textIcon:', filesMissingTextIcon.length);
console.log('Files with model info issues:', filesWithIssues.length);
console.log('Sample files with issues:', filesWithIssues.slice(0, 10));
