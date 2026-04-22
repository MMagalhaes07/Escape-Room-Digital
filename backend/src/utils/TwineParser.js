/**
 * TwineParser.js
 * 
 * Converte ficheiros Twine JSON para estrutura de jogo compatível
 * com o sistema de narrativa do Escape Room Digital
 * 
 * Formato Twine esperado:
 * - passages[]: array de cenas/nós
 * - cada passage tem: pid, name, text, links[], tags
 * - links[] contêm: linkText, target, empathyScore, risk, consequence
 */

class TwineParser {
  /**
   * Parse um ficheiro Twine JSON completo
   * @param {Object} twineData - Dados do ficheiro Twine em formato JSON
   * @returns {Object} Estrutura de narrativa compatível com GameController
   */
  static parseTwineNarrative(twineData) {
    if (!twineData || !twineData.passages) {
      throw new Error('Ficheiro Twine inválido: faltam passages');
    }

    const narrative = {
      title: twineData.name || 'Narrativa sem título',
      description: this.extractDescription(twineData.passages),
      initialScene: this.findInitialScene(twineData.passages),
      scenes: {},
      puzzles: [],
      metadata: {
        ifid: twineData.ifid,
        creator: twineData.creator,
        formatVersion: twineData.formatVersion
      }
    };

    // Converter cada passage em cena
    twineData.passages.forEach(passage => {
      narrative.scenes[passage.name] = this.parsePassage(passage);
    });

    // Extrair puzzles
    narrative.puzzles = this.extractPuzzles(twineData.passages);

    return narrative;
  }

  /**
   * Parse uma passage individual
   * @param {Object} passage - Passage do Twine
   * @returns {Object} Cena formatada
   */
  static parsePassage(passage) {
    return {
      title: passage.name,
      text: passage.text,
      choices: this.parseChoices(passage.links || []),
      tags: passage.tags ? passage.tags.split(', ') : [],
      puzzle: passage.puzzle || null,
      metadata: {
        pid: passage.pid,
        isSafe: !passage.tags?.includes('warning')
      }
    };
  }

  /**
   * Converter links Twine em choices de jogo
   * @param {Array} links - Array de links
   * @returns {Array} Array de escolhas formatadas
   */
  static parseChoices(links) {
    return links.map(link => ({
      text: link.linkText,
      nextScene: link.target,
      empathyScore: link.empathyScore || 50,
      risk: link.risk || 'none',
      consequence: link.consequence || 'none'
    }));
  }

  /**
   * Encontrar a cena inicial (tagged com 'start')
   * @param {Array} passages - Array de passages
   * @returns {String} Nome da cena inicial
   */
  static findInitialScene(passages) {
    const startPassage = passages.find(p => 
      p.tags && p.tags.includes('start')
    );
    return startPassage ? startPassage.name : (passages[0]?.name || 'inicio');
  }

  /**
   * Extrair descrição da narrativa
   * @param {Array} passages - Array de passages
   * @returns {String} Descrição
   */
  static extractDescription(passages) {
    const startPassage = passages.find(p => 
      p.tags && p.tags.includes('start')
    );
    return startPassage?.text?.substring(0, 200) || 'Narrativa Twine';
  }

  /**
   * Extrair todos os puzzles da narrativa
   * @param {Array} passages - Array de passages
   * @returns {Array} Array de puzzles
   */
  static extractPuzzles(passages) {
    const puzzles = [];
    
    passages.forEach(passage => {
      if (passage.puzzle) {
        // Procurar a passage correspondente ao puzzle
        const puzzlePassage = passages.find(p => 
          p.name === passage.puzzle || p.tags?.includes(passage.puzzle)
        );

        if (puzzlePassage) {
          puzzles.push({
            id: passage.puzzle,
            scene: passage.name,
            title: `Puzzle: ${passage.puzzle}`,
            description: puzzlePassage.text,
            type: this.detectPuzzleType(puzzlePassage.tags),
            empathyReward: 25
          });
        }
      }
    });

    return puzzles;
  }

  /**
   * Detectar tipo de puzzle baseado em tags
   * @param {String} tags - Tags da passage
   * @returns {String} Tipo de puzzle
   */
  static detectPuzzleType(tags) {
    if (!tags) return 'analysis';
    
    if (tags.includes('emotional_intelligence')) return 'emotional';
    if (tags.includes('analytical')) return 'analysis';
    if (tags.includes('reflective')) return 'reflection';
    if (tags.includes('documentation')) return 'documentation';
    
    return 'analysis';
  }

  /**
   * Validar integridade da narrativa Twine
   * @param {Object} twineData - Dados do Twine
   * @returns {Object} Relatório de validação
   */
  static validateTwine(twineData) {
    const report = {
      valid: true,
      warnings: [],
      errors: []
    };

    // Verificar estrutura básica
    if (!twineData.passages || !Array.isArray(twineData.passages)) {
      report.valid = false;
      report.errors.push('Faltam passages no ficheiro Twine');
      return report;
    }

    if (twineData.passages.length === 0) {
      report.valid = false;
      report.errors.push('Nenhuma passage encontrada');
      return report;
    }

    // Verificar cena inicial
    const hasStart = twineData.passages.some(p => 
      p.tags && p.tags.includes('start')
    );
    if (!hasStart) {
      report.warnings.push('Nenhuma passage marcada com tag "start"');
    }

    // Verificar ligações órfãs
    const passageNames = new Set(twineData.passages.map(p => p.name));
    twineData.passages.forEach(passage => {
      (passage.links || []).forEach(link => {
        if (!passageNames.has(link.target)) {
          report.warnings.push(
            `Ligação órfã em "${passage.name}": "${link.target}" não existe`
          );
        }
      });
    });

    // Contar elementos
    report.stats = {
      passageCount: twineData.passages.length,
      linkCount: twineData.passages.reduce((sum, p) => sum + (p.links?.length || 0), 0),
      puzzleCount: twineData.passages.filter(p => p.puzzle).length,
      tagCount: new Set(
        twineData.passages
          .flatMap(p => (p.tags || '').split(', '))
          .filter(t => t)
      ).size
    };

    return report;
  }

  /**
   * Calcular estatísticas de empatia da narrativa
   * @param {Object} parsedNarrative - Narrativa já parseada
   * @returns {Object} Estatísticas
   */
  static analyzeEmpathyPaths(parsedNarrative) {
    const stats = {
      bestPath: { empathy: 0, scenes: [] },
      worstPath: { empathy: 999, scenes: [] },
      averageEmpathy: 0,
      empathyDistribution: {}
    };

    // Análise recursiva de caminhos (DFS)
    const visited = new Set();
    const paths = [];

    const dfs = (sceneName, empathy, path) => {
      if (visited.has(sceneName)) return;
      visited.add(sceneName);

      const scene = parsedNarrative.scenes[sceneName];
      if (!scene) return;

      path.push(sceneName);
      empathy += (scene.baseEmpathy || 50);

      // Se não há escolhas (cena terminal)
      if (!scene.choices || scene.choices.length === 0) {
        paths.push({ empathy, path: [...path] });
      } else {
        // Explorar cada escolha
        scene.choices.forEach(choice => {
          const choiceEmpathy = empathy + (choice.empathyScore || 0);
          const newPath = [...path];
          dfs(choice.nextScene, choiceEmpathy, newPath);
        });
      }

      visited.delete(sceneName);
    };

    dfs(parsedNarrative.initialScene, 0, []);

    if (paths.length > 0) {
      const empathyScores = paths.map(p => p.empathy);
      stats.bestPath = paths.reduce((a, b) => a.empathy > b.empathy ? a : b);
      stats.worstPath = paths.reduce((a, b) => a.empathy < b.empathy ? a : b);
      stats.averageEmpathy = empathyScores.reduce((a, b) => a + b, 0) / empathyScores.length;

      // Distribuição
      empathyScores.forEach(score => {
        const bucket = Math.floor(score / 10) * 10;
        stats.empathyDistribution[bucket] = (stats.empathyDistribution[bucket] || 0) + 1;
      });
    }

    return stats;
  }

  /**
   * Exportar narrativa parseada para debug
   * @param {Object} narrative - Narrativa parseada
   * @returns {String} JSON formatado
   */
  static exportForDebug(narrative) {
    return JSON.stringify(narrative, null, 2);
  }
}

export default TwineParser;
