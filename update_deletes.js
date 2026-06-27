const fs = require('fs');
const glob = require('glob'); // Note: we can just use native fs recursion if glob isn't installed. Let's use native fs.

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = dir + '/' + file;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else {
      if (filePath.endsWith(filter)) results.push(filePath);
    }
  });
  return results;
}

const files = findFiles('./src/app/(admin)/dashboard', 'page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // A regex to match confirmDelete function and its body
  // It usually looks like:
  // const confirmDelete = async () => {
  //   if (!itemToDelete) return;
  //   try {
  //     await api.delete(...);
  //     fetchStuff();
  //   } catch (err) {
  //     ...
  //   } finally {
  //     ...
  //   }
  // };

  // This is tricky to regex perfectly. Let's try replacing specific try/catch blocks in confirmDelete.
  
  const regex = /const confirmDelete = async \(\) => \{\s+if \(!(\w+)\) return;\s+try \{\s+await (api\.delete\([^)]+\));\s+([^}]+)\s+\} catch \([^)]+\) \{\s+console\.error[^;]+;\s+(?:alert\([^)]+\);\s+)?(?:throw err;\s+)?\}\s+(?:finally \{\s+setDeleteModalOpen\(false\);\s+\}\s+)?\};/g;

  content = content.replace(regex, (match, item, apiCall, fetchCall) => {
    return `const confirmDelete = async () => {
    if (!${item}) return;
    await ${apiCall};
    ${fetchCall.trim()}
  };`;
  });
  
  // for those without finally, or with a different finally
  const regex2 = /const confirmDelete = async \(\) => \{\s+if \(!(\w+)\) return;\s+try \{\s+await (api\.delete\([^)]+\));\s+([^}]+)\s+\} catch \([^)]+\) \{\s+console\.error[^;]+;\s+(?:alert\([^)]+\);\s+)?(?:throw err;\s+)?\}(?:\s+finally \{\s+setDeleteModalOpen\(false\);\s+\})?\s+\};/g;

  content = content.replace(regex2, (match, item, apiCall, fetchCall) => {
    return `const confirmDelete = async () => {
    if (!${item}) return;
    await ${apiCall};
    ${fetchCall.trim()}
  };`;
  });

  fs.writeFileSync(file, content);
});

console.log("Done");
