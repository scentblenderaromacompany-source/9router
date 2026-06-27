const fs = require('fs');
const path = './open-sse/providers/registry';
const files = fs.readdirSync(path);

let filesUpdated = [];
let totalModelsFixed = 0;

function getDefaultCapabilities(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes('image') || id.includes('vision')) {
    return ["text", "vision", "tools"];
  }
  if (id.includes('tts') || id.includes('speech')) {
    return ["text", "audio"];
  }
  if (id.includes('stt') || id.includes('transcription')) {
    return ["audio", "text"];
  }
  if (id.includes('embedding')) {
    return ["text"];
  }
  if (id.includes('video')) {
    return ["text", "video"];
  }
  if (id.includes('music')) {
    return ["text", "audio"];
  }
  if (id.includes('search') || id.includes('web')) {
    return ["text", "web"];
  }
  return ["text", "tools"];
}

function getDefaultParams(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes('image')) {
    return ["size", "quality", "background", "image_detail", "output_format"];
  }
  if (id.includes('tts') || id.includes('speech')) {
    return ["voice", "speed", "format"];
  }
  if (id.includes('stt') || id.includes('transcription')) {
    return ["language", "response_format", "temperature", "prompt"];
  }
  if (id.includes('embedding')) {
    return ["encoding_format"];
  }
  if (id.includes('video')) {
    return ["resolution", "duration", "fps"];
  }
  if (id.includes('music')) {
    return ["duration", "style", "instrument"];
  }
  if (id.includes('search') || id.includes('web')) {
    return ["query", "max_results", "filter"];
  }
  return ["temperature", "max_tokens", "top_p"];
}

function fixFile(file) {
  const content = fs.readFileSync(`${path}/${file}`, 'utf8');
  const match = content.match(/export default ({.*?});/s);
  if (!match) return false;
  
  try {
    const provider = eval('(' + match[1] + ')');
    let hasChanges = false;
    
    if (provider.models) {
      provider.models.forEach((model, index) => {
        if (!model.capabilities) {
          model.capabilities = getDefaultCapabilities(model.id);
          hasChanges = true;
          totalModelsFixed++;
        }
        if (!model.params) {
          model.params = getDefaultParams(model.id);
          hasChanges = true;
          totalModelsFixed++;
        }
      });
    }
    
    if (hasChanges) {
      const newContent = content.replace(
        /export default ({.*?});/s,
        `export default ${JSON.stringify(provider, null, 2)};`
      );
      fs.writeFileSync(`${path}/${file}`, newContent);
      return true;
    }
  } catch (e) {
    console.error('Error fixing', file, e);
  }
  return false;
}

console.log('Fixing provider registry files...');

files.forEach(file => {
  if (file.endsWith('.js')) {
    const updated = fixFile(file);
    if (updated) {
      filesUpdated.push(file);
    }
  }
});

console.log('\n=== SUMMARY ===');
console.log('Files updated:', filesUpdated.length);
console.log('Total models fixed:', totalModelsFixed);
console.log('\nUpdated files:', filesUpdated);
