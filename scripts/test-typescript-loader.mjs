import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

export async function load(url,context,nextLoad){
 if(!url.startsWith('file:')||!new URL(url).pathname.endsWith('.ts'))return nextLoad(url,context);
 const source=await readFile(new URL(url),'utf8');
 const result=ts.transpileModule(source,{
  fileName:fileURLToPath(url),reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,inlineSourceMap:true,inlineSources:true},
 });
 const errors=result.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error)??[];
 if(errors.length)throw new SyntaxError(ts.formatDiagnostics(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>process.cwd(),getNewLine:()=> '\n'}));
 return {format:'module',source:result.outputText,shortCircuit:true};
}
