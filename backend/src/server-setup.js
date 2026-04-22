/**
 * server-setup.js
 * 
 * Script de configuração para inicializar narrativas Twine
 * Deve ser chamado durante startup do servidor
 * 
 * Uso:
 * import { initializeNarratives } from './server-setup.js';
 * 
 * // Na função de startup:
 * await initializeNarratives();
 */

import GameController from './controllers/GameController.js';

/**
 * Inicializar todas as narrativas Twine
 * @returns {Promise<Object>} Narrativas carregadas
 */
export async function initializeNarratives() {
  console.log('\n📖 Inicializando narrativas Twine...\n');
  
  try {
    const narratives = await GameController.initialize();
    console.log('\n✅ Narrativas carregadas com sucesso!\n');
    return narratives;
  } catch (error) {
    console.error('\n❌ Erro ao carregar narrativas:\n', error);
    console.error('\nVerifique:');
    console.error('  1. Se o diretório "backend/narratives" existe');
    console.error('  2. Se os ficheiros .twine são válidos JSON');
    console.error('  3. Se todas as passages têm um "target" válido');
    throw error;
  }
}

/**
 * Exemplo de uso em index.js (servidor Express)
 * 
 * import { initializeNarratives } from './server-setup.js';
 * 
 * const app = express();
 * 
 * // ... middleware setup ...
 * 
 * // ANTES de iniciar o servidor
 * try {
 *   await initializeNarratives();
 * } catch (error) {
 *   process.exit(1); // Parar se narrativas não carregarem
 * }
 * 
 * app.listen(PORT, () => {
 *   console.log(`🎮 Servidor rodando em http://localhost:${PORT}`);
 * });
 */

export default initializeNarratives;
