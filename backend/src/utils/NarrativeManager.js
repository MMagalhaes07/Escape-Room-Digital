/**
 * NarrativeManager.js
 * 
 * Gerencia carregamento dinâmico de narrativas Twine
 * Suporta cache, validação e hot-reloading em desenvolvimento
 */

import fs from 'fs';
import path from 'path';
import TwineParser from './TwineParser.js';

class NarrativeManager {
  constructor(narrativeDir = path.join(__dirname, '../../narratives')) {
    this.narrativeDir = narrativeDir;
    this.cache = new Map();
    this.metadata = new Map();
    this.loadedAt = null;
  }

  /**
   * Carregar todas as narrativas do diretório
   * @returns {Promise<Object>} Mapa de narrativas
   */
  async loadAllNarratives() {
    try {
      if (!fs.existsSync(this.narrativeDir)) {
        console.warn(`Diretório de narrativas não encontrado: ${this.narrativeDir}`);
        return {};
      }

      const files = fs.readdirSync(this.narrativeDir)
        .filter(f => f.endsWith('.twine') || f.endsWith('.twine.json'));

      const narratives = {};

      for (const file of files) {
        try {
          const scenarioKey = this.extractScenarioKey(file);
          const narrative = await this.loadNarrative(file);
          narratives[scenarioKey] = narrative;
          console.log(`✓ Narrativa carregada: ${scenarioKey}`);
        } catch (error) {
          console.error(`✗ Erro ao carregar ${file}:`, error.message);
        }
      }

      this.loadedAt = new Date();
      return narratives;
    } catch (error) {
      console.error('Erro ao carregar narrativas:', error);
      return {};
    }
  }

  /**
   * Carregar uma narrativa específica
   * @param {String} filename - Nome do ficheiro
   * @returns {Promise<Object>} Narrativa parseada
   */
  async loadNarrative(filename) {
    // Verificar cache
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    const filePath = path.join(this.narrativeDir, filename);

    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const twineData = JSON.parse(rawData);

      // Validar
      const validation = TwineParser.validateTwine(twineData);
      if (!validation.valid) {
        throw new Error(`Ficheiro Twine inválido: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn(`Avisos ao carregar ${filename}:`, validation.warnings);
      }

      // Parse
      const narrative = TwineParser.parseTwineNarrative(twineData);

      // Análise pedagógica
      const analysis = TwineParser.analyzeEmpathyPaths(narrative);

      narrative.analysis = analysis;

      // Cache
      this.cache.set(filename, narrative);
      this.metadata.set(filename, {
        loadedAt: new Date(),
        size: rawData.length,
        validation,
        analysis
      });

      return narrative;
    } catch (error) {
      console.error(`Erro ao parsejar ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Extrair chave do cenário do nome do ficheiro
   * scenario_1_school.twine → scenario_1
   * @param {String} filename
   * @returns {String} Chave do cenário
   */
  extractScenarioKey(filename) {
    const match = filename.match(/scenario_(\d+)/);
    return match ? `scenario_${match[1]}` : filename.replace(/\.(twine|json)$/, '');
  }

  /**
   * Obter narrativa pelo ID de cenário
   * @param {String} scenarioId - ex: 'scenario_1'
   * @returns {Object} Narrativa ou null
   */
  getNarrative(scenarioId) {
    // Procurar no cache
    for (const [key, narrative] of this.cache) {
      if (this.extractScenarioKey(key) === scenarioId) {
        return narrative;
      }
    }
    return null;
  }

  /**
   * Recarregar narrativas (para desenvolvimento hot-reload)
   * @returns {Promise<Object>} Narrativas recarregadas
   */
  async reload() {
    this.cache.clear();
    this.metadata.clear();
    console.log('Narrativas limpas do cache. Recarregando...');
    return this.loadAllNarratives();
  }

  /**
   * Obter informações de uma cena específica
   * @param {String} scenarioId - ID do cenário
   * @param {String} sceneName - Nome da cena
   * @returns {Object} Dados da cena
   */
  getScene(scenarioId, sceneName) {
    const narrative = this.getNarrative(scenarioId);
    if (!narrative || !narrative.scenes[sceneName]) {
      return null;
    }
    return narrative.scenes[sceneName];
  }

  /**
   * Obter todas as cenas de um cenário
   * @param {String} scenarioId
   * @returns {Object} Mapa de cenas
   */
  getScenes(scenarioId) {
    const narrative = this.getNarrative(scenarioId);
    return narrative ? narrative.scenes : {};
  }

  /**
   * Verificar se uma cena existe
   * @param {String} scenarioId
   * @param {String} sceneName
   * @returns {Boolean}
   */
  sceneExists(scenarioId, sceneName) {
    const scene = this.getScene(scenarioId, sceneName);
    return scene !== null;
  }

  /**
   * Obter todas as escolhas de uma cena
   * @param {String} scenarioId
   * @param {String} sceneName
   * @returns {Array} Escolhas disponíveis
   */
  getChoices(scenarioId, sceneName) {
    const scene = this.getScene(scenarioId, sceneName);
    return scene ? scene.choices : [];
  }

  /**
   * Validar um caminho completo de cenas
   * @param {String} scenarioId
   * @param {Array} scenePath - Sequência de cenas
   * @returns {Object} Relatório de validação
   */
  validatePath(scenarioId, scenePath) {
    const report = {
      valid: true,
      errors: [],
      totalEmpathy: 0
    };

    const narrative = this.getNarrative(scenarioId);
    if (!narrative) {
      report.valid = false;
      report.errors.push(`Cenário não encontrado: ${scenarioId}`);
      return report;
    }

    for (let i = 0; i < scenePath.length; i++) {
      const sceneName = scenePath[i];
      const scene = narrative.scenes[sceneName];

      if (!scene) {
        report.valid = false;
        report.errors.push(`Cena não encontrada: ${sceneName}`);
        continue;
      }

      // Se não é a última cena, verificar se há transição válida
      if (i < scenePath.length - 1) {
        const nextScene = scenePath[i + 1];
        const hasValidChoice = scene.choices.some(c => c.nextScene === nextScene);

        if (!hasValidChoice) {
          report.valid = false;
          report.errors.push(
            `Transição inválida: ${sceneName} → ${nextScene}`
          );
        }
      }
    }

    return report;
  }

  /**
   * Obter estatísticas de uma narrativa
   * @param {String} scenarioId
   * @returns {Object} Estatísticas
   */
  getStats(scenarioId) {
    const narrative = this.getNarrative(scenarioId);
    if (!narrative) return null;

    const stats = {
      title: narrative.title,
      sceneCount: Object.keys(narrative.scenes).length,
      puzzleCount: narrative.puzzles.length,
      totalChoices: Object.values(narrative.scenes).reduce((sum, scene) => 
        sum + (scene.choices?.length || 0), 0
      ),
      averageEmpathy: narrative.analysis?.averageEmpathy || 0,
      bestPathEmpathy: narrative.analysis?.bestPath?.empathy || 0,
      worstPathEmpathy: narrative.analysis?.worstPath?.empathy || 0
    };

    return stats;
  }

  /**
   * Listar todas as narrativas carregadas
   * @returns {Array} Chaves das narrativas
   */
  listNarratives() {
    const keys = new Set();
    for (const filename of this.cache.keys()) {
      keys.add(this.extractScenarioKey(filename));
    }
    return Array.from(keys);
  }

  /**
   * Exportar narrativa para debugging/edição
   * @param {String} scenarioId
   * @returns {String} JSON formatado
   */
  exportNarrative(scenarioId) {
    const narrative = this.getNarrative(scenarioId);
    return narrative ? JSON.stringify(narrative, null, 2) : null;
  }

  /**
   * Obter metadados de carregamento
   * @returns {Object} Informações sobre carregamento
   */
  getLoadingMetadata() {
    return {
      loadedAt: this.loadedAt,
      cacheSize: this.cache.size,
      narratives: this.listNarratives(),
      metadata: Object.fromEntries(this.metadata)
    };
  }
}

export default NarrativeManager;
