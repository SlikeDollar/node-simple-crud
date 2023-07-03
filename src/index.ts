import * as dotenv from 'dotenv';
import { App } from './app/app';

dotenv.config();
console.log(process.env.PORT);

new App();
