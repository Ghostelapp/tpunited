// Use the project's compiler even when Node was built without native TS support.
import {register} from 'node:module';
register('./test-typescript-loader.mjs',import.meta.url);
