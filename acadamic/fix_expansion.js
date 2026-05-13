const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync('data/' + file, 'utf8');
  // The file has: ...original content... };,\n    "NewPhase": { ... };\n
  // We need: ...original content (without },), "NewPhase": { ... } };\n
  // Find the };,\n pattern and just remove the };,
  c = c.replace(/};,\n\s{4}"/, '},\n    "');
  // Now it ends with: ...original content... },\n    "NewPhase": {...}\n    },\n    "NewPhase2": {...}\n};\n
  // But the first } closes the courseData.swift object. We need it to NOT close.
  // Actually now the file has }, before the new phases, which means the object is closed.
  // We need to remove that closing brace so the new phases are part of the object.
  // Replace the pattern: closing of last phase\n}, (closing courseData.swift)\n    "NewPhase" (trying to add to closed obj)
  // With: closing of last phase,\n    "NewPhase" (keep object open)
  // The issue is identifying which } is closing the last phase vs closing the object.
  
  // Looking at the structure:
  //     }     <-- closing last phase object (e.g., "Advanced Swift": { ... })
  // },        <-- was };, now }, -- this } closes courseData.swift object, comma invalid
  //     "NewPhase": {  <-- new content
  
  // We need to remove ONE level of closing. The first } closes the last phase, 
  // the second } (from },) closes courseData.swift. We need to keep the first } and
  // remove the second }, adding a comma to the first }.
  
  // Pattern: "            }" followed by newline followed by "},"
  // The file has: \n    }\n},\n    "NewPhase"
  // We need: \n    },\n    "NewPhase"
  
  c = c.replace(/\n    }\n},\n    "/, '\n    },\n    "');
  
  fs.writeFileSync('data/' + file, c, 'utf8');
  console.log('Fixed ' + file);
}

fixFile('swift.js');
fixFile('kt.js');
fixFile('rust.js');
fixFile('py.js');
console.log('Done');
