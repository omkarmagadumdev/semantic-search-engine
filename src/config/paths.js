import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SRC_DIR = path.resolve(__dirname, '..');
export const VIEWS_DIR = path.join(SRC_DIR, 'views');
